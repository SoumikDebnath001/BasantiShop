import type { Request, Response } from 'express'
import { categoryCreateSchema } from '../validators/category.schemas.js'
import { categoryService } from '../services/category.service.js'

export const categoryController = {
  async list(_req: Request, res: Response) {
    const rows = await categoryService.list()
    res.set('Cache-Control', 'public, max-age=30')
    res.json(rows)
  },

  async create(req: Request, res: Response) {
    const body = categoryCreateSchema.parse(req.body)
    const row = await categoryService.create(body.name)
    res.status(201).json(row)
  },
}
