import { z } from 'zod';
export declare const productCreateSchema: z.ZodObject<{
    name: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    description: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    originalPrice: z.ZodNumber;
    sellingPrice: z.ZodNumber;
    category: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    stock: z.ZodNumber;
    images: z.ZodArray<z.ZodString>;
    shortDescription: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
}, z.core.$strip>;
export declare const productUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
    description: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
    originalPrice: z.ZodOptional<z.ZodNumber>;
    sellingPrice: z.ZodOptional<z.ZodNumber>;
    category: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
    stock: z.ZodOptional<z.ZodNumber>;
    images: z.ZodOptional<z.ZodArray<z.ZodString>>;
    shortDescription: z.ZodOptional<z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>>;
}, z.core.$strip>;
export declare const productListQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    minPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    maxPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const productRatingSchema: z.ZodObject<{
    rating: z.ZodNumber;
}, z.core.$strip>;
//# sourceMappingURL=product.schemas.d.ts.map