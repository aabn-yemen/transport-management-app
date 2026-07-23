import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface IPermission extends Document {
  name: string;
  nameAr: string;
  module: string;
  slug: string;
  description: string;
  actions: string[];
}

const permissionSchema = createBaseSchema();

permissionSchema.add({
  name: { type: String, required: [true, 'Permission name is required'], trim: true, unique: true },
  nameAr: { type: String, required: [true, 'Permission Arabic name is required'], trim: true },
  module: { type: String, required: [true, 'Module is required'], trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  actions: [{ type: String, enum: ['view', 'create', 'update', 'delete', 'restore', 'export', 'print', 'approve', 'reject', 'assign', 'manage'] }],
});

permissionSchema.index({ module: 1 });

export const Permission = model<IPermission>('Permission', permissionSchema);
