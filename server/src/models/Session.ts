import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId; // Reference to Admin, Student, or PlatformAdmin
  userType: 'Student' | 'Admin' | 'PlatformAdmin'; // To distinguish the role
  organizationId?: mongoose.Types.ObjectId; // Nullable for PlatformAdmin
  refreshToken: string; // The hashed or raw refresh token
  userAgent?: string; // Browser/device info
  ipAddress?: string; // IP from where logged in
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    userType: { type: String, enum: ['Student', 'Admin', 'PlatformAdmin'], required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    refreshToken: { type: String, required: true }, // Store a hashed version ideally, or just the token string if it's opaque
    userAgent: { type: String },
    ipAddress: { type: String },
    expiresAt: { type: Date, required: true, index: { expires: '0' } } // Auto-delete document on expiry
  },
  { timestamps: true }
);

// Index for quickly looking up sessions for a specific user and token
SessionSchema.index({ userId: 1, refreshToken: 1 });

export default mongoose.model<ISession>('Session', SessionSchema);
