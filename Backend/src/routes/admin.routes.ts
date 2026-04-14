import { Router } from 'express'
import { auth } from '../middlewares/auth.js'
import { requireAdmin } from '../middlewares/requireAdmin.js'
import { adminLogController } from '../controllers/adminLog.controller.js'

export const adminRouter = Router()

adminRouter.use(auth, requireAdmin)
adminRouter.get('/logs', adminLogController.list)
