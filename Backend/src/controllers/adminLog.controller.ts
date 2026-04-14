import type { Request, Response } from 'express'
import { z } from 'zod'
import { adminLogService } from '../services/adminLog.service.js'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).optional(),
})

export const adminLogController = {
  async list(req: Request, res: Response) {
    const q = querySchema.parse(req.query)
    const rows = await adminLogService.list(q.limit)
    res.set('Cache-Control', 'private, no-store')
    res.json(rows)
  },
}
