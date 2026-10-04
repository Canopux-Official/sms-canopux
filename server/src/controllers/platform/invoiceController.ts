// server/src/controllers/platform/invoiceController.ts
//
// Full invoice lifecycle for the platform admin: list, view, edit line items/discount/tax/dates,
// issue, mark paid, void, and download as PDF. Every money field is ALWAYS recomputed from
// `items` + discount% + tax% on save — the client never gets to send a total directly.
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Invoice from '../../models/Invoice';
import Organization from '../../models/Organization';
import Subscription from '../../models/Subscription';
import { createInvoiceDocument, serializeInvoice } from '../../services/billingService';
import { PAYMENT_EPSILON, computeInvoiceTotals, invoiceAmountPaid, invoiceBalanceDue, roundMoney, syncInvoicePaymentState } from '../../utils/billing';
import { renderInvoicePdf } from '../../utils/invoicePdf';
import { isBlank, parseDate } from '../../utils/parseInput';

const isValidId = (id: string) => mongoose.Types.ObjectId.isValid(id);

const syncPaymentState = syncInvoicePaymentState;

interface PaymentInput {
    amount?: unknown;
    paidAt?: unknown;
    paymentMethod?: unknown;
    paymentReference?: unknown;
    note?: unknown;
}

/**
 * Adds one payment to the (in-memory) invoice and re-syncs its status. Returns an error message,
 * or null on success. Without `amount` the whole remaining balance is recorded. Does NOT save.
 */
const applyPayment = (invoice: any, input: PaymentInput): string | null => {
    if (invoice.status === 'void') return 'A void invoice cannot take payments';
    if (!invoice.total || invoice.total <= 0) return 'This invoice has no amount to pay';
    if (invoice.status === 'paid' && (invoice.payments || []).length === 0) return 'This invoice is already fully paid';

    const balance = invoiceBalanceDue({ status: 'issued', total: invoice.total, payments: invoice.payments });
    if (balance <= PAYMENT_EPSILON) return 'This invoice is already fully paid';

    const amount = isBlank(input.amount) ? balance : roundMoney(Number(input.amount));
    if (!Number.isFinite(amount) || amount <= 0) return 'Payment amount must be greater than 0';
    if (amount > balance + PAYMENT_EPSILON) return `Payment cannot exceed the balance due (${balance})`;

    if (invoice.status === 'draft') invoice.status = 'issued';
    invoice.payments.push({
        amount,
        paidAt: parseDate(input.paidAt) || new Date(),
        method: typeof input.paymentMethod === 'string' ? input.paymentMethod.trim().slice(0, 60) : '',
        reference: typeof input.paymentReference === 'string' ? input.paymentReference.trim().slice(0, 100) : '',
        note: typeof input.note === 'string' ? input.note.trim().slice(0, 300) : '',
    } as any);
    syncPaymentState(invoice);
    return null;
};

// GET /platform/organizations/:id/invoices
export const listInvoicesForOrganization = async (req: Request, res: Response) => {
    try {
        const orgId = String(req.params.id);
        if (!isValidId(orgId)) return res.status(400).json({ success: false, message: 'Invalid organization id' });

        const invoices = await Invoice.find({ organizationId: orgId }).sort({ issueDate: -1, createdAt: -1 }).lean();
        return res.status(200).json({ success: true, invoices: invoices.map(serializeInvoice) });
    } catch (error) {
        console.error('Error listing invoices:', error);
        return res.status(500).json({ success: false, message: 'Server error listing invoices' });
    }
};

