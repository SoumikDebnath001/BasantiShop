import { z } from 'zod';
export const searchQuerySchema = z.object({
    q: z.string().max(200).optional().default(''),
});
//# sourceMappingURL=search.schemas.js.map