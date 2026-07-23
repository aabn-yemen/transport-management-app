import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface IMaintenance extends Document {
  busId: Schema.Types.ObjectId;
  maintenanceType: Schema.Types.ObjectId;
  description: string;
  cost: number;
  maintenanceDate: Date;
  nextMaintenanceDate: Date | null;
  odometer: number;
  attachments: string[];
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  approvedBy: Schema.Types.ObjectId | null;
  completedBy: Schema.Types.ObjectId | null;
  notes: string;
}

const maintenanceSchema = createBaseSchema();

maintenanceSchema.add({
  busId: { type: Schema.Types.ObjectId, ref: 'Bus', required: [true, 'Bus is required'] },
  maintenanceType: { type: Schema.Types.ObjectId, ref: 'MaintenanceType', required: [true, 'Maintenance type is required'] },
  description: { type: String, required: [true, 'Description is required'], trim: true },
  cost: { type: Number, default: 0, min: 0 },
  maintenanceDate: { type: Date, required: [true, 'Maintenance date is required'] },
  nextMaintenanceDate: { type: Date, default: null },
  odometer: { type: Number, default: 0 },
  attachments: [{ type: String }],
  status: { type: String, enum: ['pending', 'approved', 'in_progress', 'completed', 'cancelled', 'rejected'], default: 'pending' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  completedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  notes: { type: String, default: '' },
});

maintenanceSchema.index({ busId: 1 });
maintenanceSchema.index({ maintenanceType: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ maintenanceDate: 1 });

export const Maintenance = model<IMaintenance>('Maintenance', maintenanceSchema);
