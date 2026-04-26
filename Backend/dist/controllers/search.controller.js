import { searchQuerySchema } from '../validators/search.schemas.js';
import { searchService } from '../services/search.service.js';
export const searchController = {
    async search(req, res) {
        const query = searchQuerySchema.parse(req.query);
        const result = await searchService.search(query.q);
        res.set('Cache-Control', 'private, no-store');
        res.json(result);
    },
};
//# sourceMappingURL=search.controller.js.map