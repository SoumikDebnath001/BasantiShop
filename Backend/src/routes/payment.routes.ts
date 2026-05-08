import { Router } from 'express'
import { paymentController } from '../controllers/payment.controller.js'
import { auth } from '../middlewares/auth.js'

export const paymentRouter = Router()

// Public: returns key_id only (safe to expose)
paymentRouter.get('/config', paymentController.getConfig)

// Authenticated: create Razorpay order + DB order
paymentRouter.post('/create-order', auth, paymentController.createOrder)

// Authenticated: verify signature → mark order paid
paymentRouter.post('/verify', auth, paymentController.verifyPayment)
