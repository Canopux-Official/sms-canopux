// // server/src/models/Plan.ts
// import mongoose, { Schema, Document } from 'mongoose';

// export interface IPlan extends Document {
//     name: string;
//     minStudents: number;
//     maxStudents?: number; // null/undefined = custom/enterprise tier
//     monthlyPrice: number;
//     isCustom: boolean;
//     isActive: boolean;
// }

// const PlanSchema: Schema = new Schema({
//     name: {
//         type: String,
//         required: true,
//         // Comment: e.g. "Starter", "Basic", "Growth", "Enterprise".
//     },
//     minStudents: {
//         type: Number,
//         required: true,
//         default: 0,
//     },
//     maxStudents: {
//         type: Number,
//         // Comment: Left undefined for the custom/enterprise tier (no upper bound).
//     },
//     monthlyPrice: {
//         type: Number,
//         required: true,
//     },
//     isCustom: {
//         type: Boolean,
//         default: false,
//         // Comment: True for the "contact us" tier — no self-serve price to show.
//     },
//     isActive: {
//         type: Boolean,
//         default: true,
//         // Comment: Lets old plans be retired without deleting history for orgs still on them.
//     },
// }, { timestamps: true });

// export default mongoose.model<IPlan>('Plan', PlanSchema);





// server/src/models/Plan.ts
//
// A Plan is a reusable TEMPLATE the platform admin (Canopux) creates and then assigns to
// organizations. Assigning a plan never links an org "live" to the template: the values are
// copied into a Subscription snapshot (see Subscription.ts), so editing a plan later only
// affects FUTURE assignments and never rewrites history or past invoices.
import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
    name: string;
    description?: string;
    minStudents: number;
    maxStudents?: number; // undefined = unlimited / custom-enterprise tier
    durationDays: number; // how long one purchase of this plan lasts (30 = monthly, 365 = yearly ...)
    price: number; // ONE-TIME fee, charged once when the plan is assigned
    monthlyMaintenance: number; // fixed MONTHLY maintenance charge, billed for every month of the duration
    monthlyPrice: number; // mirrors monthlyMaintenance (kept for older code / dropdown labels)
    // LEGACY (read-only): per-student pricing is no longer creatable. These stay in the schema only so
    // plans created before the change can still be read and converted (see normalizePlan).
    pricingModel: 'fixed' | 'per_student';
    pricePerStudent: number;
    currency: string;
}

const PlanSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        // Comment: e.g. "Starter", "Growth", "Annual Pro", or a one-off "Mittal Institute Custom".
    },
    description: {
        type: String,
        default: '',
    },
    minStudents: {
        type: Number,
        required: true,
        default: 0,
    },
    maxStudents: {
        type: Number,
        // Comment: Left undefined for the custom/enterprise tier (no upper bound).
    },
    durationDays: {
        type: Number,
        default: 30,
        min: 1,
        // Comment: Length of one billing period in days. Legacy plans created before this field
        // existed simply read as 30 days.
    },
    pricingModel: {
        type: String,
        enum: ['fixed', 'per_student'],
        default: 'fixed',
        // Comment: LEGACY. Always saved as 'fixed' now; only old per-student plans may still read 'per_student'.
    },
    price: {
        type: Number,
        default: 0,
        min: 0,
        // Comment: One-time fee, charged once per purchase.
    },
    monthlyMaintenance: {
        type: Number,
        min: 0,
        // Comment: Fixed monthly maintenance charge. Left undefined on legacy plans (see normalizePlan).
    },
    pricePerStudent: {
        type: Number,
        default: 0,
        min: 0,
    },
    monthlyPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    currency: {
        type: String,
        default: 'INR',
    },
}, { timestamps: true });

export default mongoose.model<IPlan>('Plan', PlanSchema);