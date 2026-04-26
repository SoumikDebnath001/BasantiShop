import { productCreateSchema, productListQuerySchema, productRatingSchema, productUpdateSchema, } from '../validators/product.schemas.js';
import { productService } from '../services/product.service.js';
import { adminLogService, ADMIN_ACTIONS } from '../services/adminLog.service.js';
export const productController = {
    async list(req, res) {
        const query = productListQuerySchema.parse(req.query);
        const result = await productService.list({
            search: query.search,
            category: query.category,
            minPrice: query.minPrice,
            maxPrice: query.maxPrice,
            sortBy: query.sortBy,
            page: query.page,
            limit: query.limit,
            ...(req.user ? { userId: req.user.id } : {}),
        });
        if (req.user) {
            // Authenticated responses include user-specific fields (e.g. myRating), so avoid shared caching.
            res.set('Cache-Control', 'private, no-store');
        }
        else {
            res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
        }
        res.json(result);
    },
    async get(req, res) {
        const userId = req.user?.id;
        const product = await productService.getByIdOrSlug(String(req.params.id), userId);
        if (req.user) {
            // Prevent stale user-specific rating data from shared/public caches.
            res.set('Cache-Control', 'private, no-store');
        }
        else {
            res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
        }
        res.json(product);
    },
    async listAdmin(req, res) {
        const query = productListQuerySchema.parse(req.query);
        const result = await productService.listForAdmin({
            search: query.search,
            category: query.category,
            minPrice: query.minPrice,
            maxPrice: query.maxPrice,
            sortBy: query.sortBy,
            page: query.page,
            limit: query.limit,
        });
        res.set('Cache-Control', 'private, no-store');
        res.json(result);
    },
    async getAdmin(req, res) {
        const product = await productService.getAdmin(String(req.params.id));
        res.json(product);
    },
    async create(req, res) {
        const payload = productCreateSchema.parse(req.body);
        const product = await productService.create({ ...payload, shortDescription: payload.shortDescription });
        await adminLogService.log(req.user.id, ADMIN_ACTIONS.CREATE_PRODUCT, {
            productId: product.id,
            name: product.name,
        });
        res.json(product);
    },
    async update(req, res) {
        const payload = productUpdateSchema.parse(req.body);
        const cleaned = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined));
        const id = String(req.params.id);
        const product = await productService.update(id, cleaned);
        await adminLogService.log(req.user.id, ADMIN_ACTIONS.UPDATE_PRODUCT, {
            productId: id,
            fields: Object.keys(cleaned),
        });
        res.json(product);
    },
    async remove(req, res) {
        const id = String(req.params.id);
        await productService.remove(id);
        await adminLogService.log(req.user.id, ADMIN_ACTIONS.DELETE_PRODUCT, { productId: id });
        res.status(204).end();
    },
    async rate(req, res) {
        const body = productRatingSchema.parse(req.body);
        const userId = req.user.id;
        const productId = String(req.params.id);
        const product = await productService.upsertRating(userId, productId, body.rating);
        res.json(product);
    },
};
//# sourceMappingURL=product.controller.js.map