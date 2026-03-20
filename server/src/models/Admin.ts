import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  name: string;
  phoneNumber: string;
  role: 'superadmin' | 'admin';
  email: string;
  password: string;
  permissions?: {
    students: boolean;
    streams: boolean;
    targetExams: boolean;
    subjects: boolean;
    session: boolean;
    upload: boolean;
    notice: boolean;
    attendance: boolean;
  };
}

const AdminSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    // Comment: Name of the administrator.
  },

  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    // Comment: The specific phone number authorized to access the Admin Panel. 
    // Login flow checks this collection first.
  },

  role: {
    type: String,
    enum: ['superadmin', 'admin'],
    default: 'admin',
    // Comment: Future-proofing. 'superadmin' might be able to delete other admins, 
    // while 'admin' can only manage students.
  },
  email: {
    type: String,
    required: true,
    unique: true,
    // Comment: Contact email for the admin. Used for notifications and password recovery.
  },
  password: {
    type: String,
    required: true,
    // Comment: Hashed password for admin authentication.
  },
  permissions: {
    students: { type: Boolean, default: false },
    streams: { type: Boolean, default: false },
    targetExams: { type: Boolean, default: false },
    subjects: { type: Boolean, default: false },
    session: { type: Boolean, default: false },
    upload: { type: Boolean, default: false },
    notice: { type: Boolean, default: false },
    attendance: { type: Boolean, default: false }
  }
}, { timestamps: true });

export default mongoose.model<IAdmin>('Admin', AdminSchema);