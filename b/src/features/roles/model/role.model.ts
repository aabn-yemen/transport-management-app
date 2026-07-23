import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface IRole extends Document {
  name: string;
  nameAr: string;
  slug: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  status: 'active' | 'inactive';
}

const roleSchema = createBaseSchema();

roleSchema.add({
  name: { type: String, required: [true, 'Role name is required'], trim: true, unique: true },
  nameAr: { type: String, required: [true, 'Role Arabic name is required'], trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  permissions: [{ type: String }],
  isSystem: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});

roleSchema.index({ status: 1 });

export const Role = model<IRole>('Role', roleSchema);
