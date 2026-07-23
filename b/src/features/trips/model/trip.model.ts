import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface ITrip extends Document {
  tripNumber: string;
  busId: Schema.Types.ObjectId;
  driverId: Schema.Types.ObjectId;
  routeId: Schema.Types.ObjectId;
  destinationId: Schema.Types.ObjectId;
  studentIds: Schema.Types.ObjectId[];
  date: Date;
  startTime: Date | null;
  endTime: Date | null;
  status: 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'cancelled' | 'emergency';
  notes: string;
  delayMinutes: number;
  studentCount: number;
}

const tripSchema = createBaseSchema();

tripSchema.add({
  tripNumber: { type: String, required: [true, 'Trip number is required'], unique: true, trim: true },
  busId: { type: Schema.Types.ObjectId, ref: 'Bus', required: [true, 'Bus is required'] },
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: [true, 'Driver is required'] },
  routeId: { type: Schema.Types.ObjectId, ref: 'Route', required: [true, 'Route is required'] },
  destinationId: { type: Schema.Types.ObjectId, ref: 'Destination', required: [true, 'Destination is required'] },
  studentIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  date: { type: Date, required: [true, 'Date is required'] },
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null },
  status: { type: String, enum: ['scheduled', 'in_progress', 'paused', 'completed', 'cancelled', 'emergency'], default: 'scheduled' },
  notes: { type: String, default: '' },
  delayMinutes: { type: Number, default: 0 },
  studentCount: { type: Number, default: 0 },
});

tripSchema.index({ busId: 1, date: 1 });
tripSchema.index({ driverId: 1, date: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ date: 1 });

export const Trip = model<ITrip>('Trip', tripSchema);
