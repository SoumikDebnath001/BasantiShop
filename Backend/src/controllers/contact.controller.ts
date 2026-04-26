import type { Request, Response } from 'express'
import { contactSchema, contactResponseSchema } from '../validators/contact.schemas.js'
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

  async historyByUser(req: Request, res: Response) {
    const uid = String(req.params.userId)
    if (req.user!.id !== uid && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    const data = await contactService.listHistoryForUser(uid)
    res.json(data)
  },

  async listAllAdmin(_req: Request, res: Response) {
    const data = await contactService.listAllForAdmin()
    res.set('Cache-Control', 'private, no-store')
    res.json(data)
  },

  async setResponse(req: Request, res: Response) {
    const id = String(req.params.id)
    const body = contactResponseSchema.parse(req.body)
    try {
      const row = await contactService.setAdminResponse(id, body.response)
      res.json(row)
    } catch {
      res.status(404).json({ error: 'Message not found' })
    }
  },
}
