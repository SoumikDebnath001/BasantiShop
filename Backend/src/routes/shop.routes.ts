import { Router } from 'express'
import { auth } from '../middlewares/auth.js'
import { requireAdmin } from '../middlewares/requireAdmin.js'
import { shopReviewController } from '../controllers/shopReview.controller.js'

export const shopRouter = Router()

shopRouter.get('/summary', shopReviewController.summary)
shopRouter.get('/reviews/public', shopReviewController.listPublic)
shopRouter.post('/reviews', auth, shopReviewController.create)
shopRouter.get('/reviews', auth, requireAdmin, shopReviewController.listAdmin)