// POST /platform/organizations/:id/invoices — manual/ad-hoc invoice, not tied to a plan purchase
export const createManualInvoice = async (req: Request, res: Response) => {
    try {
        const orgId = String(req.params.id);
        if (!isValidId(orgId)) return res.status(400).json({ success: false, message: 'Invalid organization id' });

        const organization = await Organization.findById(orgId);
        if (!organization) return res.status(404).json({ success: false, message: 'Organization not found' });

        const body = req.body || {};
        const rawItems = Array.isArray(body.items) ? body.items : [];
        if (rawItems.length === 0) return res.status(400).json({ success: false, message: 'At least one line item is required' });
        for (const item of rawItems) {
            if (isBlank(item.description)) return res.status(400).json({ success: false, message: 'Every line item needs a description' });
        }

        const discountPercent = Number(body.discountPercent ?? 0);
        const taxPercent = Number(body.taxPercent ?? 0);
        if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
            return res.status(400).json({ success: false, message: 'Discount must be between 0 and 100' });
        }
        if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) {
            return res.status(400).json({ success: false, message: 'Tax must be between 0 and 100' });
        }

        const invoice = await createInvoiceDocument({
            organization,
            items: rawItems,
            discountPercent,
            taxPercent,
            periodStart: parseDate(body.periodStart) || undefined,
            periodEnd: parseDate(body.periodEnd) || undefined,
            notes: typeof body.notes === 'string' ? body.notes.trim().slice(0, 1000) : undefined,
        });

        return res.status(201).json({ success: true, invoice: serializeInvoice(invoice) });
    } catch (error) {
        console.error('Error creating manual invoice:', error);
        return res.status(500).json({ success: false, message: 'Server error creating invoice' });
    }
};

// GET /platform/invoices/:id
export const getInvoice = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid invoice id' });

        const invoice = await Invoice.findById(id).lean();
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        return res.status(200).json({ success: true, invoice: serializeInvoice(invoice) });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching invoice' });
    }
};

// PATCH /platform/invoices/:id
// Editable any time except when status is 'void'. Editing a 'paid' invoice is allowed
// (e.g. fixing a typo after the fact) but does not reopen payment state.
export const updateInvoice = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid invoice id' });

        const invoice = await Invoice.findById(id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
        if (invoice.status === 'void') return res.status(400).json({ success: false, message: 'A void invoice cannot be edited' });

        const body = req.body || {};

        if (body.items !== undefined) {
            const rawItems = Array.isArray(body.items) ? body.items : [];
            if (rawItems.length === 0) return res.status(400).json({ success: false, message: 'At least one line item is required' });
            for (const item of rawItems) {
                if (isBlank(item.description)) return res.status(400).json({ success: false, message: 'Every line item needs a description' });
            }
            const discountPercent = body.discountPercent !== undefined ? Number(body.discountPercent) : invoice.discountPercent;
            const taxPercent = body.taxPercent !== undefined ? Number(body.taxPercent) : invoice.taxPercent;
            if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
                return res.status(400).json({ success: false, message: 'Discount must be between 0 and 100' });
            }
            if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) {
                return res.status(400).json({ success: false, message: 'Tax must be between 0 and 100' });
            }
            const totals = computeInvoiceTotals(rawItems, discountPercent, taxPercent);
            invoice.set({
                items: totals.items,
                subtotal: totals.subtotal,
                discountPercent: totals.discountPercent,
                discountAmount: totals.discountAmount,
                taxPercent: totals.taxPercent,
                taxAmount: totals.taxAmount,
                total: totals.total,
            });
        } else if (body.discountPercent !== undefined || body.taxPercent !== undefined) {
            const discountPercent = body.discountPercent !== undefined ? Number(body.discountPercent) : invoice.discountPercent;
            const taxPercent = body.taxPercent !== undefined ? Number(body.taxPercent) : invoice.taxPercent;
            if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
                return res.status(400).json({ success: false, message: 'Discount must be between 0 and 100' });
            }
            if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) {
                return res.status(400).json({ success: false, message: 'Tax must be between 0 and 100' });
            }
            const totals = computeInvoiceTotals(invoice.items as any, discountPercent, taxPercent);
            invoice.set({
                discountPercent: totals.discountPercent,
                discountAmount: totals.discountAmount,
                taxPercent: totals.taxPercent,
                taxAmount: totals.taxAmount,
                total: totals.total,
            });
        }

        if (body.dueDate !== undefined) {
            const d = parseDate(body.dueDate);
            if (body.dueDate && !d) return res.status(400).json({ success: false, message: 'Invalid due date' });
            invoice.dueDate = d || undefined;
        }
        if (body.issueDate !== undefined) {
            const d = parseDate(body.issueDate);
            if (!d) return res.status(400).json({ success: false, message: 'Invalid issue date' });
            invoice.issueDate = d;
        }
        if (typeof body.notes === 'string') invoice.notes = body.notes.trim().slice(0, 1000);
        if (typeof body.terms === 'string') invoice.terms = body.terms.trim().slice(0, 2000);

        if (body.billedTo && typeof body.billedTo === 'object') {
            const bt: any = invoice.billedTo || {};
            const allowed = ['name', 'contactName', 'email', 'phone', 'address', 'gstin'] as const;
            for (const k of allowed) {
                if (typeof body.billedTo[k] === 'string') bt[k] = body.billedTo[k].trim().slice(0, 200);
            }
            invoice.billedTo = bt;
        }
        if (body.seller && typeof body.seller === 'object') {
            const s: any = invoice.seller || {};
            const allowed = ['name', 'email', 'phone', 'address', 'gstin', 'paymentInstructions'] as const;
            for (const k of allowed) {
                if (typeof body.seller[k] === 'string') s[k] = body.seller[k].trim().slice(0, 500);
            }
            invoice.seller = s;
        }

        syncPaymentState(invoice);
        await invoice.save();
        return res.status(200).json({ success: true, invoice: serializeInvoice(invoice) });
    } catch (error) {
        console.error('Error updating invoice:', error);
        return res.status(500).json({ success: false, message: 'Server error updating invoice' });
    }
};

