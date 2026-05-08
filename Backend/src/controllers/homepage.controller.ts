import type { Request, Response } from 'express'
import { z } from 'zod'
import { homepageService } from '../services/homepage.service.js'

const updateSchema = z.object({
  heroHeadline: z.string().min(1).max(200).optional(),
  heroSubtext: z.string().max(500).optional(),
  heroCta: z.string().min(1).max(80).optional(),
  announcementBanner: z.string().max(300).nullable().optional(),
  announcementEnabled: z.boolean().optional(),
  aboutTitle: z.string().min(1).max(120).optional(),
  aboutText: z.string().max(1000).optional(),
})

export const homepageController = {
  async get(_req: Request, res: Response) {
    const content = await homepageService.get()
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
    res.json(content)
  },

  async update(req: Request, res: Response) {
    const raw = updateSchema.parse(req.body)
    // Strip undefined keys so exactOptionalPropertyTypes is satisfied
    const data = Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== undefined)
    ) as Parameters<typeof homepageService.update>[0]
    const content = await homepageService.update(data)
    res.json(content)
  },
}
