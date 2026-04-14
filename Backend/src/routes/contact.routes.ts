import { Router } from 'express'
import { contactController } from '../controllers/contact.controller.js'
import { optionalAuth } from '../middlewares/optionalAuth.js'

export const contactRouter = Router()

contactRouter.post('/', optionalAuth, contactController.create)

