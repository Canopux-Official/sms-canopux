// server/src/utils/billing.ts
//
// Pure functions only (no database, no Express) so every rule about money and dates lives in
// one place and can be unit-tested in isolation.

export const DAY_MS = 24 * 60 * 60 * 1000;
export const EXPIRING_SOON_DAYS = 7;

// ---------------------------------------------------------------------------
// Small numeric / date helpers
// ---------------------------------------------------------------------------
export const toNumber = (value: unknown, fallback = 0): number => {
    if (value === null || value === undefined || value === '') return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

export const roundMoney = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export const clamp = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n));

export const addDays = (date: Date, days: number): Date => new Date(date.getTime() + days * DAY_MS);

/** Whole days left until `end` (rounded UP, never negative). 0 once the end moment has passed. */
export const daysRemaining = (end: Date, now: Date = new Date()): number =>
    Math.max(0, Math.ceil((end.getTime() - now.getTime()) / DAY_MS));

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------
export interface PlanLike {
    name?: string;
    description?: string;
    minStudents?: number;
    maxStudents?: number | null;
    durationDays?: number;
    price?: number; // one-time fee
    monthlyMaintenance?: number;
    monthlyPrice?: number;
    currency?: string;
    // legacy fields, only read so that old plans can be converted
    pricingModel?: string;
    pricePerStudent?: number;
}

export interface NormalizedPlan {
    name: string;
    description: string;
    minStudents: number;
    maxStudents: number | null;
    durationDays: number;
    /** One-time fee, charged once when the plan is assigned. */
    oneTimePrice: number;
    /** Fixed maintenance charge for every month of the plan's duration. */
    monthlyMaintenance: number;
    currency: string;
}

/**
 * Every plan is now exactly one shape: a ONE-TIME fee + a fixed MONTHLY maintenance charge,
 * limited by a student cap and a duration. This also converts plans created under the old schemes:
 *  - new plans (monthlyMaintenance present)       -> used as stored
 *  - old 'per_student' plans                      -> maintenance = pricePerStudent x student limit, one-time = 0
 *  - old 'fixed' plans (full-duration price)      -> one-time = that price, maintenance = 0
 *  - very old plans with only monthlyPrice        -> maintenance = monthlyPrice, one-time = 0
 */
export const normalizePlan = (plan: PlanLike): NormalizedPlan => {
    const durationDays = Math.max(1, Math.round(toNumber(plan.durationDays, 30)));
    const maxStudents = plan.maxStudents === null || plan.maxStudents === undefined ? null : toNumber(plan.maxStudents, 0);

    let oneTimePrice: number;
    let monthlyMaintenance: number;
    if (plan.monthlyMaintenance !== undefined && plan.monthlyMaintenance !== null) {
        oneTimePrice = Math.max(0, toNumber(plan.price, 0));
        monthlyMaintenance = Math.max(0, toNumber(plan.monthlyMaintenance, 0));
    } else if (plan.pricingModel === 'per_student') {
        oneTimePrice = 0;
        monthlyMaintenance = Math.max(0, toNumber(plan.pricePerStudent, 0)) * (maxStudents ?? 0);
    } else if (plan.price !== undefined && plan.price !== null && toNumber(plan.price, 0) > 0) {
        oneTimePrice = Math.max(0, toNumber(plan.price, 0));
        monthlyMaintenance = 0;
    } else {
        oneTimePrice = 0;
        monthlyMaintenance = Math.max(0, toNumber(plan.monthlyPrice, 0));
    }

    return {
        name: plan.name ?? '',
        description: plan.description ?? '',
        minStudents: Math.max(0, toNumber(plan.minStudents, 0)),
        maxStudents,
        durationDays,
        oneTimePrice: roundMoney(oneTimePrice),
        monthlyMaintenance: roundMoney(monthlyMaintenance),
        currency: plan.currency || 'INR',
    };
};

/** How many monthly-maintenance charges a period of `durationDays` carries (30 days = 1 month, at least 1). */
export const maintenanceMonthsFor = (durationDays: number): number =>
    Math.max(1, Math.round(durationDays / 30));

export interface PriceOverrides {
    maxStudents?: number | null;
    durationDays?: number;
    /** Explicit one-time fee for this purchase (custom deals). */
    oneTimePrice?: number;
    /** Explicit monthly maintenance for this purchase (custom deals). */
    monthlyMaintenance?: number;
}

export interface PlanPriceBreakdown {
    oneTimePrice: number;
    monthlyMaintenance: number;
    maintenanceMonths: number;
    maintenanceTotal: number;
    /** oneTimePrice + maintenanceTotal, before discount/tax. */
    subtotal: number;
    durationDays: number;
    maxStudents: number | null;
}

