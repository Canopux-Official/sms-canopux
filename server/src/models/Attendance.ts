import mongoose, { Schema, Document } from 'mongoose';


export interface IAttendance extends Document {
    organizationId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    year: number;
    month: number;
    days: {};
    stats: {
        present: number;
        absent: number;
    }
}


const AttedanceSchema: Schema = new Schema({
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    studentId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Student'
    },
    year: {
        type: Number,
        required: true,

    },
    month: {
        type: Number,
        required: true,
    },
    days: {
        type: Map,
        of: Boolean,
        default: new Map()
    },
    stats: {
        present: { type: Number, default: 0 },
        absent: { type: Number, default: 0 }
    }
}, {
    timestamps: true
})

AttedanceSchema.index({ organizationId: 1, studentId: 1, year: 1, month: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttedanceSchema);