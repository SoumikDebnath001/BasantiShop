import { z } from 'zod';
export declare const createOrderSchema: z.ZodObject<{
    phoneNumber: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const patchOrderSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"CONFIRMED">;
    finalTotalAmount: z.ZodNumber;
}, z.core.$strip>, z.ZodObject<{
    status: z.ZodLiteral<"PENDING">;
}, z.core.$strip>, z.ZodObject<{
    status: z.ZodLiteral<"DELIVERED">;
}, z.core.$strip>, z.ZodObject<{
    status: z.ZodLiteral<"RETURNED">;
}, z.core.$strip>, z.ZodObject<{
    status: z.ZodLiteral<"CANCELLED">;
}, z.core.$strip>], "status">;
//# sourceMappingURL=order.schemas.d.ts.map