import mongoose, { Schema, Document } from 'mongoose';

export interface IFeePayment extends Document {
  studentFeeId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  installmentId: mongoose.Types.ObjectId;
  installmentLabel: string;   // snapshot, so history reads fine even if the ledger changes later

  amount: number;
  mode: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque';
  transactionRef?: string;    // UTR / cheque no. / gateway ref — optional

  receiptNumber: string;      // auto-generated via Counter, e.g. RCPT0000001
  collectedBy: mongoose.Types.ObjectId; // Admin who recorded the payment
  remarks?: string;

  status: 'success' | 'refunded';
  paidAt: Date;
}

const FeePaymentSchema: Schema = new Schema({
  studentFeeId: {
    type: Schema.Types.ObjectId,
    ref: 'StudentFee',
    required: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  installmentId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  installmentLabel: { type: String, required: true },

  amount: { type: Number, required: true, min: 0.01 },
  mode: {
    type: String,
    enum: ['cash', 'upi', 'card', 'bank_transfer', 'cheque'],
    required: true
  },
  transactionRef: { type: String, default: '' },

  receiptNumber: { type: String, required: true, unique: true },
  collectedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  remarks: { type: String, default: '' },

  status: {
    type: String,
    enum: ['success', 'refunded'],
    default: 'success'
  },
  paidAt: { type: Date, default: Date.now }
}, { timestamps: true });

FeePaymentSchema.index({ studentId: 1, paidAt: -1 });

export default mongoose.model<IFeePayment>('FeePayment', FeePaymentSchema);