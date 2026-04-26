import { z } from 'zod'

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, '').trim()

export const contactSchema = z.object({
  name: z.string().min(1).max(200).transform(stripHtml),
  phone: z.string().min(1).max(40).transform(stripHtml),
  email: z.string().email().max(320),
  message: z
    .string()
    .min(10)
    .max(5000)
    .transform((s) => stripHtml(s)),
  productName: z.string().max(200).optional().transform((v) => (v ? stripHtml(v) : undefined)),
  productId: z.string().max(64).optional(),
})

const stripHtmlMsg = (s: string) => s.replace(/<[^>]*>/g, '').trim()

export const contactResponseSchema = z.object({
  response: z.string().min(1).max(5000).transform((s) => stripHtmlMsg(s)),
})

