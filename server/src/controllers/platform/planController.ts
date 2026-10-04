// server/src/controllers/platform/planController.ts
//
// Plans are reusable templates. Creating/editing a plan never touches organizations that already
// bought it — their Subscription holds a snapshot — so edits only affect FUTURE assignments.
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Plan from '../../models/Plan';
import Organization from '../../models/Organization';
import Subscription from '../../models/Subscription';
import { serializePlan } from '../../services/billingService';
import { normalizePlan, roundMoney } from '../../utils/billing';
import { escapeRegex, isBlank } from '../../utils/parseInput';

interface ParsedPlan {
    name: string;
    description: string;
    minStudents: number;
    maxStudents: number | null;
    durationDays: number;
    pricingModel: 'fixed'; // legacy column — every plan is saved as 'fixed' now
    price: number; // the ONE-TIME fee
    monthlyMaintenance: number; // the fixed MONTHLY maintenance charge
    pricePerStudent: 0; // legacy column — per-student pricing can no longer be created
    monthlyPrice: number; // mirrors monthlyMaintenance
    currency: string;
}

/** Merges the request body over an existing plan (or defaults) and validates the result. */
const parsePlanInput = (body: any, existing?: any): { error?: string; data?: ParsedPlan } => {
    const base = normalizePlan(existing || {});
    const has = (k: string) => body[k] !== undefined;

    const name = has('name') ? String(body.name ?? '').trim() : base.name;
    if (name.length < 2 || name.length > 80) return { error: 'Plan name must be 2-80 characters' };

    const description = has('description') ? String(body.description ?? '').trim().slice(0, 500) : base.description;

    let maxStudents: number | null = base.maxStudents;
    if (has('maxStudents')) {
        maxStudents = isBlank(body.maxStudents) ? null : Number(body.maxStudents);
        if (maxStudents !== null && (!Number.isInteger(maxStudents) || maxStudents < 1)) {
            return { error: 'Student limit must be a whole number of at least 1, or empty for unlimited' };
        }
    }

    const minStudents = has('minStudents') ? Number(isBlank(body.minStudents) ? 0 : body.minStudents) : base.minStudents;
    if (!Number.isInteger(minStudents) || minStudents < 0) return { error: 'Minimum students must be a whole number (0 or more)' };
    if (maxStudents !== null && minStudents > maxStudents) return { error: 'Minimum students cannot be more than the student limit' };

    const durationDays = has('durationDays') ? Number(body.durationDays) : base.durationDays;
    if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 3650) {
        return { error: 'Duration must be a whole number of days between 1 and 3650' };
    }

    // The only plan shape is: one-time fee + fixed monthly maintenance. Any other pricing scheme
    // (e.g. per-student) is rejected outright rather than silently ignored.
    if (body.pricingModel !== undefined && body.pricingModel !== 'fixed') {
        return { error: 'Only one pricing scheme is supported: a one-time fee plus a fixed monthly maintenance charge' };
    }
    if (body.pricePerStudent !== undefined && Number(body.pricePerStudent) !== 0 && !isBlank(body.pricePerStudent)) {
        return { error: 'Per-student pricing is not supported' };
    }

    const oneTime = has('price') ? Number(isBlank(body.price) ? 0 : body.price) : base.oneTimePrice;
    const monthlyMaintenance = has('monthlyMaintenance')
        ? Number(isBlank(body.monthlyMaintenance) ? 0 : body.monthlyMaintenance)
        : base.monthlyMaintenance;
    if (!Number.isFinite(oneTime) || oneTime < 0) return { error: 'One-time fee must be a number, 0 or more' };
    if (!Number.isFinite(monthlyMaintenance) || monthlyMaintenance < 0) return { error: 'Monthly maintenance must be a number, 0 or more' };

    const currency = has('currency') ? String(body.currency ?? '').trim().toUpperCase() : base.currency;
    if (!/^[A-Z]{3}$/.test(currency)) return { error: 'Currency must be a 3-letter code such as INR' };

    return {
        data: {
            name, description, minStudents, maxStudents, durationDays,
            pricingModel: 'fixed',
            price: roundMoney(oneTime),
            monthlyMaintenance: roundMoney(monthlyMaintenance),
            pricePerStudent: 0,
            monthlyPrice: roundMoney(monthlyMaintenance),
            currency,
        },
    };
};

/**
 * Which institutes are "actively on" each plan: organizations whose current plan it is, plus
 * organizations holding a live (status 'active') subscription for it. Cancelled organizations don't count.
 * Used for both the Institutes column and the delete guard so the two can never disagree.
 */
