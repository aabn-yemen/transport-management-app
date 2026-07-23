import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface IActivityLog extends Document {
  userId: Schema.Types.ObjectId | null;
  fullName: string;
  module: string;
  action: string;
  recordId: Schema.Types.ObjectId | null;
  description: string;
  device: string;
  ipAddress: string;
  userAgent: string;
}

const activityLogSchema = createBaseSchema();

activityLogSchema.add({
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  fullName: { type: String, default: '' },
  module: { type: String, required: [true, 'Module is required'], trim: true },
  action: { type: String, required: [true, 'Action is required'], trim: true },
  recordId: { type: Schema.Types.ObjectId, default: null },
  description: { type: String, default: '' },
  device: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
});

activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ module: 1, action: 1 });
activityLogSchema.index({ createdAt: -1 });

export const ActivityLog = model<IActivityLog>('ActivityLog', activityLogSchema);
