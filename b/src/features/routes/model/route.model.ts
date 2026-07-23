import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface IRoute extends Document {
  routeName: string;
  routeCode: string;
  distance: number;
  estimatedTime: number;
  destinationId: Schema.Types.ObjectId;
  stops: Schema.Types.ObjectId[];
  status: 'active' | 'inactive';
}

const routeSchema = createBaseSchema();

routeSchema.add({
  routeName: { type: String, required: [true, 'Route name is required'], trim: true },
  routeCode: { type: String, required: [true, 'Route code is required'], unique: true, trim: true },
  distance: { type: Number, default: 0, min: 0 },
  estimatedTime: { type: Number, default: 0, min: 0 },
  destinationId: { type: Schema.Types.ObjectId, ref: 'Destination', required: [true, 'Destination is required'] },
  stops: [{ type: Schema.Types.ObjectId, ref: 'BusStop' }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});

routeSchema.index({ destinationId: 1 });
routeSchema.index({ status: 1 });

routeSchema.virtual('destination', {
  ref: 'Destination',
  localField: 'destinationId',
  foreignField: '_id',
  justOne: true,
});

routeSchema.virtual('busStops', {
  ref: 'BusStop',
  localField: 'stops',
  foreignField: '_id',
});

export const Route = model<IRoute>('Route', routeSchema);
