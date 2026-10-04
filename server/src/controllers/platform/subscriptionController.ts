// server/src/controllers/platform/subscriptionController.ts
import { Response } from 'express';
import mongoose from 'mongoose';
import Organization from '../../models/Organization';
import Plan from '../../models/Plan';
import { PlatformAuthRequest } from '../../middlewares/verifyPlatformAuth';
import { BillingError, assignPlanToOrganization, serializeInvoice, serializeSubscription } from '../../services/billingService';
import { isBlank, parseDate } from '../../utils/parseInput';

const num = (v: unknown, label: string): number | undefined => {
    if (isBlank(v)) return undefined;
    const n = Number(v);
    if (!Number.isFinite(n)) throw new BillingError(`${label} must be a number`);
    return n;
};

// POST /platform/organizations/:id/subscription
//
// Body (everything except planId is optional; omitted = use the plan's own value):
//   planId, startDate, durationDays, price (custom subtotal), discountPercent, taxPercent, notes,
//   maxStudents  -> a number overrides the plan's limit; null means "unlimited"; omit to keep the plan's,
//   carryOverRemainingDays -> true adds the days still left on the current plan to the new period,
//   createInvoice -> defaults to true: creates the billing schedule (one invoice for the one-time fee + one per
//                    month, all issued, billed in advance). Changing plan midway voids the old plan's unpaid
//                    future months and carries any prepaid amount onto the new plan.
export const assignPlan = async (req: PlatformAuthRequest, res: Response) => {
    try {
        const id = String(req.params.id);
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid organization id' });

        const body = req.body || {};
        if (!body.planId || !mongoose.Types.ObjectId.isValid(String(body.planId))) {
            return res.status(400).json({ success: false, message: 'A valid planId is required' });
        }

        const organization = await Organization.findById(id);
        if (!organization) return res.status(404).json({ success: false, message: 'Organization not found' });

        const plan = await Plan.findById(body.planId);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        let startDate: Date | undefined;
        if (!isBlank(body.startDate)) {
            const d = parseDate(body.startDate);
            if (!d) return res.status(400).json({ success: false, message: 'Invalid start date' });
            startDate = d;
        }

        let maxStudents: number | null | undefined;
        if (body.maxStudents === null) maxStudents = null;
        else maxStudents = num(body.maxStudents, 'Student limit');

        const result = await assignPlanToOrganization({
            organization,
            plan,
            startDate,
            durationDays: num(body.durationDays, 'Duration'),
            maxStudents,
            oneTimePrice: num(body.oneTimePrice, 'One-time fee'),
            monthlyMaintenance: num(body.monthlyMaintenance, 'Monthly maintenance'),
            discountPercent: num(body.discountPercent, 'Discount'),
            taxPercent: num(body.taxPercent, 'Tax'),
            notes: typeof body.notes === 'string' ? body.notes.trim().slice(0, 1000) : undefined,
            carryOverRemainingDays: body.carryOverRemainingDays === true || body.carryOverRemainingDays === 'true',
            createInvoice: !(body.createInvoice === false || body.createInvoice === 'false'),
            createdBy: req.platformUser?.email || req.platformUser?.id,
        });

        return res.status(201).json({
            success: true,
            subscription: serializeSubscription(result.subscription),
            invoice: result.invoice ? serializeInvoice(result.invoice) : null,
            invoices: result.invoices.map(serializeInvoice),
            change: result.change,
        });
    } catch (error) {
        if (error instanceof BillingError) return res.status(error.status).json({ success: false, message: error.message });
        console.error('Error assigning plan:', error);
        return res.status(500).json({ success: false, message: 'Server error assigning plan' });
    }
};