// POST /platform/invoices/:id/issue
export const issueInvoice = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid invoice id' });

        const invoice = await Invoice.findById(id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
        if (invoice.status !== 'draft') return res.status(400).json({ success: false, message: 'Only a draft invoice can be issued' });
        if (!invoice.items || invoice.items.length === 0) return res.status(400).json({ success: false, message: 'Cannot issue an invoice with no line items' });

        invoice.status = 'issued';
        await invoice.save();
        return res.status(200).json({ success: true, invoice: serializeInvoice(invoice) });
    } catch (error) {
        console.error('Error issuing invoice:', error);
        return res.status(500).json({ success: false, message: 'Server error issuing invoice' });
    }
};

// POST /platform/invoices/:id/mark-paid
//   { amount?, paymentMethod?, paymentReference?, paidAt?, note? }
// Records a payment against the invoice. With no `amount` it records the whole remaining balance
// (i.e. "mark as paid"); with an amount it records a partial payment. A draft invoice is issued
// automatically, since taking money for it means it has been billed. Status flips to 'paid' once the
// payments cover the total.
export const markInvoicePaid = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid invoice id' });

        const invoice = await Invoice.findById(id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        const problem = applyPayment(invoice, req.body || {});
        if (problem) return res.status(400).json({ success: false, message: problem });

        await invoice.save();
        return res.status(200).json({ success: true, invoice: serializeInvoice(invoice) });
    } catch (error) {
        console.error('Error recording invoice payment:', error);
        return res.status(500).json({ success: false, message: 'Server error recording payment' });
    }
};

