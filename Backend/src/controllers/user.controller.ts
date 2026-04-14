import type { Request, Response } from 'express'
import { profileUpdateSchema } from '../validators/user.schemas.js'
import { userService } from '../services/user.service.js'

export const userController = {
  async updateProfile(req: Request, res: Response) {
    const payload = profileUpdateSchema.parse(req.body)
    const userId = req.user!.id
    const user = await userService.updateProfile(userId, {
      name: payload.name,
      phone: payload.phone,
    })
    res.json(user)
  },

  async listContacts(req: Request, res: Response) {
    const userId = req.user!.id
    const result = await userService.listContacts(userId)
    res.json(result)
  },
}
