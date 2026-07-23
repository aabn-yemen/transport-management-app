import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface IDestination extends Document {
  destinationName: string;
  city: string;
  description: string;
  status: 'active' | 'inactive';
}

const destinationSchema = createBaseSchema();

destinationSchema.add({
  destinationName: { type: String, required: [true, 'Destination name is required'], trim: true, unique: true },
  city: { type: String, required: [true, 'City is required'], trim: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});

destinationSchema.index({ status: 1 });

export const Destination = model<IDestination>('Destination', destinationSchema);
