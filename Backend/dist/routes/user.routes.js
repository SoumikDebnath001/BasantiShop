import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { userController } from '../controllers/user.controller.js';
export const userRouter = Router();
userRouter.patch('/profile', auth, userController.updateProfile);
userRouter.get('/contacts', auth, userController.listContacts);
//# sourceMappingURL=user.routes.js.map