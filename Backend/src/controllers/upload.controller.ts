import type { Request, Response } from 'express'
import { uploadImageBuffer } from '../services/upload.service.js'

export const uploadController = {
  async uploadImages(req: Request, res: Response) {
    const files = (req.files as Express.Multer.File[] | undefined) ?? []
    if (!files.length) {
      const err = new Error('No files uploaded')
      ;(err as any).status = 400
      throw err
    }

    const urls = await Promise.all(
      files.map((f) =>
        uploadImageBuffer({ buffer: f.buffer, mimeType: f.mimetype, folder: 'ecommerce/products' })
      )
    )
    res.json({ urls })
  },
}

