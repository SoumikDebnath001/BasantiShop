import { Router } from 'express'
import { auth } from '../middlewares/auth.js'
import { requireAdmin } from '../middlewares/requireAdmin.js'
import { orderController } from '../controllers/order.controller.js'

export const orderRouter = Router()

orderRouter.post('/', auth, orderController.create)
orderRouter.get('/my', auth, orderController.my)
orderRouter.get('/', auth, requireAdmin, orderController.listAll)
orderRouter.delete('/:id', auth, requireAdmin, orderController.remove)
orderRouter.patch('/:id', auth, requireAdmin, orderController.updateStatus)
