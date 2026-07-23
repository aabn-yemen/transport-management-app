import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface IDriver extends Document {
  driverNumber: string;
  fullName: string;
  phone: string;
  nationalId: string;
  licenseNumber: string;
  licenseExpiry: Date;
  address: string;
  photo: string;
  busId: Schema.Types.ObjectId | null;
  employmentDate: Date;
  salary: number;
  status: 'active' | 'inactive' | 'suspended' | 'resigned';
  rating: number;
  notes: string;
  userId: Schema.Types.ObjectId | null;
}

const driverSchema = createBaseSchema();

driverSchema.add({
  driverNumber: { type: String, required: [true, 'Driver number is required'], unique: true, trim: true },
  fullName: { type: String, required: [true, 'Full name is required'], trim: true },
  phone: { type: String, required: [true, 'Phone is required'], trim: true, unique: true },
  nationalId: { type: String, required: [true, 'National ID is required'], unique: true, trim: true },
  licenseNumber: { type: String, required: [true, 'License number is required'], trim: true },
  licenseExpiry: { type: Date, required: [true, 'License expiry date is required'] },
  address: { type: String, required: [true, 'Address is required'], trim: true },
  photo: { type: String, default: '' },
  busId: { type: Schema.Types.ObjectId, ref: 'Bus', default: null },
  employmentDate: { type: Date, required: [true, 'Employment date is required'] },
  salary: { type: Number, required: [true, 'Salary is required'], min: 0 },
  status: { type: String, enum: ['active', 'inactive', 'suspended', 'resigned'], default: 'active' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  notes: { type: String, default: '' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
});

driverSchema.index({ busId: 1 });
driverSchema.index({ status: 1 });

driverSchema.virtual('bus', {
  ref: 'Bus',
  localField: 'busId',
  foreignField: '_id',
  justOne: true,
});

export const Driver = model<IDriver>('Driver', driverSchema);
