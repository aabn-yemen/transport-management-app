import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface IUser extends Document {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  roleId: Schema.Types.ObjectId;
  role: string;
  permissions: string[];
  avatar: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: Date | null;
  deviceToken: string;
  language: 'ar' | 'en';
  theme: 'light' | 'dark';
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: Schema.Types.ObjectId | null;
  updatedBy: Schema.Types.ObjectId | null;
  deletedBy: Schema.Types.ObjectId | null;
}

const userSchema = createBaseSchema();

userSchema.add({
  fullName: { type: String, required: [true, 'Full name is required'], trim: true, minlength: 3, maxlength: 100 },
  username: { type: String, required: [true, 'Username is required'], unique: true, trim: true, lowercase: true, minlength: 3, maxlength: 50 },
  email: { type: String, required: [true, 'Email is required'], unique: true, trim: true, lowercase: true },
  phone: { type: String, required: [true, 'Phone is required'], trim: true },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: [true, 'Role is required'] },
  role: { type: String, required: true, default: 'admin' },
  permissions: [{ type: String }],
  avatar: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  lastLogin: { type: Date, default: null },
  deviceToken: { type: String, default: '' },
  language: { type: String, enum: ['ar', 'en'], default: 'ar' },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
});

userSchema.index({ status: 1 });
userSchema.index({ roleId: 1 });

userSchema.virtual('roleInfo', {
  ref: 'Role',
  localField: 'roleId',
  foreignField: '_id',
  justOne: true,
});

export const User = model<IUser>('User', userSchema);
