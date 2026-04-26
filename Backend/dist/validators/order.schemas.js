import { z } from 'zod';
const stripHtml = (s) => s.replace(/<[^>]*>/g, '').trim();
export const createOrderSchema = z.object({
    phoneNumber: z.string().min(5).max(40).transform(stripHtml),
    items: z
        .array(z.object({
        productId: z.string().min(1).max(64),
        quantity: z.number().int().min(1).max(999),
    }))
        .min(1)
        .max(50),
});
export const patchOrderSchema = z.discriminatedUnion('status', [
    z.object({
        status: z.literal('CONFIRMED'),
        finalTotalAmount: z.number().positive(),
    }),
    z.object({ status: z.literal('PENDING') }),
    z.object({ status: z.literal('DELIVERED') }),
    z.object({ status: z.literal('RETURNED') }),
    z.object({ status: z.literal('CANCELLED') }),
]);
//# sourceMappingURL=order.schemas.js.map