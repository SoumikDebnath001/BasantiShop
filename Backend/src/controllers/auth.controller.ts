import type { Request, Response } from 'express'
import {
  registerInitiateSchema,
  registerVerifySchema,
  loginSchema,
  loginSendOtpSchema,
  loginVerifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.schemas.js'
import { authService } from '../services/auth.service.js'
import { adminLogService, ADMIN_ACTIONS } from '../services/adminLog.service.js'

export const authController = {
  async registerInitiate(req: Request, res: Response) {
    const payload = registerInitiateSchema.parse(req.body)
    const result = await authService.registerInitiate({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      ...(payload.phone ? { phone: payload.phone } : {}),
    })
    res.json(result)
  },

  async registerVerify(req: Request, res: Response) {
    const payload = registerVerifySchema.parse(req.body)
    const result = await authService.registerVerify(payload)
    res.json(result)
  },

  async login(req: Request, res: Response) {
    const payload = loginSchema.parse(req.body)
    const result = await authService.login(payload)
    if (result.user.role === 'admin') {
      await adminLogService.log(result.user.id, ADMIN_ACTIONS.ADMIN_LOGIN, {
        email: result.user.email,
      })
    }
    res.json(result)
  },

  async loginSendOtp(req: Request, res: Response) {
    const { email } = loginSendOtpSchema.parse(req.body)
    const result = await authService.loginSendOtp(email)
    res.json(result)
  },

  async loginVerifyOtp(req: Request, res: Response) {
    const payload = loginVerifyOtpSchema.parse(req.body)
    const result = await authService.loginVerifyOtp(payload)
    res.json(result)
  },

  async forgotPassword(req: Request, res: Response) {
    const { email } = forgotPasswordSchema.parse(req.body)
    const result = await authService.forgotPassword(email)
    res.json(result)
  },

  async resetPassword(req: Request, res: Response) {
    const payload = resetPasswordSchema.parse(req.body)
    const result = await authService.resetPassword(payload)
    res.json(result)
  },

  async me(req: Request, res: Response) {
    const userId = req.user!.id
    const user = await authService.me(userId)
    res.json(user)
  },
}