const getActiveOrganizationsByPlan = async (planIds?: any[]): Promise<Map<string, { id: string; name: string }[]>> => {
    const planFilter = planIds ? { $in: planIds } : { $ne: null };

    const [orgsByPlanId, activeSubs]: [any[], any[]] = await Promise.all([
        Organization.find({ planId: planFilter, status: { $ne: 'cancelled' } }).select('_id name planId').lean(),
        Subscription.find({ planId: planFilter, status: 'active' }).select('organizationId planId').lean(),
    ]);

    const subOrgIds = Array.from(new Set(activeSubs.map((s) => String(s.organizationId))));
    const subOrgs: any[] = subOrgIds.length
        ? await Organization.find({ _id: { $in: subOrgIds }, status: { $ne: 'cancelled' } }).select('_id name').lean()
        : [];
    const subOrgName = new Map(subOrgs.map((o) => [String(o._id), o.name as string]));

    const result = new Map<string, Map<string, string>>();
    const add = (planId: any, orgId: any, name: string) => {
        const key = String(planId);
        if (!result.has(key)) result.set(key, new Map());
        result.get(key)!.set(String(orgId), name);
    };
    orgsByPlanId.forEach((o) => add(o.planId, o._id, o.name));
    activeSubs.forEach((s) => {
        const name = subOrgName.get(String(s.organizationId));
        if (name !== undefined) add(s.planId, s.organizationId, name);
    });

    const out = new Map<string, { id: string; name: string }[]>();
    result.forEach((orgs, planId) => out.set(planId, Array.from(orgs, ([id, name]) => ({ id, name }))));
    return out;
};

// GET /platform/plans
export const listPlans = async (_req: Request, res: Response) => {
    try {
        const plans: any[] = await Plan.find({}).sort({ minStudents: 1, createdAt: 1 }).lean();
        const inUse = await getActiveOrganizationsByPlan();

        return res.status(200).json({
            success: true,
            plans: plans.map((p) => serializePlan(p, inUse.get(String(p._id))?.length || 0)),
        });
    } catch (error) {
        console.error('Error fetching plans:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching plans' });
    }
};

// POST /platform/plans
export const createPlan = async (req: Request, res: Response) => {
    try {
        const parsed = parsePlanInput(req.body || {});
        if (parsed.error || !parsed.data) return res.status(400).json({ success: false, message: parsed.error });
        const d = parsed.data;

        const dup = await Plan.findOne({ name: new RegExp(`^${escapeRegex(d.name)}$`, 'i') }).select('_id');
        if (dup) return res.status(409).json({ success: false, message: 'A plan with this name already exists' });

        const plan = await Plan.create({ ...d, maxStudents: d.maxStudents === null ? undefined : d.maxStudents });
        return res.status(201).json({ success: true, plan: serializePlan(plan, 0) });
    } catch (error) {
        console.error('Error creating plan:', error);
        return res.status(500).json({ success: false, message: 'Server error creating plan' });
    }
};

// PATCH /platform/plans/:id
export const updatePlan = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid plan id' });

        const plan = await Plan.findById(id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        const parsed = parsePlanInput(req.body || {}, plan);
        if (parsed.error || !parsed.data) return res.status(400).json({ success: false, message: parsed.error });
        const d = parsed.data;

        const dup = await Plan.findOne({ name: new RegExp(`^${escapeRegex(d.name)}$`, 'i'), _id: { $ne: plan._id } }).select('_id');
        if (dup) return res.status(409).json({ success: false, message: 'A plan with this name already exists' });

        plan.set({ ...d, maxStudents: d.maxStudents === null ? undefined : d.maxStudents });
        await plan.save();

        const inUse = await getActiveOrganizationsByPlan([plan._id]);
        return res.status(200).json({ success: true, plan: serializePlan(plan, inUse.get(String(plan._id))?.length || 0) });
    } catch (error) {
        console.error('Error updating plan:', error);
        return res.status(500).json({ success: false, message: 'Server error updating plan' });
    }
};

// DELETE /platform/plans/:id
// Allowed only when no (non-cancelled) institute is currently on the plan. Past purchases are safe:
// every Subscription and Invoice keeps its own snapshot of the plan, so history is unaffected.
export const deletePlan = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid plan id' });

        const plan = await Plan.findById(id).select('_id name');
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        const inUse = (await getActiveOrganizationsByPlan([plan._id])).get(String(plan._id)) || [];
        if (inUse.length > 0) {
            const names = inUse.slice(0, 3).map((o) => o.name).join(', ');
            const more = inUse.length > 3 ? ` and ${inUse.length - 3} more` : '';
            return res.status(409).json({
                success: false,
                message: `Can't delete "${plan.name}" - ${inUse.length} institute${inUse.length === 1 ? ' is' : 's are'} still on it (${names}${more}). Move them to another plan first.`,
            });
        }

        await Plan.deleteOne({ _id: plan._id });
        return res.status(200).json({ success: true, message: 'Plan deleted' });
    } catch (error) {
        console.error('Error deleting plan:', error);
        return res.status(500).json({ success: false, message: 'Server error deleting plan' });
    }
};