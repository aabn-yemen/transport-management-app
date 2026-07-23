import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface INotification extends Document {
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'alert';
  receiverType: 'all' | 'role' | 'user' | 'driver' | 'student' | 'parent';
  receiverId: Schema.Types.ObjectId | null;
  roleId: Schema.Types.ObjectId | null;
  data: Record<string, unknown>;
  isRead: boolean;
  readAt: Date | null;
}

const notificationSchema = createBaseSchema();

notificationSchema.add({
  title: { type: String, required: [true, 'Title is required'], trim: true },
  titleAr: { type: String, default: '' },
  body: { type: String, required: [true, 'Body is required'], trim: true },
  bodyAr: { type: String, default: '' },
  type: { type: String, enum: ['info', 'warning', 'success', 'error', 'alert'], default: 'info' },
  receiverType: { type: String, enum: ['all', 'role', 'user', 'driver', 'student', 'parent'], required: true },
  receiverId: { type: Schema.Types.ObjectId, default: null },
  roleId: { type: Schema.Types.ObjectId, ref: 'Role', default: null },
  data: { type: Schema.Types.Mixed, default: {} },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
});

notificationSchema.index({ receiverId: 1, isRead: 1 });
notificationSchema.index({ receiverType: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
