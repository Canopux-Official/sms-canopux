import mongoose, { Schema, Document } from 'mongoose';

export interface IResult extends Document {
  testId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  marksObtained: number | null;
  isAbsent: boolean;
  percentage: number | null; // computed at publish time, null until then / if absent
  rank: number | null;       // computed at publish time, null until then / if absent
  createdAt: Date;
  updatedAt: Date;
}

const ResultSchema: Schema = new Schema(
  {
    testId: {
      type: Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
      index: true
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
    },
    marksObtained: { type: Number, default: null },
    isAbsent: { type: Boolean, default: false },
    percentage: { type: Number, default: null },
    rank: { type: Number, default: null }
  },
  { timestamps: true }
);

// A student can only have one result row per test.
ResultSchema.index({ testId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IResult>('Result', ResultSchema);
