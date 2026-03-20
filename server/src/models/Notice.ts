import mongoose, { Schema, Document } from 'mongoose';

export interface INotice extends Document {
  heading: string;
  description?: string;
  imageLink?: string;
  tag?: string;
  classType: '9' | '10' | '11' | '12' | 'dropper-1' | 'dropper-2' | '';
  targetExams: mongoose.Types.ObjectId[];
  streams: mongoose.Types.ObjectId[];
  isForAll: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    heading: {
      type: String,
      required: [true, 'Heading is required'],
      trim: true,
      maxlength: [200, 'Heading cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    imageLink: {
      type: String,
      trim: true,
      default: ''
    },
    tag: {
      type: String,
      trim: true,
      default: ''
    },
    classType: {
      type: String,
      enum: ['9', '10', '11', '12', 'dropper-1', 'dropper-2', ''],
      required: false,
      default: ''
    },
    streams: [{
      type: Schema.Types.ObjectId,
      ref: 'Stream'
    }],
    targetExams: [{
      type: Schema.Types.ObjectId,
      ref: 'TargetExam'
    }],
    isForAll: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// No custom indexes - MongoDB will only use the default _id index

export default mongoose.model<INotice>('Notice', NoticeSchema);