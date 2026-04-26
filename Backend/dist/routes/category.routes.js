import { Router } from 'express';
import { categoryController } from '../controllers/category.controller.js';
import { auth } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';
export const categoryRouter = Router();
categoryRouter.get('/', categoryController.list);
categoryRouter.post('/', auth, requireAdmin, categoryController.create);
//# sourceMappingURL=category.routes.js.map