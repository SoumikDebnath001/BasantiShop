import { z } from 'zod';
export declare const shopReviewCreateSchema: z.ZodObject<{
    rating: z.ZodNumber;
    message: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
}, z.core.$strip>;
//# sourceMappingURL=shopReview.schemas.d.ts.map