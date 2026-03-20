import mongoose , {Schema,Document} from 'mongoose';


export interface IAttendance extends Document{
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
    studentId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Student'
    },
    year:{
        type: Number,
        required: true,

    },
    month:{
        type: Number,
        required: true,
    },
    days: {
        type: Map,
        of: Boolean,
        default: new Map()
    },
    stats: {
        present: {type: Number, default: 0},
        absent: {type: Number, default: 0}
    }
},{
    timestamps: true
})

export default mongoose.model<IAttendance>('Attendance',AttedanceSchema);