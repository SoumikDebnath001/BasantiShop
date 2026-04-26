import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';
import { orderController } from '../controllers/order.controller.js';
export const orderRouter = Router();
orderRouter.post('/', auth, orderController.create);
orderRouter.get('/me/overview', auth, orderController.myOverview);
orderRouter.get('/history', auth, orderController.historyDeliveredLastYear);
orderRouter.get('/user/:userId', auth, orderController.listForUser);
orderRouter.get('/my', auth, orderController.my);
orderRouter.get('/', auth, requireAdmin, orderController.listAll);
orderRouter.get('/:id/invoice', auth, orderController.downloadInvoice);
orderRouter.patch('/:id/status', auth, requireAdmin, orderController.updateStatus);
orderRouter.delete('/:id', auth, requireAdmin, orderController.remove);
orderRouter.patch('/:id', auth, requireAdmin, orderController.updateStatus);
//# sourceMappingURL=order.routes.js.map