import { prisma } from '../config/prisma.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { signAccessToken } from '../utils/jwt.js'
import type { UserRole } from '@prisma/client'

function roleToFrontend(role: UserRole): 'admin' | 'customer' {
  return role === 'ADMIN' ? 'admin' : 'customer'
}

function userDto(user: { id: string; name: string; email: string; role: UserRole; phone: string | null; createdAt: Date }): any {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleToFrontend(user.role),
    phone: user.phone ?? undefined,
    createdAt: user.createdAt.toISOString(),
  }
}

export const authService = {
  async register(payload: { name: string; email: string; password: string; phone: string | undefined }) {
    const existing = await prisma.user.findUnique({ where: { email: payload.email } })
    if (existing) {
      const err = new Error('Email already in use')
      ;(err as any).status = 409
      throw err
    }

    const passwordHash = await hashPassword(payload.password)
    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone ?? null,
        passwordHash,
        role: 'CUSTOMER',
      },
    })

    const token = signAccessToken({ id: user.id, role: roleToFrontend(user.role) })
    return { token, user: userDto(user) }
  },

  async login(payload: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: payload.email } })
    if (!user) {
      const err = new Error('Invalid credentials')
      ;(err as any).status = 401
      throw err
    }

    const ok = await verifyPassword(payload.password, user.passwordHash)
    if (!ok) {
      const err = new Error('Invalid credentials')
      ;(err as any).status = 401
      throw err
    }

    const token = signAccessToken({ id: user.id, role: roleToFrontend(user.role) })
    return { token, user: userDto(user) }
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      const err = new Error('Unauthorized')
      ;(err as any).status = 401
      throw err
    }
    return userDto(user)
  },
}

