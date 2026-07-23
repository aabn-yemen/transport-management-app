import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface IAuditLog extends Document {
  collectionName: string;
  recordId: Schema.Types.ObjectId;
  operation: 'create' | 'update' | 'delete' | 'restore';
  oldData: Record<string, unknown>;
  newData: Record<string, unknown>;
  userId: Schema.Types.ObjectId | null;
  ipAddress: string;
  device: string;
}

const auditLogSchema = createBaseSchema();

auditLogSchema.add({
  collectionName: { type: String, required: [true, 'Collection name is required'], trim: true },
  recordId: { type: Schema.Types.ObjectId, required: true },
  operation: { type: String, enum: ['create', 'update', 'delete', 'restore'], required: true },
  oldData: { type: Schema.Types.Mixed, default: {} },
  newData: { type: Schema.Types.Mixed, default: {} },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  ipAddress: { type: String, default: '' },
  device: { type: String, default: '' },
});

auditLogSchema.index({ collectionName: 1, recordId: 1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ operation: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
