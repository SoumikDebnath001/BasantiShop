import { z } from 'zod';
export declare const profileUpdateSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodPipe<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>, z.ZodTransform<string | undefined, string | undefined>>;
}, z.core.$strip>;
//# sourceMappingURL=user.schemas.d.ts.map