import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  stream?: mongoose.Types.ObjectId; // Changed from string
  isActive: boolean;
}

const SubjectSchema: Schema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  name: {
    type: String,
    required: true,
    // Comment: The subject name (e.g., "Physics", "Chemistry").
  },

  stream: {
    type: Schema.Types.ObjectId,
    ref: 'Stream',
    required: false
    // Comment: Links subject to a specific stream (e.g., Physics -> Science).
  },

  isActive: {
    type: Boolean,
    default: true,
    // Comment: If you stop teaching a subject, set this to false.
  },
}, { timestamps: true });

SubjectSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export default mongoose.model<ISubject>('Subject', SubjectSchema);