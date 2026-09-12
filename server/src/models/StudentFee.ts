import mongoose, { Schema, Document } from 'mongoose';

// A single installment on a student's actual ledger (copied from the
// FeeStructure template at assignment time, then tracked independently).
export interface IInstallment {
  _id?: mongoose.Types.ObjectId;
  label: string;
  dueDate: Date;
  amount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid';
}

export interface IStudentFee extends Document {
  studentId: mongoose.Types.ObjectId;
  feeStructureId?: mongoose.Types.ObjectId | null;
  academicSession: string;

  originalAmount: number;   // total before discount
  discountAmount: number;   // scholarship / concession
  discountReason?: string;
  netPayable: number;       // originalAmount - discountAmount

  installments: IInstallment[];

  totalPaid: number;        // derived, kept in sync on every payment
  totalDue: number;         // derived: netPayable - totalPaid
  isFullyPaid: boolean;
}

const InstallmentSchema = new Schema<IInstallment>({
  label: { type: String, required: true },
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending'
  }
});

const StudentFeeSchema: Schema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  feeStructureId: {
    type: Schema.Types.ObjectId,
    ref: 'FeeStructure',
    default: null
    // Comment: null when the fee was fully custom-entered (no template used).
  },
  academicSession: { type: String, required: true },

  originalAmount: { type: Number, required: true, min: 0 },
  discountAmount: { type: Number, default: 0, min: 0 },
  discountReason: { type: String, default: '' },
  netPayable: { type: Number, required: true, min: 0 },

  installments: {
    type: [InstallmentSchema],
    validate: {
      validator: (arr: IInstallment[]) => Array.isArray(arr) && arr.length > 0,
      message: 'At least one installment is required'
    }
  },

  totalPaid: { type: Number, default: 0, min: 0 },
  totalDue: { type: Number, required: true, min: 0 },
  isFullyPaid: { type: Boolean, default: false }
}, { timestamps: true });

// One fee ledger per student per academic session.
StudentFeeSchema.index({ studentId: 1, academicSession: 1 }, { unique: true });

export default mongoose.model<IStudentFee>('StudentFee', StudentFeeSchema);