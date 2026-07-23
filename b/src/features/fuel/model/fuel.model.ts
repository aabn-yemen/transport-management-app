import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface IFuelLog extends Document {
  busId: Schema.Types.ObjectId;
  driverId: Schema.Types.ObjectId;
  liters: number;
  price: number;
  totalCost: number;
  station: string;
  odometer: number;
  date: Date;
  notes: string;
}

const fuelLogSchema = createBaseSchema();

fuelLogSchema.add({
  busId: { type: Schema.Types.ObjectId, ref: 'Bus', required: [true, 'Bus is required'] },
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: [true, 'Driver is required'] },
  liters: { type: Number, required: [true, 'Liters is required'], min: 0 },
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  totalCost: { type: Number, default: 0, min: 0 },
  station: { type: String, required: [true, 'Station is required'], trim: true },
  odometer: { type: Number, required: [true, 'Odometer is required'], min: 0 },
  date: { type: Date, required: [true, 'Date is required'] },
  notes: { type: String, default: '' },
});

fuelLogSchema.index({ busId: 1, date: 1 });
fuelLogSchema.index({ driverId: 1 });
fuelLogSchema.index({ date: 1 });

fuelLogSchema.pre('save', function (next) {
  const doc = this as any;
  doc.totalCost = doc.liters * doc.price;
  next();
});

export const FuelLog = model<IFuelLog>('FuelLog', fuelLogSchema);
