import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface ISetting extends Document {
  systemName: string;
  systemNameAr: string;
  logo: string;
  supportEmail: string;
  supportPhone: string;
  defaultLanguage: 'ar' | 'en';
  defaultTheme: 'light' | 'dark';
  maintenanceMode: boolean;
  academicYear: string;
  semester: string;
  universityName: string;
  universityNameAr: string;
  address: string;
  notificationSettings: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
  };
  attendanceSettings: {
    lateThresholdMinutes: number;
    qrRequired: boolean;
    gpsRadius: number;
  };
  subscriptionSettings: {
    allowEarlyRenewal: boolean;
    earlyRenewalDays: number;
    reminderDays: number;
    autoExpire: boolean;
  };
}

const settingSchema = createBaseSchema();

settingSchema.add({
  systemName: { type: String, required: true, default: 'Smart University Transportation Management System' },
  systemNameAr: { type: String, required: true, default: 'نظام إدارة النقل الجامعي الذكي' },
  logo: { type: String, default: '' },
  supportEmail: { type: String, default: '' },
  supportPhone: { type: String, default: '' },
  defaultLanguage: { type: String, enum: ['ar', 'en'], default: 'ar' },
  defaultTheme: { type: String, enum: ['light', 'dark'], default: 'light' },
  maintenanceMode: { type: Boolean, default: false },
  academicYear: { type: String, default: '' },
  semester: { type: String, default: '' },
  universityName: { type: String, default: '' },
  universityNameAr: { type: String, default: '' },
  address: { type: String, default: '' },
  notificationSettings: {
    pushEnabled: { type: Boolean, default: true },
    emailEnabled: { type: Boolean, default: false },
    smsEnabled: { type: Boolean, default: false },
  },
  attendanceSettings: {
    lateThresholdMinutes: { type: Number, default: 15 },
    qrRequired: { type: Boolean, default: true },
    gpsRadius: { type: Number, default: 100 },
  },
  subscriptionSettings: {
    allowEarlyRenewal: { type: Boolean, default: false },
    earlyRenewalDays: { type: Number, default: 30 },
    reminderDays: { type: Number, default: 7 },
    autoExpire: { type: Boolean, default: true },
  },
});

export const Setting = model<ISetting>('Setting', settingSchema);
