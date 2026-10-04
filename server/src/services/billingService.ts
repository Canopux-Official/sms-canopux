// server/src/services/billingService.ts
//
// Database-backed billing logic shared by the platform-admin controllers and the institute's
// own read-only billing endpoints. Pure math lives in utils/billing.ts.
import mongoose from 'mongoose';
import Counter from '../models/Counter';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Invoice from '../models/Invoice';
import {
    DAY_MS,
    PAYMENT_EPSILON,
    addDays,
    buildBillingSchedule,
    buildMonthlySummary,
    calculatePlanPrice,
    computeInvoiceTotals,
    computePricing,
    daysRemaining,
    formatDateDMY,
    getSubscriptionTimeline,
    invoiceAmountPaid,
    invoiceBalanceDue,
    normalizePlan,
    roundMoney,
    summarizeInvoices,
    syncInvoicePaymentState,
} from '../utils/billing';

/** Thrown for problems the caller caused (bad input) so controllers can answer with a clean 4xx. */
export class BillingError extends Error {
    status: number;
    constructor(message: string, status = 400) {
        super(message);
        this.name = 'BillingError';
        this.status = status;
    }
}

// ---------------------------------------------------------------------------
// Seller (Canopux) defaults + billed-to (institute) defaults
// ---------------------------------------------------------------------------
export const getSellerDefaults = () => ({
    name: process.env.INVOICE_SELLER_NAME || 'Canopux',
    address: process.env.INVOICE_SELLER_ADDRESS || '',
    email: process.env.INVOICE_SELLER_EMAIL || process.env.MAIL_USER || '',
    phone: process.env.INVOICE_SELLER_PHONE || '',
    gstin: process.env.INVOICE_SELLER_GSTIN || '',
    // In a .env file a multi-line value is written with literal \n sequences.
    paymentInstructions: (process.env.INVOICE_PAYMENT_DETAILS || '').replace(/\\n/g, '\n'),
});

export const partyFromOrganization = (org: any) => {
    const bc = org.billingContact || {};
    const pc = org.primaryContact || {};
    const a = org.address || {};
    return {
        name: org.legalName || org.name || '',
        contactName: bc.name || pc.name || '',
        email: bc.email || pc.email || '',
        phone: bc.phone || pc.phone || '',
        address: [a.line1, a.line2, a.city, a.state, a.pincode, a.country].filter(Boolean).join(', '),
        gstin: (org.metadata && org.metadata.gstin) || '',
    };
};

// ---------------------------------------------------------------------------
// Invoice numbering: INV-<year>-<0001...>, one atomic counter per year
// ---------------------------------------------------------------------------
export const nextInvoiceNumber = async (date: Date = new Date()): Promise<string> => {
    const year = date.getUTCFullYear();
    const counter: any = await Counter.findOneAndUpdate(
        { _id: `invoice-${year}` },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );
    return `INV-${year}-${String(counter.sequence_value).padStart(4, '0')}`;
};

// ---------------------------------------------------------------------------
// Serializers (plain JSON for the API; `id` instead of `_id`)
// ---------------------------------------------------------------------------
export const serializePlan = (plan: any, organizationsCount?: number) => {
    const p = normalizePlan(plan);
    return {
        id: String(plan._id),
        name: p.name,
        description: p.description,
        minStudents: p.minStudents,
        maxStudents: p.maxStudents,
        durationDays: p.durationDays,
        oneTimePrice: p.oneTimePrice,
        monthlyMaintenance: p.monthlyMaintenance,
        currency: p.currency,
        ...(organizationsCount !== undefined ? { organizationsCount } : {}),
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
    };
};

export const serializeSubscription = (sub: any, now: Date = new Date()) => {
    const tl = getSubscriptionTimeline(sub, now);
    const snap = sub.planSnapshot || {};
    const pricing = sub.pricing || {};
    return {
        id: String(sub._id),
        planId: sub.planId ? String(sub.planId) : null,
        planName: snap.name || 'Unknown plan',
        planDescription: snap.description || '',
        maxStudents: snap.maxStudents === undefined ? null : snap.maxStudents,
        durationDays: snap.durationDays,
        // Purchases made before the one-time + maintenance model carry no breakdown: show their whole
        // amount as the one-time fee and no maintenance.
        oneTimePrice: snap.oneTimePrice ?? pricing.subtotal ?? 0,
        monthlyMaintenance: snap.monthlyMaintenance ?? 0,
        maintenanceMonths: snap.maintenanceMonths ?? 0,
        startDate: sub.startDate,
        endDate: sub.endDate,
        status: sub.status,
        state: tl.state,
        totalDays: tl.totalDays,
        elapsedDays: tl.elapsedDays,
        daysRemaining: tl.daysRemaining,
        progressPercent: tl.progressPercent,
        pricing: {
            subtotal: pricing.subtotal ?? 0,
            discountPercent: pricing.discountPercent ?? 0,
            discountAmount: pricing.discountAmount ?? 0,
            taxPercent: pricing.taxPercent ?? 0,
            taxAmount: pricing.taxAmount ?? 0,
            total: pricing.total ?? 0,
            currency: pricing.currency || 'INR',
        },
        notes: sub.notes || '',
        invoiceId: sub.invoiceId ? String(sub.invoiceId) : null,
        createdAt: sub.createdAt,
    };
};

