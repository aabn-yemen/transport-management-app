import { z } from 'zod';

export const createStudentSchema = z.object({
  studentNumber: z.string().min(1, 'رقم الطالب مطلوب'),
  universityId: z.string().min(1, 'الرقم الجامعي مطلوب'),
  firstName: z.string().min(1, 'الاسم الأول مطلوب'),
  secondName: z.string().optional(),
  thirdName: z.string().optional(),
  lastName: z.string().min(1, 'اسم العائلة مطلوب'),
  gender: z.enum(['male', 'female']),
  college: z.string().min(1, 'الكلية مطلوبة'),
  department: z.string().min(1, 'القسم مطلوب'),
  academicLevel: z.string().min(1, 'المستوى الأكاديمي مطلوب'),
  phone: z.string().min(1, 'رقم الهاتف مطلوب'),
  guardianPhone: z.string().optional(),
  address: z.string().min(1, 'العنوان مطلوب'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  busId: z.string().optional(),
  routeId: z.string().optional(),
  destinationId: z.string().optional(),
  isLocal: z.boolean().optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'graduated']).optional(),
  notes: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.extend({
  userId: z.string().optional(),
  parentId: z.string().optional(),
}).partial();
