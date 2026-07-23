import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface IBus extends Document {
  busNumber: string;
  plateNumber: string;
  vin: string;
  brand: string;
  modelName: string;
  year: number;
  capacity: number;
  currentStudents: number;
  driverId: Schema.Types.ObjectId | null;
  routeId: Schema.Types.ObjectId | null;
  destinationId: Schema.Types.ObjectId | null;
  currentLatitude: number;
  currentLongitude: number;
  speed: number;
  fuelLevel: number;
  odometer: number;
  status: 'active' | 'inactive' | 'maintenance' | 'out_of_service';
  photo: string;
}

const busSchema = createBaseSchema();

busSchema.add({
  busNumber: { type: String, required: [true, 'Bus number is required'], unique: true, trim: true },
  plateNumber: { type: String, required: [true, 'Plate number is required'], unique: true, trim: true },
  vin: { type: String, trim: true, default: '' },
  brand: { type: String, required: [true, 'Brand is required'], trim: true },
  modelName: { type: String, required: [true, 'Model is required'], trim: true },
  year: { type: Number, required: [true, 'Year is required'], min: 2000, max: 2030 },
  capacity: { type: Number, required: [true, 'Capacity is required'], min: 1, max: 100 },
  currentStudents: { type: Number, default: 0, min: 0 },
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver', default: null },
  routeId: { type: Schema.Types.ObjectId, ref: 'Route', default: null },
  destinationId: { type: Schema.Types.ObjectId, ref: 'Destination', default: null },
  currentLatitude: { type: Number, default: 0 },
  currentLongitude: { type: Number, default: 0 },
  speed: { type: Number, default: 0 },
  fuelLevel: { type: Number, default: 100, min: 0, max: 100 },
  odometer: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'maintenance', 'out_of_service'], default: 'active' },
  photo: { type: String, default: '' },
});

busSchema.index({ driverId: 1 });
busSchema.index({ routeId: 1 });
busSchema.index({ status: 1 });

busSchema.virtual('driver', {
  ref: 'Driver',
  localField: 'driverId',
  foreignField: '_id',
  justOne: true,
});

busSchema.virtual('route', {
  ref: 'Route',
  localField: 'routeId',
  foreignField: '_id',
  justOne: true,
});

busSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'busId',
});

export const Bus = model<IBus>('Bus', busSchema);
