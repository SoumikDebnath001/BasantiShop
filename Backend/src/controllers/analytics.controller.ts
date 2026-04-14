import type { Request, Response } from 'express'
import { analyticsService } from '../services/analytics.service.js'

export const analyticsController = {
  async profitLoss(_req: Request, res: Response) {
    const data = await analyticsService.profitLoss()
    res.set('Cache-Control', 'private, max-age=10')
    res.json(data)
  },
}
