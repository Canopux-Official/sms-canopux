import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document<string> {
  _id: string; // The ID will be the name of the counter (e.g., 'enrollmentNumber')
  sequence_value: number;
}

const CounterSchema: Schema = new Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});

export default mongoose.model<ICounter>('Counter', CounterSchema);
