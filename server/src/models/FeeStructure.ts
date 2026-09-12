import mongoose, { Schema, Document } from 'mongoose';

// A single row in the installment schedule of a fee template.
export interface IInstallmentTemplate {
  label: string;      
  dueDate: Date;
  amount: number;
}

export interface IFeeStructure extends Document {
  classType: '9' | '10' | '11' | '12' | 'dropper-1' | 'dropper-2';
  stream?: mongoose.Types.ObjectId | null;   
  targetExam: mongoose.Types.ObjectId;
  academicSession: string;
  totalAmount: number;                     
  installments: IInstallmentTemplate[];
  isActive: boolean;
}

const InstallmentTemplateSchema = new Schema<IInstallmentTemplate>({
  label: { type: String, required: true },
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true, min: 0 }
}, { _id: false });

const FeeStructureSchema: Schema = new Schema({
  classType: {
    type: String,
    required: true,
    enum: ['9', '10', '11', '12', 'dropper-1', 'dropper-2']
  },
  stream: {
    type: Schema.Types.ObjectId,
    ref: 'Stream',
    default: null
  },
  targetExam: {
    type: Schema.Types.ObjectId,
    ref: 'TargetExam',
    required: true
  },
  academicSession: {
    type: String,
    required: true
    // Comment: e.g. "2025-26". Mirrors Student.academicSession.
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
    // Comment: Always kept in sync with sum(installments.amount) by the controller.
  },
  installments: {
    type: [InstallmentTemplateSchema],
    validate: {
      validator: (arr: IInstallmentTemplate[]) => Array.isArray(arr) && arr.length > 0,
      message: 'At least one installment is required'
    }
  },
  isActive: {
    type: Boolean,
    default: true
    // Comment: Soft delete flag, same pattern as Stream/Subject/TargetExam.
  }
}, { timestamps: true });

// Prevent duplicate templates for the same class/stream/exam/session combination.
FeeStructureSchema.index(
  { classType: 1, stream: 1, targetExam: 1, academicSession: 1 },
  { unique: true }
);

export default mongoose.model<IFeeStructure>('FeeStructure', FeeStructureSchema);