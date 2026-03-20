import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  enrollmentNumber: string;
  profilePhoto?: string;
  name: string;
  dob: Date;
  phoneNumber: string;
  parentPhoneNumber?: string;
  email: string;
  currentClass: string;
  password: string;
  stream?: mongoose.Types.ObjectId; // Reference
  targetExams: mongoose.Types.ObjectId[]; // Array of References
  enrolledSubjects: mongoose.Types.ObjectId[];
  academicSession: string;
  admissionDate: Date;
  isActive: boolean;
}

const StudentSchema: Schema = new Schema({
  // Basic Identity
  enrollmentNumber: { type: String, required: true, unique: true, index: true },
  profilePhoto: { type: String, default: '' },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  phoneNumber: { type: String, required: true, unique: true, index: true },
  parentPhoneNumber: { type: String },
  email: { type: String, index: true },
  password: { type: String, required: true },

  // Academic Standing
  currentClass: {
    type: String,
    required: true,
    enum: ['9', '10', '11', '12', 'dropper-1', 'dropper-2']
  },

  stream: {
    type: Schema.Types.ObjectId,
    ref: 'Stream',
    default: null
    // Comment: Dynamic reference to Stream model.
  },

  // *** CRITICAL ACCESS CONTROL ***
  targetExams: [{
    type: Schema.Types.ObjectId,
    ref: 'TargetExam',
    required: true
    // Comment: Dynamic reference to TargetExam model.
  }],

  // Granular Access
  enrolledSubjects: [{
    type: Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  }],

  // Administrative
  academicSession: { type: String, required: true },
  admissionDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },

}, { timestamps: true });

export default mongoose.model<IStudent>('Student', StudentSchema);