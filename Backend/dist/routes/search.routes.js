import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { searchController } from '../controllers/search.controller.js';
export const searchRouter = Router();
searchRouter.get('/', auth, searchController.search);
//# sourceMappingURL=search.routes.js.map