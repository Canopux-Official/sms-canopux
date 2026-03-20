import mongoose, { Schema, Document } from 'mongoose';

export interface ITargetExam extends Document {
  name: string;
  isActive: boolean;
}

const TargetExamSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    // Comment: Name of the exam (e.g., "JEE Mains", "NEET", "Olympiad").
  },
  isActive: { 
    type: Boolean, 
    default: true,
    // Comment: Soft delete flag.
  }
}, { timestamps: true });

export default mongoose.model<ITargetExam>('TargetExam', TargetExamSchema);