import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface IStudentSubscription extends Document {
  studentId: Schema.Types.ObjectId;
  busId: Schema.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  amount: number;
  discount: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded' | 'cancelled';
  status: 'active' | 'expired' | 'suspended' | 'cancelled';
  notes: string;
}

const subscriptionSchema = createBaseSchema();

subscriptionSchema.add({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: [true, 'Student is required'] },
  busId: { type: Schema.Types.ObjectId, ref: 'Bus', required: [true, 'Bus is required'] },
  startDate: { type: Date, required: [true, 'Start date is required'] },
  endDate: { type: Date, required: [true, 'End date is required'] },
  amount: { type: Number, required: [true, 'Amount is required'], min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'partial', 'refunded', 'cancelled'], default: 'pending' },
  status: { type: String, enum: ['active', 'expired', 'suspended', 'cancelled'], default: 'active' },
  notes: { type: String, default: '' },
});

subscriptionSchema.index({ studentId: 1 });
subscriptionSchema.index({ busId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });

subscriptionSchema.pre('save', function (next) {
  const doc = this as any;
  doc.totalAmount = doc.amount - doc.discount;
  next();
});

export const StudentSubscription = model<IStudentSubscription>('StudentSubscription', subscriptionSchema);