export const serializeInvoice = (inv: any) => ({
    id: String(inv._id),
    organizationId: String(inv.organizationId),
    subscriptionId: inv.subscriptionId ? String(inv.subscriptionId) : null,
    invoiceNumber: inv.invoiceNumber,
    status: inv.status,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate || null,
    paidAt: inv.paidAt || null,
    paymentMethod: inv.paymentMethod || '',
    paymentReference: inv.paymentReference || '',
    installment: inv.installment && inv.installment.kind
        ? { kind: inv.installment.kind, sequence: inv.installment.sequence ?? 0, label: inv.installment.label || '' }
        : null,
    voidReason: inv.voidReason || '',
    amountPaid: invoiceAmountPaid(inv),
    balanceDue: invoiceBalanceDue(inv),
    payments: (inv.payments || []).map((p: any) => ({
        id: String(p._id),
        amount: p.amount,
        paidAt: p.paidAt,
        method: p.method || '',
        reference: p.reference || '',
        note: p.note || '',
    })),
    seller: {
        name: inv.seller?.name || '',
        email: inv.seller?.email || '',
        phone: inv.seller?.phone || '',
        address: inv.seller?.address || '',
        gstin: inv.seller?.gstin || '',
        paymentInstructions: inv.seller?.paymentInstructions || '',
    },
    billedTo: {
        name: inv.billedTo?.name || '',
        contactName: inv.billedTo?.contactName || '',
        email: inv.billedTo?.email || '',
        phone: inv.billedTo?.phone || '',
        address: inv.billedTo?.address || '',
        gstin: inv.billedTo?.gstin || '',
    },
    periodStart: inv.periodStart || null,
    periodEnd: inv.periodEnd || null,
    items: (inv.items || []).map((i: any) => ({
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        amount: i.amount,
    })),
    subtotal: inv.subtotal,
    discountPercent: inv.discountPercent,
    discountAmount: inv.discountAmount,
    taxPercent: inv.taxPercent,
    taxAmount: inv.taxAmount,
    total: inv.total,
    currency: inv.currency || 'INR',
    notes: inv.notes || '',
    terms: inv.terms || '',
    createdAt: inv.createdAt,
    updatedAt: inv.updatedAt,
});

// ---------------------------------------------------------------------------
// Invoice creation
// ---------------------------------------------------------------------------
export interface CreateInvoiceParams {
    organization: any;
    subscriptionId?: mongoose.Types.ObjectId;
    items: { description: string; quantity: number; unitPrice: number }[];
    discountPercent?: number;
    taxPercent?: number;
    periodStart?: Date;
    periodEnd?: Date;
    currency?: string;
    createdBy?: string;
    notes?: string;
    now?: Date;
    /** Defaults to 'draft'. Scheduled plan charges are created already 'issued'. */
    status?: 'draft' | 'issued';
    dueDate?: Date;
    installment?: { kind: 'one_time' | 'maintenance'; sequence: number; label: string };
}

export const createInvoiceDocument = async (p: CreateInvoiceParams): Promise<any> => {
    const now = p.now || new Date();
    const totals = computeInvoiceTotals(p.items, p.discountPercent ?? 0, p.taxPercent ?? 0);
    const dueDays = Number(process.env.INVOICE_DUE_DAYS);
    const invoiceNumber = await nextInvoiceNumber(now);

    return Invoice.create({
        organizationId: p.organization._id,
        subscriptionId: p.subscriptionId,
        invoiceNumber,
        status: p.status || 'draft',
        issueDate: now,
        dueDate: p.dueDate || addDays(now, Number.isFinite(dueDays) && dueDays >= 0 ? dueDays : 7),
        installment: p.installment,
        seller: getSellerDefaults(),
        billedTo: partyFromOrganization(p.organization),
        periodStart: p.periodStart,
        periodEnd: p.periodEnd,
        items: totals.items,
        subtotal: totals.subtotal,
        discountPercent: totals.discountPercent,
        discountAmount: totals.discountAmount,
        taxPercent: totals.taxPercent,
        taxAmount: totals.taxAmount,
        total: totals.total,
        currency: p.currency || 'INR',
        notes: p.notes || '',
        terms: (process.env.INVOICE_TERMS || '').replace(/\\n/g, '\n'),
        createdBy: p.createdBy,
    });
};

