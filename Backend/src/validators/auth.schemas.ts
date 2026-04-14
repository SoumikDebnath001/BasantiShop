import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(6).max(128),
})

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(320),
  password: z.string().min(6).max(128),
  phone: z.string().max(40).optional(),
})

