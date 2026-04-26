import { Router } from 'express'
import { contactController } from '../controllers/contact.controller.js'
import { optionalAuth } from '../middlewares/optionalAuth.js'
import { auth } from '../middlewares/auth.js'
import { requireAdmin } from '../middlewares/requireAdmin.js'

export const contactRouter = Router()

contactRouter.post('/', optionalAuth, contactController.create)

contactRouter.get('/admin/messages', auth, requireAdmin, contactController.listAllAdmin)

contactRouter.get('/history/:userId', auth, contactController.historyByUser)

contactRouter.patch('/messages/:id/response', auth, requireAdmin, contactController.setResponse)