/**
 * Subtotal (before discount/tax) for buying `plan`, optionally customised:
 *   subtotal = one-time fee + (monthly maintenance x number of months in the duration)
 * Explicit overrides win over the plan's own numbers.
 */
export const calculatePlanPrice = (
    planInput: PlanLike,
    overrides: PriceOverrides = {}
): PlanPriceBreakdown => {
    const plan = normalizePlan(planInput);
    const durationDays =
        overrides.durationDays !== undefined ? Math.max(1, Math.round(toNumber(overrides.durationDays, plan.durationDays))) : plan.durationDays;
    const maxStudents = overrides.maxStudents !== undefined ? overrides.maxStudents : plan.maxStudents;

    const oneTimePrice = roundMoney(
        overrides.oneTimePrice !== undefined && overrides.oneTimePrice !== null
            ? Math.max(0, toNumber(overrides.oneTimePrice, 0))
            : plan.oneTimePrice
    );
    const monthlyMaintenance = roundMoney(
        overrides.monthlyMaintenance !== undefined && overrides.monthlyMaintenance !== null
            ? Math.max(0, toNumber(overrides.monthlyMaintenance, 0))
            : plan.monthlyMaintenance
    );
    const maintenanceMonths = maintenanceMonthsFor(durationDays);
    const maintenanceTotal = roundMoney(monthlyMaintenance * maintenanceMonths);

    return {
        oneTimePrice,
        monthlyMaintenance,
        maintenanceMonths,
        maintenanceTotal,
        subtotal: roundMoney(oneTimePrice + maintenanceTotal),
        durationDays,
        maxStudents,
    };
};

export interface PricingBreakdown {
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    taxPercent: number;
    taxAmount: number;
    total: number;
}

/** discount is applied to the subtotal first, tax is charged on the discounted amount. */
export const computePricing = (subtotalInput: number, discountPercentInput = 0, taxPercentInput = 0): PricingBreakdown => {
    const subtotal = roundMoney(toNumber(subtotalInput, 0));
    const discountPercent = clamp(toNumber(discountPercentInput, 0), 0, 100);
    const taxPercent = clamp(toNumber(taxPercentInput, 0), 0, 100);
    const discountAmount = roundMoney((subtotal * discountPercent) / 100);
    const taxable = roundMoney(subtotal - discountAmount);
    const taxAmount = roundMoney((taxable * taxPercent) / 100);
    const total = roundMoney(taxable + taxAmount);
    return { subtotal, discountPercent, discountAmount, taxPercent, taxAmount, total };
};

export interface RawInvoiceItem {
    description?: unknown;
    quantity?: unknown;
    unitPrice?: unknown;
}

export interface InvoiceItemOut {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

/** Recomputes every amount from quantity x unitPrice. Client-sent amounts/totals are never trusted. */
export const computeInvoiceTotals = (
    rawItems: RawInvoiceItem[],
    discountPercent = 0,
    taxPercent = 0
): PricingBreakdown & { items: InvoiceItemOut[] } => {
    const items: InvoiceItemOut[] = rawItems.map((item) => {
        const quantity = toNumber(item.quantity, 1);
        const unitPrice = toNumber(item.unitPrice, 0);
        return {
            description: String(item.description ?? '').trim(),
            quantity,
            unitPrice: roundMoney(unitPrice),
            amount: roundMoney(quantity * unitPrice),
        };
    });
    const subtotal = roundMoney(items.reduce((sum, i) => sum + i.amount, 0));
    return { items, ...computePricing(subtotal, discountPercent, taxPercent) };
};

// ---------------------------------------------------------------------------
// Subscription timeline ("how many days are left?")
// ---------------------------------------------------------------------------
export type SubscriptionState = 'active' | 'expiring_soon' | 'expired' | 'replaced' | 'cancelled';

export interface SubscriptionTimeline {
    state: SubscriptionState;
    totalDays: number;
    elapsedDays: number;
    daysRemaining: number;
    progressPercent: number;
}

export const getSubscriptionTimeline = (
    sub: { status: string; startDate: Date; endDate: Date },
    now: Date = new Date()
): SubscriptionTimeline => {
    const start = new Date(sub.startDate);
    const end = new Date(sub.endDate);
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS));
    const elapsedDays = clamp(Math.floor((now.getTime() - start.getTime()) / DAY_MS), 0, totalDays);
    const remaining = daysRemaining(end, now);
    const expired = end.getTime() <= now.getTime();

    let state: SubscriptionState;
    if (sub.status === 'replaced') state = 'replaced';
    else if (sub.status === 'cancelled') state = 'cancelled';
    else if (expired) state = 'expired';
    else if (remaining <= EXPIRING_SOON_DAYS) state = 'expiring_soon';
    else state = 'active';

    const progressPercent = expired ? 100 : clamp(Math.round((elapsedDays / totalDays) * 100), 0, 100);

    return { state, totalDays, elapsedDays, daysRemaining: remaining, progressPercent };
};

