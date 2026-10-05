// server/src/controllers/billingController.ts
//
// The INSTITUTE's own read-only view of its billing: current plan + days remaining,
// subscription history, monthly summary, and its own (issued/paid) invoices — mirrored in
// project-sms/client under Settings/Billing. Restricted to superadmin: billing data (contact
// info, amounts) is not something a regular admin with only e.g. 'students' permission should see.
import { Response } from 'express';
import { AuthRequest } from '../middlewares/verifyAuth';
import Invoice from '../models/Invoice';
import { getOrganizationBillingSnapshot, serializeInvoice } from '../services/billingService';
import { renderInvoicePdf } from '../utils/invoicePdf';

const requireSuperadmin = (req: AuthRequest, res: Response): boolean => {
    if (req.user?.role !== 'superadmin') {
        res.status(403).json({ success: false, message: 'Only the institute superadmin can view billing' });
        return false;
    }
    return true;
};

// GET /admin/billing/summary
export const getBillingSummary = async (req: AuthRequest, res: Response) => {
    try {
        if (!requireSuperadmin(req, res)) return;
        const snapshot = await getOrganizationBillingSnapshot(req.user!.organizationId);
        return res.status(200).json({ success: true, ...snapshot });
    } catch (error) {
        console.error('Error fetching billing summary:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching billing summary' });
    }
};

// GET /admin/billing/invoices — only finalized invoices; drafts are the platform admin's working copy
export const listMyInvoices = async (req: AuthRequest, res: Response) => {
    try {
        if (!requireSuperadmin(req, res)) return;
        const invoices = await Invoice.find({
            organizationId: req.user!.organizationId,
            status: { $in: ['issued', 'paid'] },
        }).sort({ issueDate: -1 }).lean();
        return res.status(200).json({ success: true, invoices: invoices.map(serializeInvoice) });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching invoices' });
    }
};

// GET /admin/billing/invoices/:id/pdf
export const downloadMyInvoicePdf = async (req: AuthRequest, res: Response) => {
    try {
        if (!requireSuperadmin(req, res)) return;
        const invoice = await Invoice.findOne({
            _id: req.params.id,
            organizationId: req.user!.organizationId,
            status: { $in: ['issued', 'paid'] },
        }).lean();
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