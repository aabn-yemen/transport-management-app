import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface IBusStop extends Document {
  stopName: string;
  latitude: number;
  longitude: number;
  order: number;
  routeId: Schema.Types.ObjectId;
}

const busStopSchema = createBaseSchema();

busStopSchema.add({
  stopName: { type: String, required: [true, 'Stop name is required'], trim: true },
  latitude: { type: Number, required: [true, 'Latitude is required'] },
  longitude: { type: Number, required: [true, 'Longitude is required'] },
  order: { type: Number, required: [true, 'Order is required'], min: 1 },
  routeId: { type: Schema.Types.ObjectId, ref: 'Route', required: [true, 'Route is required'] },
});

busStopSchema.index({ routeId: 1, order: 1 });

export const BusStop = model<IBusStop>('BusStop', busStopSchema);
