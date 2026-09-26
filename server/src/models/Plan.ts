// server/src/models/Plan.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
    name: string;
    minStudents: number;
    maxStudents?: number; // null/undefined = custom/enterprise tier
    monthlyPrice: number;
    isCustom: boolean;
    isActive: boolean;
}

const PlanSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        // Comment: e.g. "Starter", "Basic", "Growth", "Enterprise".
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
    monthlyPrice: {
        type: Number,
        required: true,
    },
    isCustom: {
        type: Boolean,
        default: false,
        // Comment: True for the "contact us" tier — no self-serve price to show.
    },
    isActive: {
        type: Boolean,
        default: true,
        // Comment: Lets old plans be retired without deleting history for orgs still on them.
    },
}, { timestamps: true });

export default mongoose.model<IPlan>('Plan', PlanSchema);