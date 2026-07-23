import { Upload, IUpload } from '../model/upload.model';
import path from 'path';
import fs from 'fs';

export class UploadService {
  async upload(file: Express.Multer.File, userId?: string, relatedTo?: string, relatedId?: string) {
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    const uploadDir = path.join('uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    const upload = await Upload.create({
      fileName,
      originalName: file.originalname,
      fileUrl: `/uploads/${fileName}`,
      mimeType: file.mimetype,
      fileSize: file.size,
      uploadedBy: userId || null,
      relatedTo: relatedTo || '',
      relatedId: relatedId || null,
    });

    return upload;
  }

  async getAll(queryOptions: any = {}) {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = queryOptions;
    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    const [data, totalItems] = await Promise.all([
      Upload.find().sort({ [sort]: sortOrder }).skip(skip).limit(limit),
      Upload.countDocuments(),
    ]);

    return {
      data,
      pagination: { page, limit, totalPages: Math.ceil(totalItems / limit), totalItems },
    };
  }

  async getById(id: string) {
    return Upload.findById(id);
  }

  async delete(id: string) {
    const upload = await Upload.findById(id);
    if (upload) {
      const filePath = path.join('uploads', upload.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await Upload.findByIdAndDelete(id);
    }
    return upload;
  }
}

export const uploadService = new UploadService();
