// server/src/models/Invoice.ts
//
// Invoices are created by the platform admin (usually automatically as a DRAFT when a plan is
// assigned), then edited freely, issued, and downloaded as PDF to hand over to the institute.
// Every money field is recomputed server-side from `items`, `discountPercent` and `taxPercent`
// on each save, so the numbers on the PDF can never disagree with the line items.
import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceParty {
    name?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    gstin?: string;
}

export interface IInvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

export interface IInvoicePayment {
    _id?: mongoose.Types.ObjectId;
    amount: number;
    paidAt: Date;
    method?: string;
    reference?: string;
    note?: string;
}

/** Set on invoices generated from a plan purchase's billing schedule (one-time fee / each month). */
export interface IInvoiceInstallment {
    kind: 'one_time' | 'maintenance';
    sequence: number; // 0 = the one-time fee, 1..n = month number
    label: string;
}

export interface IInvoice extends Document {
    organizationId: mongoose.Types.ObjectId;
    subscriptionId?: mongoose.Types.ObjectId;
    invoiceNumber: string;
    status: 'draft' | 'issued' | 'paid' | 'void';
    issueDate: Date;
    dueDate?: Date;
    paidAt?: Date; // date of the latest payment (kept for the PDF / older code)
    paymentMethod?: string; // method of the latest payment
    paymentReference?: string; // reference of the latest payment
    installment?: IInvoiceInstallment; // present for scheduled plan charges, absent for manual/legacy invoices
    voidReason?: string; // why the invoice was voided automatically (e.g. plan changed)
    payments: IInvoicePayment[]; // every payment received against this invoice (partial payments allowed)
    seller: IInvoiceParty & { paymentInstructions?: string };
    billedTo: IInvoiceParty;
    periodStart?: Date;
    periodEnd?: Date;
    items: IInvoiceItem[];
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    taxPercent: number;
    taxAmount: number;
    total: number;
    currency: string;
    notes?: string;
    terms?: string;
    createdBy?: string;
}

const PartySchema = new Schema({
    name: { type: String, default: '' },
    contactName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    gstin: { type: String, default: '' },
}, { _id: false });

const SellerSchema = new Schema({
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    gstin: { type: String, default: '' },
    paymentInstructions: { type: String, default: '' },
}, { _id: false });

const ItemSchema = new Schema({
    description: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true, default: 0 },
    amount: { type: Number, required: true, default: 0 },
}, { _id: false });

const PaymentSchema = new Schema({
    amount: { type: Number, required: true, min: 0.01 },
    paidAt: { type: Date, required: true, default: Date.now },
    method: { type: String, default: '' },
    reference: { type: String, default: '' },
    note: { type: String, default: '' },
}, { _id: true });

const InvoiceSchema: Schema = new Schema({
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', index: true },
    invoiceNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: ['draft', 'issued', 'paid', 'void'], default: 'draft' },
    issueDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date },
    paidAt: { type: Date },
    paymentMethod: { type: String, default: '' },
    paymentReference: { type: String, default: '' },
    payments: { type: [PaymentSchema], default: [] },
    installment: {
        kind: { type: String, enum: ['one_time', 'maintenance'] },
        sequence: { type: Number },
        label: { type: String },
    },
    voidReason: { type: String, default: '' },
    seller: { type: SellerSchema, default: () => ({}) },
    billedTo: { type: PartySchema, default: () => ({}) },
    periodStart: { type: Date },
    periodEnd: { type: Date },
    items: { type: [ItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    notes: { type: String, default: '' },
    terms: { type: String, default: '' },
    createdBy: { type: String },
}, { timestamps: true });

InvoiceSchema.index({ organizationId: 1, issueDate: -1 });

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);