// ---------------------------------------------------------------------------
// Assign a plan to an organization (creates Subscription [+ draft Invoice], updates Organization)
// ---------------------------------------------------------------------------
export interface AssignPlanOptions {
    organization: any; // mongoose doc
    plan: any; // mongoose doc or lean object
    startDate?: Date;
    durationDays?: number;
    maxStudents?: number | null; // null = unlimited; undefined = use the plan's value
    oneTimePrice?: number; // explicit custom one-time fee for this purchase
    monthlyMaintenance?: number; // explicit custom monthly maintenance for this purchase
    discountPercent?: number;
    taxPercent?: number;
    notes?: string;
    /** Add the days still left on the current subscription on top of the new period. */
    carryOverRemainingDays?: boolean;
    createInvoice?: boolean; // default true
    createdBy?: string;
    now?: Date;
}

export const assignPlanToOrganization = async (o: AssignPlanOptions) => {
    const now = o.now || new Date();
    const org = o.organization;
    const plan = normalizePlan(o.plan);

    // ---- validation (caller-caused problems => BillingError 400) ----
    if (o.durationDays !== undefined && (!Number.isInteger(o.durationDays) || o.durationDays < 1 || o.durationDays > 3650)) {
        throw new BillingError('Duration must be a whole number of days between 1 and 3650');
    }
    if (o.maxStudents !== undefined && o.maxStudents !== null && (!Number.isInteger(o.maxStudents) || o.maxStudents < 1)) {
        throw new BillingError('Student limit must be a whole number of at least 1 (or empty for unlimited)');
    }
    for (const [label, v] of [['One-time fee', o.oneTimePrice], ['Monthly maintenance', o.monthlyMaintenance]] as const) {
        if (v !== undefined && (!Number.isFinite(v) || v < 0)) {
            throw new BillingError(`${label} cannot be negative`);
        }
    }
    for (const [label, v] of [['Discount', o.discountPercent], ['Tax', o.taxPercent]] as const) {
        if (v !== undefined && (!Number.isFinite(v) || v < 0 || v > 100)) {
            throw new BillingError(`${label} must be between 0 and 100`);
        }
    }
    const start = o.startDate || now;
    if (Number.isNaN(start.getTime())) throw new BillingError('Invalid start date');
    if (start.getTime() > now.getTime() + DAY_MS) throw new BillingError('Start date cannot be in the future');

    const priceInfo = calculatePlanPrice(o.plan, {
        durationDays: o.durationDays,
        maxStudents: o.maxStudents,
        oneTimePrice: o.oneTimePrice,
        monthlyMaintenance: o.monthlyMaintenance,
    });

    // ---- previous subscription(s) ----
    const previousActives: any[] = await Subscription.find({ organizationId: org._id, status: 'active' });
    let carryDays = 0;
    if (o.carryOverRemainingDays && previousActives.length) {
        const latestEnd = new Date(Math.max(...previousActives.map((s) => new Date(s.endDate).getTime())));
        carryDays = latestEnd.getTime() > now.getTime() ? daysRemaining(latestEnd, now) : 0;
    }

    const endDate = addDays(start, priceInfo.durationDays + carryDays);
    const currency = plan.currency;
    const discountPercent = o.discountPercent ?? 0;
    const taxPercent = o.taxPercent ?? 0;
    const limitText = priceInfo.maxStudents === null ? 'unlimited students' : `up to ${priceInfo.maxStudents} students`;

    // ---- billing schedule: one-time fee (due on the start date) + one charge per month, billed in advance ----
    const scheduleLines =
        o.createInvoice === false
            ? []
            : buildBillingSchedule({
                start,
                endDate,
                oneTimePrice: priceInfo.oneTimePrice,
                monthlyMaintenance: priceInfo.monthlyMaintenance,
                months: priceInfo.maintenanceMonths,
            });
    const lineDescription = (l: (typeof scheduleLines)[number]) =>
        l.kind === 'one_time'
            ? `${plan.name} plan - one-time fee (${limitText})`
            : `${plan.name} plan - monthly maintenance, ${l.label} (${formatDateDMY(l.periodStart)} to ${formatDateDMY(l.periodEnd)})`;
    const lineTotals = scheduleLines.map((l) =>
        computeInvoiceTotals([{ description: lineDescription(l), quantity: 1, unitPrice: l.amount }], discountPercent, taxPercent)
    );
    const sumOf = (pick: (t: (typeof lineTotals)[number]) => number) => roundMoney(lineTotals.reduce((a, t) => a + pick(t), 0));
    const newBilledTotal = sumOf((t) => t.total);

    // The subscription's own price is the sum of its invoices, so the two can never drift apart.
    const pricing =
        scheduleLines.length > 0
            ? {
                subtotal: sumOf((t) => t.subtotal),
                discountPercent,
                discountAmount: sumOf((t) => t.discountAmount),
                taxPercent,
                taxAmount: sumOf((t) => t.taxAmount),
                total: newBilledTotal,
            }
            : computePricing(priceInfo.subtotal, discountPercent, taxPercent);

    // ---- changing plan midway: what happens to the OLD plan's charges ----
    // Charges due BEFORE the switch date stay exactly as they are (paid, or still owed under the old plan).
    // Charges due on/after the switch date were never earned under the old plan:
    //   - unpaid ones are voided
    //   - ones the institute already paid in advance are voided and their money is carried onto the new plan.
    const futureOld: any[] = previousActives.length
        ? await Invoice.find({
            subscriptionId: { $in: previousActives.map((s) => s._id) },
            'installment.kind': { $exists: true }, // only scheduled charges; manual / legacy invoices are never touched
            status: { $in: ['draft', 'issued', 'paid'] },
            dueDate: { $gte: start },
        })
        : [];
    const prepaidOld = futureOld
        .filter((i) => invoiceAmountPaid(i) > PAYMENT_EPSILON)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const unpaidOld = futureOld.filter((i) => invoiceAmountPaid(i) <= PAYMENT_EPSILON);

    // Prepaid money can only move if there are new charges to put it on; otherwise leave those invoices alone.
    const canCarryCredit = scheduleLines.length > 0;
    const creditToCarry = canCarryCredit ? roundMoney(prepaidOld.reduce((a, i) => a + invoiceAmountPaid(i), 0)) : 0;
    if (creditToCarry > newBilledTotal + PAYMENT_EPSILON) {
        throw new BillingError(
            `The institute has already prepaid ${currency} ${creditToCarry} on the current plan, which is more than the new plan's total charges (${currency} ${newBilledTotal}). ` +
            'Refund or adjust the prepaid invoices first, then change the plan.'
        );
    }
    const toVoid = canCarryCredit ? [...unpaidOld, ...prepaidOld] : unpaidOld;

    const subId = new mongoose.Types.ObjectId();
    const createdInvoices: any[] = [];
    let subscription: any = null;
    const backups: { doc: any; status: string; endDate: Date }[] = [];
    const voidBackups: { doc: any; status: string; voidReason: string }[] = [];
    const change = {
        replacedPlans: previousActives.map((s) => s.planSnapshot?.name || 'previous plan') as string[],
        voidedCount: 0,
        voidedAmount: 0,
        creditCarried: 0,
    };

    try {
        for (let idx = 0; idx < scheduleLines.length; idx++) {
            const l = scheduleLines[idx];
            createdInvoices.push(
                await createInvoiceDocument({
                    organization: org,
                    subscriptionId: subId,
                    items: [{ description: lineDescription(l), quantity: 1, unitPrice: l.amount }],
                    discountPercent,
                    taxPercent,
                    periodStart: l.periodStart,
                    periodEnd: l.periodEnd,
                    currency,
                    createdBy: o.createdBy,
                    notes: idx === 0 ? o.notes : undefined,
                    now,
                    status: 'issued',
                    dueDate: l.dueDate,
                    installment: { kind: l.kind, sequence: l.sequence, label: l.label },
                })
            );
        }

        subscription = await Subscription.create({
            _id: subId,
            organizationId: org._id,
            planId: o.plan._id,
            planSnapshot: {
                name: plan.name,
                description: plan.description,
                maxStudents: priceInfo.maxStudents,
                durationDays: priceInfo.durationDays,
                pricingModel: 'fixed',
                price: priceInfo.oneTimePrice,
                pricePerStudent: 0,
                oneTimePrice: priceInfo.oneTimePrice,
                monthlyMaintenance: priceInfo.monthlyMaintenance,
                maintenanceMonths: priceInfo.maintenanceMonths,
            },
            startDate: start,
            endDate,
            status: 'active',
            pricing: { ...pricing, currency },
            notes: o.notes || '',
            createdBy: o.createdBy,
            invoiceId: createdInvoices.length ? createdInvoices[0]._id : undefined,
        });

        // Supersede whatever was active before: its period now ends where the new one starts.
        for (const prev of previousActives) {
            backups.push({ doc: prev, status: prev.status, endDate: prev.endDate });
            const truncated = Math.max(new Date(prev.startDate).getTime(), Math.min(new Date(prev.endDate).getTime(), start.getTime()));
            prev.status = 'replaced';
            prev.endDate = new Date(truncated);
            await prev.save();
        }

        const setFields: Record<string, unknown> = {
            planId: o.plan._id,
            currentPeriodStart: start,
            currentPeriodEnd: endDate,
            subscriptionStatus: 'active',
        };
        // A suspended/cancelled institute stays that way until the platform admin changes it.
        if (org.status !== 'suspended' && org.status !== 'cancelled') setFields.status = 'active';
        // strict:false lets $unset clean the legacy trialEndsAt field, which is no longer in the schema.
        await Organization.updateOne({ _id: org._id }, { $set: setFields, $unset: { trialEndsAt: '' } }, { strict: false });

        // ---- carry prepaid money onto the new plan (oldest new charge first), then void the old future charges ----
        if (toVoid.length) {
            let remaining = creditToCarry;
            if (remaining > PAYMENT_EPSILON) {
                const sources = prepaidOld.map((i) => i.invoiceNumber).join(', ');
                for (const inv of createdInvoices) {
                    if (remaining <= PAYMENT_EPSILON) break;
                    const apply = roundMoney(Math.min(remaining, inv.total));
                    if (apply <= PAYMENT_EPSILON) continue;
                    inv.payments.push({
                        amount: apply,
                        paidAt: now,
                        method: 'Credit carried forward',
                        reference: sources,
                        note: `Prepaid on ${sources} under the previous plan`,
                    });
                    syncInvoicePaymentState(inv);
                    await inv.save();
                    remaining = roundMoney(remaining - apply);
                    change.creditCarried = roundMoney(change.creditCarried + apply);
                }
            }

            for (const old of toVoid) {
                const wasPrepaid = invoiceAmountPaid(old) > PAYMENT_EPSILON;
                voidBackups.push({ doc: old, status: old.status, voidReason: old.voidReason || '' });
                old.status = 'void';
                old.voidReason = `Plan changed to ${plan.name} on ${formatDateDMY(start)}` + (wasPrepaid ? '; the amount already paid was moved to the new plan' : '');
                await old.save();
                change.voidedCount += 1;
                change.voidedAmount = roundMoney(change.voidedAmount + (old.total || 0));
            }
        }

        return { subscription, invoice: createdInvoices[0] || null, invoices: createdInvoices, carryDays, change };
    } catch (error) {
        // Best-effort rollback so a failure never leaves half a purchase behind.
        for (const v of voidBackups) {
            v.doc.status = v.status;
            v.doc.voidReason = v.voidReason;
            await v.doc.save().catch(() => undefined);
        }
        for (const b of backups) {
            b.doc.status = b.status;
            b.doc.endDate = b.endDate;
            await b.doc.save().catch(() => undefined);
        }
        if (subscription) await Subscription.deleteOne({ _id: subscription._id }).catch(() => undefined);
        if (createdInvoices.length) await Invoice.deleteMany({ _id: { $in: createdInvoices.map((i) => i._id) } }).catch(() => undefined);
        throw error;
    }
};

