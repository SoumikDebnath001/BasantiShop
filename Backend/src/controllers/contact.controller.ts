import type { Request, Response } from 'express'
import { contactSchema } from '../validators/contact.schemas.js'
import { contactService } from '../services/contact.service.js'

export const contactController = {
  async create(req: Request, res: Response) {
    const payload = contactSchema.parse(req.body)
    await contactService.create({
      ...payload,
      productId: payload.productId,
      productName: payload.productName,
      userId: req.user?.id,
    })
    res.status(204).end()
  },
}

