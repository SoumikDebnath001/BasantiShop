import { z } from 'zod';
const stripHtml = (s) => s.replace(/<[^>]*>/g, '').trim();
export const shopReviewCreateSchema = z.object({
    rating: z.number().int().min(1).max(5),
    message: z.string().min(3).max(2000).transform(stripHtml),
});
//# sourceMappingURL=shopReview.schemas.js.map