import mongoose, { Schema, Document } from 'mongoose';

export interface IStream extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  isActive: boolean;
}

const StreamSchema: Schema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  name: {
    type: String,
    required: true,
    // Comment: Name of the stream (e.g., "Science", "Commerce", "Vocational").
  },
  isActive: {
    type: Boolean,
    default: true,
    // Comment: Soft delete flag.
  }
}, { timestamps: true });

StreamSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export default mongoose.model<IStream>('Stream', StreamSchema);