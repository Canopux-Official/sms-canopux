import mongoose, { Schema, Document } from 'mongoose';

export interface IStream extends Document {
  name: string;
  isActive: boolean;
}

const StreamSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    // Comment: Name of the stream (e.g., "Science", "Commerce", "Vocational").
  },
  isActive: { 
    type: Boolean, 
    default: true,
    // Comment: Soft delete flag.
  }
}, { timestamps: true });

export default mongoose.model<IStream>('Stream', StreamSchema);