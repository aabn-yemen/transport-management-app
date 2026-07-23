import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface IMaintenanceType extends Document {
  name: string;
  nameAr: string;
  description: string;
  estimatedCost: number;
  intervalDays: number;
  status: 'active' | 'inactive';
}

const maintenanceTypeSchema = createBaseSchema();

maintenanceTypeSchema.add({
  name: { type: String, required: [true, 'Maintenance type name is required'], trim: true, unique: true },
  nameAr: { type: String, required: [true, 'Arabic name is required'], trim: true },
  description: { type: String, default: '' },
  estimatedCost: { type: Number, default: 0, min: 0 },
  intervalDays: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});

export const MaintenanceType = model<IMaintenanceType>('MaintenanceType', maintenanceTypeSchema);
