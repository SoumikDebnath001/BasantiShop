import { prisma } from '../config/prisma.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { signAccessToken } from '../utils/jwt.js'
import { emailService } from './email.service.js'
import { otpService } from './otp.service.js'
import type { UserRole } from '@prisma/client'

function roleToFrontend(role: UserRole): 'admin' | 'customer' {
  return role === 'ADMIN' ? 'admin' : 'customer'
}

function userDto(user: {
  id: string
  name: string
  email: string
  role: UserRole
  phone: string | null
  createdAt: Date
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleToFrontend(user.role),
    phone: user.phone ?? undefined,
    createdAt: user.createdAt.toISOString(),
  }
}

function makeError(message: string, status: number): Error {
  const e = new Error(message)
  ;(e as any).status = status
  return e
}

export const authService = {
  // ── Registration (two-step) ───────────────────────────────────
  async registerInitiate(payload: {
    name: string
    email: string
    password: string
    phone?: string
  }) {
    const existingUser = await prisma.user.findUnique({ where: { email: payload.email } })
    if (existingUser) throw makeError('Email already in use', 409)

    const passwordHash = await hashPassword(payload.password)
    const otp = otpService.generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.pendingRegistration.upsert({
      where: { email: payload.email },
      create: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone ?? null,
        passwordHash,
        otp,
        expiresAt,
      },
      update: { name: payload.name, phone: payload.phone ?? null, passwordHash, otp, expiresAt },
    })

    await emailService.sendRegistrationOtp(payload.email, payload.name, otp)
    return { message: 'OTP sent to your email. Please verify to complete registration.' }
  },

  async registerVerify(payload: { email: string; otp: string }) {
    const pending = await prisma.pendingRegistration.findUnique({
      where: { email: payload.email },
    })
    if (!pending) throw makeError('No pending registration found. Please start over.', 400)
    if (pending.expiresAt < new Date()) {
      await prisma.pendingRegistration.delete({ where: { email: payload.email } })
      throw makeError('OTP has expired. Please register again.', 400)
    }
    if (pending.otp !== payload.otp) throw makeError('Invalid OTP', 400)

    const existingUser = await prisma.user.findUnique({ where: { email: payload.email } })
    if (existingUser) {
      await prisma.pendingRegistration.delete({ where: { email: payload.email } })
      throw makeError('Email already in use', 409)
    }

    const user = await prisma.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        phone: pending.phone,
        passwordHash: pending.passwordHash,
        role: 'CUSTOMER',
        isEmailVerified: true,
      },
    })

    await prisma.pendingRegistration.delete({ where: { email: payload.email } })

    const token = signAccessToken({ id: user.id, role: roleToFrontend(user.role) })
    return { token, user: userDto(user) }
  },

  // ── Password Login ────────────────────────────────────────────
  async login(payload: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: payload.email } })
    if (!user) throw makeError('Invalid email or password', 401)

    const ok = await verifyPassword(payload.password, user.passwordHash)
    if (!ok) throw makeError('Invalid email or password', 401)

    const token = signAccessToken({ id: user.id, role: roleToFrontend(user.role) })
    return { token, user: userDto(user) }
  },

  // ── OTP Login ─────────────────────────────────────────────────
  async loginSendOtp(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw makeError('No account found with that email address.', 404)

    const code = await otpService.storeOtp(email, 'LOGIN', 10 * 60 * 1000)
    await emailService.sendLoginOtp(email, code)
    return { message: 'OTP sent to your email.' }
  },

  async loginVerifyOtp(payload: { email: string; otp: string }) {
    const valid = await otpService.verifyOtp(payload.email, payload.otp, 'LOGIN')
    if (!valid) throw makeError('Invalid or expired OTP', 401)

    const user = await prisma.user.findUnique({ where: { email: payload.email } })
    if (!user) throw makeError('User not found', 404)

    const token = signAccessToken({ id: user.id, role: roleToFrontend(user.role) })
    return { token, user: userDto(user) }
  },

  // ── Forgot Password ───────────────────────────────────────────
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw makeError('No account found with that email address.', 404)

    const code = await otpService.storeOtp(email, 'RESET_PASSWORD', 15 * 60 * 1000)
    await emailService.sendPasswordResetOtp(email, code)
    return { message: 'OTP sent to your email. Enter it below to reset your password.' }
  },

  async resetPassword(payload: { email: string; otp: string; newPassword: string }) {
    const valid = await otpService.verifyOtp(payload.email, payload.otp, 'RESET_PASSWORD')
    if (!valid) throw makeError('Invalid or expired OTP', 400)

    const user = await prisma.user.findUnique({ where: { email: payload.email } })
    if (!user) throw makeError('User not found', 404)

    const passwordHash = await hashPassword(payload.newPassword)
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })

    return { message: 'Password reset successfully. Please log in with your new password.' }
  },

  // ── Profile ───────────────────────────────────────────────────
  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw makeError('Unauthorized', 401)
    return userDto(user)
  },
}
