// server/src/models/Organization.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
    // 1. Identity & Slug
    name: string;
    legalName?: string;
    slug: string;
    status: 'active' | 'suspended' | 'trial' | 'cancelled';

    // 2. Branding
    branding: {
        logoUrl?: string;
        faviconUrl?: string;
        primaryColor?: string;
        secondaryColor?: string;
        fontFamily?: string;
    };

    // 3. Domain & Hosting
    subdomain: string;
    customDomain?: string;
    customDomainStatus: 'none' | 'pending' | 'verified' | 'failed';

    // 4. Subscription & Billing
    planId: mongoose.Types.ObjectId;
    subscriptionStatus: 'trialing' | 'active' | 'past_due' | 'suspended' | 'cancelled';
    trialEndsAt?: Date;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    paymentProvider?: {
        name?: string;
        customerId?: string;
        subscriptionId?: string;
    };

    // 5. Usage tracking
    usage: {
        currentStudentCount: number;
        lastCalculatedAt?: Date;
    };

    // 7. Contact & ownership
    primaryContact: {
        name: string;
        email: string;
        phone: string;
    };
    billingContact?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        pincode?: string;
        country?: string;
    };

    // 10. Extensibility escape hatch
    metadata?: Record<string, any>;
}

const OrganizationSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        // Comment: Display name of the institute, shown on their landing page and branding.
    },
    legalName: {
        type: String,
        // Comment: Registered entity name, kept separate from display name for invoicing/GST later.
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        // Comment: Drives {slug}.sms.canopux.org. Checked against a reserved-words list at creation.
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'trial', 'cancelled'],
        default: 'trial',
        // Comment: Org-level access state, distinct from subscriptionStatus below — lets us
        // keep an org accessible even if billing status diverges (e.g. manual goodwill extension).
    },

    branding: {
        logoUrl: { type: String },
        faviconUrl: { type: String },
        primaryColor: { type: String },
        secondaryColor: { type: String },
        fontFamily: { type: String },
    },

    subdomain: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        // Comment: Usually mirrors slug, kept separate in case they're ever allowed to diverge.
    },
    customDomain: {
        type: String,
        unique: true,
        sparse: true,
        // Comment: sparse index so multiple orgs without a custom domain don't collide on null.
    },
    customDomainStatus: {
        type: String,
        enum: ['none', 'pending', 'verified', 'failed'],
        default: 'none',
        // Comment: Reserved for the future custom-domain verification flow (Phase 10).
    },

    planId: {
        type: Schema.Types.ObjectId,
        ref: 'Plan',
        required: true,
        // Comment: Points at a Plan document (student-count slab + price), not a hardcoded enum,
        // so pricing tiers can change without touching this schema.
    },
    subscriptionStatus: {
        type: String,
        enum: ['trialing', 'active', 'past_due', 'suspended', 'cancelled'],
        default: 'trialing',
    },
    trialEndsAt: { type: Date },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    paymentProvider: {
        name: { type: String },
        customerId: { type: String },
        subscriptionId: { type: String },
        // Comment: Generic on purpose — filled in by whichever gateway (Razorpay/Stripe) is chosen later.
    },

    usage: {
        currentStudentCount: { type: Number, default: 0 },
        lastCalculatedAt: { type: Date },
        // Comment: Denormalized counter, updated on student create/delete, so plan-limit checks
        // don't need a countDocuments() aggregation on every request.
    },

    primaryContact: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
    },
    billingContact: {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
    },
    address: {
        line1: { type: String },
        line2: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
        country: { type: String, default: 'India' },
    },

    metadata: {
        type: Schema.Types.Mixed,
        // Comment: Free-form bucket for anything added later that doesn't deserve its own field yet.
    },
}, { timestamps: true });

export default mongoose.model<IOrganization>('Organization', OrganizationSchema);