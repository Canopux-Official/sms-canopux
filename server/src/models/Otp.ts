import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;        
  attempts: number;   
  userId: mongoose.Types.ObjectId; 
  onModel: 'Student' | 'Admin';     
  createdAt: Date;
}

const OtpSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
  },

  otp: {
    type: String,
    required: true,
  },

  attempts: {
    type: Number,
    default: 0,
  },

  // Dynamic Reference Logic
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'onModel'
  },


  onModel: {
    type: String,
    required: true,
    enum: ['student', 'admin'], // Must match your export names in Student.ts and Admin.ts
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 minutes TTL
  },
});

export default mongoose.model<IOtp>("Otp", OtpSchema);
