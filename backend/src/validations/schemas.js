import { z } from 'zod'

const email = z.string().email('Email noto\'g\'ri formatda')
const password = z.string().min(6, 'Parol kamida 6 belgi')

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Ism kamida 2 belgi'),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Telefon noto\'g\'ri formatda'),
  email,
  password,
})

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Parol kerak'),
})

export const createSosSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  address: z.string().max(500).optional(),
  description: z.string().min(3, 'Tavsif kamida 3 belgi').max(2000),
  category: z.enum(['MEDICAL', 'FIRE', 'ACCIDENT', 'CRIME', 'OTHER']).default('OTHER'),
})

export const updateSosStatusSchema = z.object({
  status: z.enum(['NEW', 'PROCESSING', 'RESOLVED', 'CANCELLED']),
})

export const assignSchema = z.object({
  action: z.string().min(3, 'Harakat nomi kamida 3 belgi'),
  note: z.string().max(1000).optional(),
})

export const createMessageSchema = z.object({
  name: z.string().min(2),
  email,
  phone: z.string().optional(),
  subject: z.string().min(2),
  text: z.string().min(3).max(5000),
})

export const updateMessageSchema = z.object({
  isRead: z.boolean(),
})

export const idParamSchema = z.object({
  id: z.string().uuid('ID noto\'g\'ri formatda'),
})

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['NEW', 'ANALYZING', 'PROCESSING', 'RESOLVED', 'AUTO_DISPATCHED', 'CANCELLED']).optional(),
  category: z.enum(['MEDICAL', 'FIRE', 'ACCIDENT', 'CRIME', 'OTHER']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  search: z.string().optional(),
  isRead: z.enum(['true', 'false']).optional(),
  sosRequestId: z.string().uuid().optional(),
})
