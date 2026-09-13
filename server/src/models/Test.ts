import mongoose, { Schema, Document } from 'mongoose';

export interface ITest extends Document {
  heading: string; // Test/exam name — doubles as the subject label (e.g. "Physics Unit Test 1")
  description?: string; // Optional syllabus/description shown to students
  totalMarks: number;
  testDate: Date;
  classType: '9' | '10' | '11' | '12' | 'dropper-1' | 'dropper-2';
  stream?: mongoose.Types.ObjectId | null;
  targetExam: mongoose.Types.ObjectId;
  // draft: just created, no students assigned yet — every field is still editable.
  // scheduled: students have been assigned — scope (class/stream/exam/totalMarks) is locked.
  // published: marks entry is locked, percentage + rank are computed, visible to students.
  status: 'draft' | 'scheduled' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const TestSchema: Schema = new Schema(
  {
    heading: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    totalMarks: { type: Number, required: true, min: 1 },
    testDate: { type: Date, required: true },

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

    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published'],
      default: 'draft'
    }
  },
  { timestamps: true }
);

export default mongoose.model<ITest>('Test', TestSchema);