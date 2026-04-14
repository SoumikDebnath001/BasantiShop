import { Router } from 'express'
import multer from 'multer'
import { uploadController } from '../controllers/upload.controller.js'
import { auth } from '../middlewares/auth.js'
import { requireAdmin } from '../middlewares/requireAdmin.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
})

export const uploadRouter = Router()

uploadRouter.post('/images', auth, requireAdmin, upload.array('images', 10), uploadController.uploadImages)

