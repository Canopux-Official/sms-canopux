// server/src/models/PlatformAdmin.ts
//
// Deliberately a SEPARATE collection from Admin.ts. Admin.ts is an institute-level
// account scoped to one organizationId (school staff). PlatformAdmin is a Canopux-staff
// account with no organizationId — it manages every organization from the master-admin-sms
// console. Keeping these as two collections (rather than a role on Admin) means an institute
// admin can never accidentally be granted platform-wide access, and vice versa.
import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformAdmin extends Document {
  name: string;
  email: string;
  password: string;
  role: 'platform-superadmin';
}

const PlatformAdminSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // Comment: Login identifier for the platform console. Globally unique (no org scoping —
      // there is no organization for a platform admin to belong to).
    },
    password: {
      type: String,
      required: true,
      // Comment: Hashed with bcryptjs, same as Admin.password and Student.password.
    },
    role: {
      type: String,
      enum: ['platform-superadmin'],
      default: 'platform-superadmin',
      // Comment: Single role today. Kept as an enum (not a boolean/omitted field) so a second
      // tier (e.g. 'platform-support') can be added later without a schema migration.
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPlatformAdmin>('PlatformAdmin', PlatformAdminSchema);