// ---------------------------------------------------------------------------
// Month-by-month summary ("plans used in previous month / current month ...")
// ---------------------------------------------------------------------------
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface MonthlySummaryRow {
    month: string; // 'YYYY-MM'
    label: string; // 'Sep 2026'
    isCurrent: boolean;
    plans: string[];
    invoiced: number;
    paid: number;
}

export const buildMonthlySummary = (
    subscriptions: { planName: string; startDate: Date; endDate: Date }[],
    invoices: { issueDate: Date; total: number; status: string }[],
    monthsBack = 12,
    now: Date = new Date()
): MonthlySummaryRow[] => {
    const rows: MonthlySummaryRow[] = [];
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth();

    for (let i = 0; i < monthsBack; i++) {
        const monthStart = Date.UTC(y, m - i, 1);
        const monthEnd = Date.UTC(y, m - i + 1, 1);
        const d = new Date(monthStart);

        const plans: string[] = [];
        for (const sub of subscriptions) {
            const overlaps = new Date(sub.startDate).getTime() < monthEnd && new Date(sub.endDate).getTime() > monthStart;
            if (overlaps && !plans.includes(sub.planName)) plans.push(sub.planName);
        }

        let invoiced = 0;
        let paid = 0;
        for (const inv of invoices) {
            const t = new Date(inv.issueDate).getTime();
            if (t >= monthStart && t < monthEnd && (inv.status === 'issued' || inv.status === 'paid')) {
                invoiced += inv.total;
                if (inv.status === 'paid') paid += inv.total;
            }
        }

        rows.push({
            month: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`,
            label: `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
            isCurrent: i === 0,
            plans,
            invoiced: roundMoney(invoiced),
            paid: roundMoney(paid),
        });
    }
    return rows;
};

