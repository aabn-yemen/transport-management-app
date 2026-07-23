import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface IStudent extends Document {
  studentNumber: string;
  universityId: string;
  firstName: string;
  secondName: string;
  thirdName: string;
  lastName: string;
  fullName: string;
  gender: 'male' | 'female';
  college: string;
  department: string;
  academicLevel: string;
  phone: string;
  guardianPhone: string;
  address: string;
  latitude: number;
  longitude: number;
  busId: Schema.Types.ObjectId | null;
  routeId: Schema.Types.ObjectId | null;
  destinationId: Schema.Types.ObjectId | null;
  subscriptionId: Schema.Types.ObjectId | null;
  attendanceId: Schema.Types.ObjectId | null;
  photo: string;
  qrCode: string;
  isLocal: boolean;
  status: 'active' | 'inactive' | 'suspended' | 'graduated';
  notes: string;
  userId: Schema.Types.ObjectId | null;
  parentId: Schema.Types.ObjectId | null;
}

const studentSchema = createBaseSchema();

studentSchema.add({
  studentNumber: { type: String, required: [true, 'Student number is required'], unique: true, trim: true },
  universityId: { type: String, required: [true, 'University ID is required'], unique: true, trim: true },
  firstName: { type: String, required: [true, 'First name is required'], trim: true },
  secondName: { type: String, trim: true, default: '' },
  thirdName: { type: String, trim: true, default: '' },
  lastName: { type: String, required: [true, 'Last name is required'], trim: true },
  fullName: { type: String, trim: true, default: '' },
  gender: { type: String, enum: ['male', 'female'], required: [true, 'Gender is required'] },
  college: { type: String, required: [true, 'College is required'], trim: true },
  department: { type: String, required: [true, 'Department is required'], trim: true },
  academicLevel: { type: String, required: [true, 'Academic level is required'], trim: true },
  phone: { type: String, required: [true, 'Phone is required'], trim: true },
  guardianPhone: { type: String, trim: true, default: '' },
  address: { type: String, trim: true, default: '' },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  busId: { type: Schema.Types.ObjectId, ref: 'Bus', default: null },
  routeId: { type: Schema.Types.ObjectId, ref: 'Route', default: null },
  destinationId: { type: Schema.Types.ObjectId, ref: 'Destination', default: null },
  subscriptionId: { type: Schema.Types.ObjectId, ref: 'StudentSubscription', default: null },
  attendanceId: { type: Schema.Types.ObjectId, ref: 'Attendance', default: null },
  photo: { type: String, default: '' },
  qrCode: { type: String, default: '' },
  isLocal: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'inactive', 'suspended', 'graduated'], default: 'active' },
  notes: { type: String, default: '' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  parentId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
});

studentSchema.index({ fullName: 1 });
studentSchema.index({ college: 1 });
studentSchema.index({ busId: 1 });
studentSchema.index({ routeId: 1 });
studentSchema.index({ status: 1 });

studentSchema.pre('save', function (next) {
  if (this.isModified('firstName') || this.isModified('secondName') || this.isModified('thirdName') || this.isModified('lastName')) {
    this.fullName = [this.firstName, this.secondName, this.thirdName, this.lastName].filter(Boolean).join(' ');
  }
  next();
});

studentSchema.virtual('bus', {
  ref: 'Bus',
  localField: 'busId',
  foreignField: '_id',
  justOne: true,
});

studentSchema.virtual('route', {
  ref: 'Route',
  localField: 'routeId',
  foreignField: '_id',
  justOne: true,
});

studentSchema.virtual('subscription', {
  ref: 'StudentSubscription',
  localField: 'subscriptionId',
  foreignField: '_id',
  justOne: true,
});

export const Student = model<IStudent>('Student', studentSchema);
