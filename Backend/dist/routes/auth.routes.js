import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { auth } from '../middlewares/auth.js';
export const authRouter = Router();
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.get('/me', auth, authController.me);
//# sourceMappingURL=auth.routes.js.map