// ---------------------------------------------------------------------------
// Formatting (used by the PDF renderer and invoice descriptions)
// ---------------------------------------------------------------------------
export const formatDateDMY = (value: Date | string | undefined | null): string => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return `${String(d.getUTCDate()).padStart(2, '0')} ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

/** "INR 12,345.00" — deliberately not the rupee glyph: the PDF's built-in fonts can't draw it. */
export const formatMoney = (amount: number, currency = 'INR'): string =>
    `${currency} ${toNumber(amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ---------------------------------------------------------------------------
// Payments & invoice summary (single source of truth for "paid" / "outstanding")
// ---------------------------------------------------------------------------
export interface PaymentLike { amount?: number }
export interface InvoiceMoneyLike {
    status?: string;
    total?: number;
    payments?: PaymentLike[];
    dueDate?: Date | string | null;
}

/** Amount received so far. Invoices marked paid before payments were tracked count as fully paid. */
export const invoiceAmountPaid = (inv: InvoiceMoneyLike): number => {
    if (inv.status === 'void' || inv.status === 'draft') return 0;
    const payments = inv.payments || [];
    if (payments.length === 0) return inv.status === 'paid' ? roundMoney(toNumber(inv.total, 0)) : 0;
    const sum = roundMoney(payments.reduce((acc, p) => acc + toNumber(p.amount, 0), 0));
    return sum;
};

/** What the institute still owes on this invoice. Draft and void invoices owe nothing yet / any more. */
export const invoiceBalanceDue = (inv: InvoiceMoneyLike): number => {
    if (inv.status !== 'issued' && inv.status !== 'paid') return 0;
    return Math.max(0, roundMoney(toNumber(inv.total, 0) - invoiceAmountPaid(inv)));
};

export const PAYMENT_EPSILON = 0.005;

/**
 * Keeps `status` and the "latest payment" summary fields consistent with the payments ledger:
 * issued <-> paid flips automatically as payments are added/removed or the invoice total changes.
 */
export const syncInvoicePaymentState = (invoice: any): void => {
    if (invoice.status !== 'issued' && invoice.status !== 'paid') return;
    // Legacy invoice marked paid before payments were tracked: keep it paid unless payments exist.
    if ((invoice.payments || []).length === 0 && invoice.status === 'paid') return;

    const paid = invoiceAmountPaid(invoice);
    invoice.status = paid + PAYMENT_EPSILON >= (invoice.total || 0) && (invoice.total || 0) > 0 ? 'paid' : 'issued';

    const payments = [...(invoice.payments || [])].sort((a: any, b: any) => new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime());
    const last = payments[payments.length - 1];
    invoice.paidAt = last ? last.paidAt : undefined;
    invoice.paymentMethod = last?.method || '';
    invoice.paymentReference = last?.reference || '';
};

// ---------------------------------------------------------------------------
// Billing schedule: one-time fee + one charge per month, billed IN ADVANCE
// (the usual way maintenance/subscription fees are billed: each month is due on its first day).
// ---------------------------------------------------------------------------

/** Adds calendar months in UTC, keeping the day-of-month where possible (31 Jan + 1 month = 28/29 Feb). */
export const addMonthsUTC = (date: Date, months: number): Date => {
    const day = date.getUTCDate();
    const target = new Date(Date.UTC(
        date.getUTCFullYear(), date.getUTCMonth() + months, 1,
        date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()
    ));
    const daysInMonth = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
    target.setUTCDate(Math.min(day, daysInMonth));
    return target;
};

export interface ScheduleLine {
    kind: 'one_time' | 'maintenance';
    sequence: number; // 0 = one-time fee, 1..n = month number
    label: string;
    periodStart: Date;
    periodEnd: Date;
    dueDate: Date;
    amount: number;
}

export const buildBillingSchedule = (p: {
    start: Date;
    endDate: Date;
    oneTimePrice: number;
    monthlyMaintenance: number;
    months: number;
}): ScheduleLine[] => {
    const lines: ScheduleLine[] = [];

    // The one-time fee is due on the start date.
    if (p.oneTimePrice > 0) {
        lines.push({
            kind: 'one_time', sequence: 0, label: 'One-time fee',
            periodStart: p.start, periodEnd: p.endDate, dueDate: p.start,
            amount: roundMoney(p.oneTimePrice),
        });
    }

    // Month i covers [start + (i-1) months, start + i months - 1 day] and is due on its first day.
    if (p.monthlyMaintenance > 0) {
        for (let i = 1; i <= p.months; i++) {
            const periodStart = addMonthsUTC(p.start, i - 1);
            const naturalEnd = addDays(addMonthsUTC(p.start, i), -1);
            const periodEnd = new Date(Math.max(periodStart.getTime(), Math.min(naturalEnd.getTime(), p.endDate.getTime())));
            lines.push({
                kind: 'maintenance', sequence: i, label: `Month ${i} of ${p.months}`,
                periodStart, periodEnd, dueDate: periodStart,
                amount: roundMoney(p.monthlyMaintenance),
            });
        }
    }
    return lines;
};

export interface InvoiceSummaryTotals {
    count: number; // issued + paid invoices (what has actually been billed, including scheduled months)
    totalInvoiced: number; // sum of issued + paid invoice totals
    totalPaid: number; // sum of money actually received
    outstanding: number; // unpaid balance that is due now or already overdue
    upcoming: number; // unpaid balance on charges that fall due in the future ("pending")
    balance: number; // outstanding + upcoming (= totalInvoiced - totalPaid)
    overdueCount: number; // issued invoices with a balance whose due date is before today
    overdueAmount: number;
    draftCount: number; // not yet issued, so not counted as billed
    draftTotal: number;
}

/**
 * Single source of truth for the money picture of an organization.
 *  - Void invoices count nowhere; drafts are reported separately and not billed.
 *  - A charge is "due" once its due date is today or earlier, otherwise it is "upcoming".
 */
export const summarizeInvoices = (invoices: (InvoiceMoneyLike & { total?: number })[], now: Date = new Date()): InvoiceSummaryTotals => {
    const dayStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const dayEnd = dayStart + DAY_MS - 1;
    const dueTime = (i: InvoiceMoneyLike) => (i.dueDate ? new Date(i.dueDate).getTime() : 0); // no due date = due now

    const billed = invoices.filter((i) => i.status === 'issued' || i.status === 'paid');
    const drafts = invoices.filter((i) => i.status === 'draft');
    const owing = billed.filter((i) => invoiceBalanceDue(i) > 0);

    const sumBalance = (list: InvoiceMoneyLike[]) => roundMoney(list.reduce((a, i) => a + invoiceBalanceDue(i), 0));
    const dueNow = owing.filter((i) => dueTime(i) <= dayEnd);
    const later = owing.filter((i) => dueTime(i) > dayEnd);
    const overdue = owing.filter((i) => dueTime(i) < dayStart);

    return {
        count: billed.length,
        totalInvoiced: roundMoney(billed.reduce((a, i) => a + toNumber(i.total, 0), 0)),
        totalPaid: roundMoney(billed.reduce((a, i) => a + invoiceAmountPaid(i), 0)),
        outstanding: sumBalance(dueNow),
        upcoming: sumBalance(later),
        balance: sumBalance(owing),
        overdueCount: overdue.length,
        overdueAmount: sumBalance(overdue),
        draftCount: drafts.length,
        draftTotal: roundMoney(drafts.reduce((a, i) => a + toNumber(i.total, 0), 0)),
    };
};