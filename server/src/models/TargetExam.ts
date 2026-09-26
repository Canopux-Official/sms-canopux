import mongoose, { Schema, Document } from 'mongoose';

export interface ITargetExam extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  isActive: boolean;
}

const TargetExamSchema: Schema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  name: {
    type: String,
    required: true,
    // Comment: Name of the exam (e.g., "JEE Mains", "NEET", "Olympiad").
  },
  isActive: {
    type: Boolean,
    default: true,
    // Comment: Soft delete flag.
  }
}, { timestamps: true });

TargetExamSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export default mongoose.model<ITargetExam>('TargetExam', TargetExamSchema);