// POST /platform/invoices/bulk-payment
//   { invoiceIds: string[], paidAt?, paymentMethod?, paymentReference?, note? }
// Settles the FULL remaining balance of every listed invoice with one shared payment date / method /
// reference — e.g. "paid the one-time fee and the next 3 months in one go". All-or-nothing: if any
// invoice can't take the payment, nothing is recorded.
export const recordBulkPayment = async (req: Request, res: Response) => {
    try {
        const body = req.body || {};
        const ids: string[] = Array.isArray(body.invoiceIds) ? Array.from(new Set(body.invoiceIds.map((x: unknown) => String(x)))) : [];
        if (ids.length === 0) return res.status(400).json({ success: false, message: 'Select at least one invoice' });
        if (ids.length > 200) return res.status(400).json({ success: false, message: 'Too many invoices selected (max 200)' });
        if (ids.some((x) => !isValidId(x))) return res.status(400).json({ success: false, message: 'Invalid invoice id in selection' });

        const invoices = await Invoice.find({ _id: { $in: ids } });
        if (invoices.length !== ids.length) return res.status(404).json({ success: false, message: 'One or more selected invoices were not found' });
        if (new Set(invoices.map((i) => String(i.organizationId))).size > 1) {
            return res.status(400).json({ success: false, message: 'Selected invoices belong to different institutes' });
        }

        // Oldest charge first, so the saved order matches how a ledger reads.
        invoices.sort((a, b) => new Date(a.dueDate || a.issueDate).getTime() - new Date(b.dueDate || b.issueDate).getTime());

        const shared = {
            paidAt: body.paidAt,
            paymentMethod: body.paymentMethod,
            paymentReference: body.paymentReference,
            note: body.note,
        };
        for (const invoice of invoices) {
            const problem = applyPayment(invoice, shared); // in memory only
            if (problem) return res.status(400).json({ success: false, message: `${invoice.invoiceNumber}: ${problem}` });
        }
        for (const invoice of invoices) await invoice.save();

        return res.status(200).json({ success: true, invoices: invoices.map(serializeInvoice) });
    } catch (error) {
        console.error('Error recording bulk payment:', error);
        return res.status(500).json({ success: false, message: 'Server error recording payments' });
    }
};

// DELETE /platform/invoices/:id/payments/:paymentId — undo a wrongly recorded payment.
// The invoice drops back from 'paid' to 'issued' when the remaining payments no longer cover it.
export const deleteInvoicePayment = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        const paymentId = String(req.params.paymentId);
        if (!isValidId(id) || !isValidId(paymentId)) return res.status(400).json({ success: false, message: 'Invalid id' });

        const invoice = await Invoice.findById(id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
        if (invoice.status === 'void') return res.status(400).json({ success: false, message: 'A void invoice cannot be changed' });

        const before = invoice.payments.length;
        invoice.payments = invoice.payments.filter((p: any) => String(p._id) !== paymentId) as any;
        if (invoice.payments.length === before) return res.status(404).json({ success: false, message: 'Payment not found' });

        syncPaymentState(invoice);
        await invoice.save();
        return res.status(200).json({ success: true, invoice: serializeInvoice(invoice) });
    } catch (error) {
        console.error('Error deleting invoice payment:', error);
        return res.status(500).json({ success: false, message: 'Server error deleting payment' });
    }
};

// POST /platform/invoices/:id/mark-unpaid — clear every recorded payment (also fixes legacy "paid" invoices).
export const markInvoiceUnpaid = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid invoice id' });

        const invoice = await Invoice.findById(id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
        if (invoice.status !== 'paid' && invoice.status !== 'issued') {
            return res.status(400).json({ success: false, message: 'Only an issued or paid invoice can be marked unpaid' });
        }

        invoice.payments = [] as any;
        invoice.status = 'issued';
        invoice.paidAt = undefined;
        invoice.paymentMethod = '';
        invoice.paymentReference = '';
        await invoice.save();
        return res.status(200).json({ success: true, invoice: serializeInvoice(invoice) });
    } catch (error) {
        console.error('Error marking invoice unpaid:', error);
        return res.status(500).json({ success: false, message: 'Server error marking invoice unpaid' });
    }
};

