import { z } from 'zod';
export declare const contactSchema: z.ZodObject<{
    name: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    phone: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    email: z.ZodString;
    message: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    productName: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    productId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const contactResponseSchema: z.ZodObject<{
    response: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
}, z.core.$strip>;
//# sourceMappingURL=contact.schemas.d.ts.map