// ---------------------------------------------------------------------------
// Read model used by both the platform "institute detail" page and the institute's own billing page
// ---------------------------------------------------------------------------
export const getOrganizationBillingSnapshot = async (organizationId: any, now: Date = new Date()) => {
    const subs: any[] = await Subscription.find({ organizationId }).sort({ startDate: -1, createdAt: -1 }).lean();
    // Drafts are loaded too so the summary can report them separately; only issued + paid count as billed.
    const allInvoices: any[] = await Invoice.find({ organizationId, status: { $in: ['draft', 'issued', 'paid'] } }).lean();
    const invoices = allInvoices.filter((i) => i.status === 'issued' || i.status === 'paid');

    const subscriptions = subs.map((s) => serializeSubscription(s, now));
    const current = subscriptions.find((s) => s.status === 'active') || null;

    const summary = summarizeInvoices(allInvoices, now);

    const monthly = buildMonthlySummary(
        subs.map((s) => ({ planName: s.planSnapshot?.name || 'Unknown plan', startDate: s.startDate, endDate: s.endDate })),
        invoices.map((i) => ({ issueDate: i.issueDate, total: i.total || 0, status: i.status })),
        12,
        now
    );

    return {
        currentSubscription: current,
        subscriptions,
        monthly,
        invoiceSummary: summary,
    };
};