import { z } from 'zod';
const stripHtml = (s) => s.replace(/<[^>]*>/g, '').trim();
const secureImageUrl = z
    .string()
    .url()
    .max(2000)
    .refine((u) => /^https:\/\//i.test(u), 'Image URL must use HTTPS');
export const productCreateSchema = z.object({
    name: z.string().min(1).max(200).transform(stripHtml),
    description: z.string().min(1).max(20000).transform(stripHtml),
    originalPrice: z.number().positive(),
    sellingPrice: z.number().positive(),
    category: z.string().min(1).max(80).transform(stripHtml),
    stock: z.number().int().min(0),
    images: z.array(secureImageUrl).min(1).max(20),
    shortDescription: z.string().max(500).optional().transform((v) => (v ? stripHtml(v) : undefined)),
});
export const productUpdateSchema = productCreateSchema.partial();
export const productListQuerySchema = z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    sortBy: z.string().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
});
export const productRatingSchema = z.object({
    rating: z.number().int().min(1).max(5),
});
//# sourceMappingURL=product.schemas.js.map