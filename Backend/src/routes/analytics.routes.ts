import { Router } from 'express'
import { auth } from '../middlewares/auth.js'
import { requireAdmin } from '../middlewares/requireAdmin.js'
import { analyticsController } from '../controllers/analytics.controller.js'

export const analyticsRouter = Router()

analyticsRouter.get('/profit-loss', auth, requireAdmin, analyticsController.profitLoss)
