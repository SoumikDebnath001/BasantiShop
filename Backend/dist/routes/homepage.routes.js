import { Router } from 'express';
import { homepageController } from '../controllers/homepage.controller.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';
import { auth } from '../middlewares/auth.js';
export const homepageRouter = Router();
homepageRouter.get('/', homepageController.get);
homepageRouter.put('/', auth, requireAdmin, homepageController.update);
//# sourceMappingURL=homepage.routes.js.map