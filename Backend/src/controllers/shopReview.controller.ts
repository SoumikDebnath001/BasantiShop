import type { Request, Response } from 'express'
import { shopReviewCreateSchema } from '../validators/shopReview.schemas.js'
import { shopReviewService } from '../services/shopReview.service.js'

export const shopReviewController = {
  async create(req: Request, res: Response) {
    const body = shopReviewCreateSchema.parse(req.body)
    const row = await shopReviewService.create(req.user!.id, body.rating, body.message)
    res.status(201).json(row)
  },

  async listAdmin(_req: Request, res: Response) {
    const rows = await shopReviewService.listAllForAdmin()
    res.json(rows)
  },

  async listPublic(_req: Request, res: Response) {
    const rows = await shopReviewService.listPublic(30)
    res.set('Cache-Control', 'public, max-age=60')
    res.json(rows)
  },

  async summary(_req: Request, res: Response) {
    const s = await shopReviewService.publicSummary()
    res.set('Cache-Control', 'public, max-age=60')
    res.json(s)
  },
}
