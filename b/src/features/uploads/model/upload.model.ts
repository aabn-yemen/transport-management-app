import { Schema, model, Document } from 'mongoose';
import { createBaseSchema } from '../../../shared/models/base.model';

export interface IUpload extends Document {
  fileName: string;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: Schema.Types.ObjectId | null;
  relatedTo: string;
  relatedId: Schema.Types.ObjectId | null;
}

const uploadSchema = createBaseSchema();

uploadSchema.add({
  fileName: { type: String, required: true, trim: true },
  originalName: { type: String, required: true, trim: true },
  fileUrl: { type: String, required: true },
  mimeType: { type: String, required: true },
  fileSize: { type: Number, required: true, min: 0 },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  relatedTo: { type: String, default: '' },
  relatedId: { type: Schema.Types.ObjectId, default: null },
});

uploadSchema.index({ uploadedBy: 1 });
uploadSchema.index({ relatedTo: 1, relatedId: 1 });

export const Upload = model<IUpload>('Upload', uploadSchema);
