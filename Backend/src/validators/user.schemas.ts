import { z } from 'zod'

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z
    .union([z.string().max(40), z.literal('')])
    .optional()
    .transform((v) => (v === '' || v === undefined ? undefined : v)),
})
