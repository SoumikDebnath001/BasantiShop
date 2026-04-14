import { Router } from 'express'
import { productController } from '../controllers/product.controller.js'
import { auth } from '../middlewares/auth.js'
import { requireAdmin } from '../middlewares/requireAdmin.js'
import { optionalAuth } from '../middlewares/optionalAuth.js'

export const productRouter = Router()

productRouter.get('/', optionalAuth, productController.list)
productRouter.get('/admin', auth, requireAdmin, productController.listAdmin)
productRouter.get('/admin/:id', auth, requireAdmin, productController.getAdmin)
productRouter.get('/:id', optionalAuth, productController.get)

productRouter.post('/:id/ratings', auth, productController.rate)

productRouter.post('/', auth, requireAdmin, productController.create)
productRouter.put('/:id', auth, requireAdmin, productController.update)
productRouter.delete('/:id', auth, requireAdmin, productController.remove)
