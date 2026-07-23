import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().min(3, 'يجب أن يكون الاسم 3 أحرف على الأقل').max(100, 'يجب أن لا يتجاوز الاسم 100 حرف'),
  username: z.string().min(3, 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل').max(50, 'يجب أن لا يتجاوز اسم المستخدم 50 حرف'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().min(1, 'رقم الهاتف مطلوب'),
  password: z.string().min(6, 'يجب أن تكون كلمة المرور 6 أحرف على الأقل'),
  roleId: z.string().min(1, 'الدور مطلوب'),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(3, 'يجب أن يكون الاسم 3 أحرف على الأقل').max(100, 'يجب أن لا يتجاوز الاسم 100 حرف').optional(),
  email: z.string().email('البريد الإلكتروني غير صالح').optional(),
  phone: z.string().optional(),
  roleId: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  language: z.enum(['ar', 'en']).optional(),
  theme: z.enum(['light', 'dark']).optional(),
});