// POST /platform/invoices/:id/void
//   { reason?: string, discardPayments?: boolean }
// Voids (waives / removes) ONE charge from the ledger. A void invoice counts nowhere: it drops out of
// "total invoiced", "outstanding", "upcoming" and the monthly summary automatically (see summarizeInvoices),
// and - for a scheduled plan charge - its amount is also taken off the purchase's plan amount
// (subscription.pricing), so every figure stays in step.
// If money was already recorded against the charge, the caller must confirm with `discardPayments: true`;
// those payments are then removed with the charge (noted in the void reason) so "paid" never keeps counting
// money for a charge that no longer exists.
export const voidInvoice = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid invoice id' });

        const invoice = await Invoice.findById(id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
        if (invoice.status === 'void') return res.status(400).json({ success: false, message: 'Invoice is already void' });

        const body = req.body || {};
        const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 300) : '';
        const discardPayments = body.discardPayments === true || body.discardPayments === 'true';

        const amountPaid = invoiceAmountPaid(invoice);
        const hasPayments = amountPaid > PAYMENT_EPSILON;
        if (hasPayments && !discardPayments) {
            return res.status(409).json({
                success: false,
                code: 'HAS_PAYMENTS',
                message: `${invoice.invoiceNumber} already has ${invoice.currency || 'INR'} ${amountPaid} recorded as paid. Confirm to void it together with those payments.`,
            });
        }

        // Figures this charge currently contributes to its plan purchase (captured before anything changes).
        const contribution = {
            subtotal: invoice.subtotal || 0,
            discountAmount: invoice.discountAmount || 0,
            taxAmount: invoice.taxAmount || 0,
            total: invoice.total || 0,
        };

        const reasonParts = [reason ? `Voided by platform admin: ${reason}` : 'Voided by platform admin'];
        if (hasPayments) reasonParts.push(`${invoice.currency || 'INR'} ${amountPaid} of recorded payments was discarded with it`);

        invoice.status = 'void';
        invoice.voidReason = reasonParts.join('; ');
        if (hasPayments || (invoice.payments || []).length > 0) {
            invoice.payments = [] as any;
            invoice.paidAt = undefined;
            invoice.paymentMethod = '';
            invoice.paymentReference = '';
        }
        await invoice.save();

        // A scheduled plan charge (one-time fee / a month) is part of its subscription's plan amount: take it off.
        // Manual invoices carry no installment and were never part of it, so they are left alone.
        if (invoice.installment && invoice.installment.kind && invoice.subscriptionId) {
            try {
                const sub: any = await Subscription.findById(invoice.subscriptionId);
                if (sub) {
                    const p = sub.pricing || {};
                    const dec = (cur: unknown, by: number) => Math.max(0, roundMoney((Number(cur) || 0) - by));
                    sub.set('pricing.subtotal', dec(p.subtotal, contribution.subtotal));
                    sub.set('pricing.discountAmount', dec(p.discountAmount, contribution.discountAmount));
                    sub.set('pricing.taxAmount', dec(p.taxAmount, contribution.taxAmount));
                    sub.set('pricing.total', dec(p.total, contribution.total));
                    await sub.save();
                }
            } catch (subError) {
                console.error('Invoice voided, but the subscription plan amount could not be adjusted:', subError);
            }
        }

        return res.status(200).json({ success: true, invoice: serializeInvoice(invoice) });
    } catch (error) {
        console.error('Error voiding invoice:', error);
        return res.status(500).json({ success: false, message: 'Server error voiding invoice' });
    }
};

// GET /platform/invoices/:id/pdf
export const downloadInvoicePdf = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid invoice id' });

        const invoice = await Invoice.findById(id).lean();
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        const pdf = await renderInvoicePdf(serializeInvoice(invoice) as any);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
        return res.status(200).send(pdf);
    } catch (error) {
        console.error('Error generating invoice PDF:', error);
        return res.status(500).json({ success: false, message: 'Server error generating invoice PDF' });
    }
};