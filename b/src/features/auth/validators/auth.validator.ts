import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'رمز التحديث مطلوب'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: z.string().min(6, 'يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل'),
});

export const registerSchema = z.object({
  fullName: z.string().min(3, 'الاسم الكامل مطلوب').max(100),
  username: z.string().min(3, 'اسم المستخدم مطلوب').max(50).optional(),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().min(1, 'رقم الهاتف مطلوب'),
  password: z.string().min(6, 'يجب أن تكون كلمة المرور 6 أحرف على الأقل'),
  role: z.enum(['student', 'parent', 'driver']).optional().default('student'),
  studentNumber: z.string().optional(),
  universityId: z.string().optional(),
  college: z.string().optional(),
  department: z.string().optional(),
  academicLevel: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  address: z.string().optional(),
  guardianPhone: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'الرمز مطلوب'),
  password: z.string().min(6, 'يجب أن تكون كلمة المرور 6 أحرف على الأقل'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(3).max(100).optional(),
  phone: z.string().optional(),
  language: z.enum(['ar', 'en']).optional(),
  theme: z.enum(['light', 'dark']).optional(),
});
