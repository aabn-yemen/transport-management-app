import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface IAttendance extends Document {
  studentId: Schema.Types.ObjectId;
  tripId: Schema.Types.ObjectId;
  tripDate: Date;
  checkInTime: Date | null;
  checkOutTime: Date | null;
  checkInMethod: 'qr' | 'manual' | 'gps' | 'nfc';
  checkOutMethod: 'qr' | 'manual' | 'gps' | 'nfc';
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInLatitude: number;
  checkInLongitude: number;
  checkOutLatitude: number;
  checkOutLongitude: number;
  notes: string;
}

const attendanceSchema = createBaseSchema();

attendanceSchema.add({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: [true, 'Student is required'] },
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: [true, 'Trip is required'] },
  tripDate: { type: Date, required: [true, 'Trip date is required'] },
  checkInTime: { type: Date, default: null },
  checkOutTime: { type: Date, default: null },
  checkInMethod: { type: String, enum: ['qr', 'manual', 'gps', 'nfc'], default: 'manual' },
  checkOutMethod: { type: String, enum: ['qr', 'manual', 'gps', 'nfc'], default: 'manual' },
  status: { type: String, enum: ['present', 'absent', 'late', 'excused'], default: 'absent' },
  checkInLatitude: { type: Number, default: 0 },
  checkInLongitude: { type: Number, default: 0 },
  checkOutLatitude: { type: Number, default: 0 },
  checkOutLongitude: { type: Number, default: 0 },
  notes: { type: String, default: '' },
});

attendanceSchema.index({ studentId: 1, tripDate: 1 });
attendanceSchema.index({ tripId: 1 });
attendanceSchema.index({ tripDate: 1 });
attendanceSchema.index({ status: 1 });

export const Attendance = model<IAttendance>('Attendance', attendanceSchema);
