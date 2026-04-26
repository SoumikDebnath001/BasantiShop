import { categoryCreateSchema } from '../validators/category.schemas.js';
import { categoryService } from '../services/category.service.js';
export const categoryController = {
    async list(_req, res) {
        const rows = await categoryService.list();
        res.set('Cache-Control', 'public, max-age=30');
        res.json(rows);
    },
    async create(req, res) {
        const body = categoryCreateSchema.parse(req.body);
        const row = await categoryService.create(body.name);
        res.status(201).json(row);
    },
};
//# sourceMappingURL=category.controller.js.map