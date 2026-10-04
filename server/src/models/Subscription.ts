// server/src/models/Subscription.ts
//
// One row per plan purchase/assignment for an organization. This is the billing HISTORY:
// "which plan did this institute have in September?" is answered by looking at these rows.
// The plan's values are SNAPSHOTTED here so later edits to the Plan template never change
// what an institute was actually sold.
import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
    organizationId: mongoose.Types.ObjectId;
    planId?: mongoose.Types.ObjectId;
    planSnapshot: {
        name: string;
        description?: string;
        maxStudents?: number | null;
        durationDays: number;
        pricingModel: 'fixed' | 'per_student'; // legacy, always 'fixed' for new purchases
        price: number; // legacy name for the one-time fee
        pricePerStudent: number; // legacy, always 0 for new purchases
        oneTimePrice?: number;
        monthlyMaintenance?: number;
        maintenanceMonths?: number;
    };
    startDate: Date;
    endDate: Date;
    // 'active'   = the org's current subscription (it may still be past endDate => "expired", computed on read)
    // 'replaced' = superseded by a newer assignment (endDate is truncated to the replacement moment)
    // 'cancelled'= manually cancelled
    status: 'active' | 'replaced' | 'cancelled';
    pricing: {
        subtotal: number;
        discountPercent: number;
        discountAmount: number;
        taxPercent: number;
        taxAmount: number;
        total: number;
        currency: string;
    };
    notes?: string;
    createdBy?: string;
    invoiceId?: mongoose.Types.ObjectId;
}

const SubscriptionSchema: Schema = new Schema({
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan' },
    planSnapshot: {
        name: { type: String, required: true },
        description: { type: String, default: '' },
        maxStudents: { type: Number, default: null },
        durationDays: { type: Number, required: true },
        pricingModel: { type: String, enum: ['fixed', 'per_student'], default: 'fixed' },
        price: { type: Number, default: 0 },
        pricePerStudent: { type: Number, default: 0 },
        oneTimePrice: { type: Number },
        monthlyMaintenance: { type: Number },
        maintenanceMonths: { type: Number },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'replaced', 'cancelled'], default: 'active' },
    pricing: {
        subtotal: { type: Number, default: 0 },
        discountPercent: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        taxPercent: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        currency: { type: String, default: 'INR' },
    },
    notes: { type: String, default: '' },
    createdBy: { type: String },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
}, { timestamps: true });

SubscriptionSchema.index({ organizationId: 1, status: 1, startDate: -1 });

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);