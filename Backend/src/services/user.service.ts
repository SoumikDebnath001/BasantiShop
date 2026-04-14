import { prisma } from '../config/prisma.js'
import type { UserRole } from '@prisma/client'

function roleToFrontend(role: UserRole): 'admin' | 'customer' {
  return role === 'ADMIN' ? 'admin' : 'customer'
}

function userDto(user: { id: string; name: string; email: string; role: UserRole; phone: string | null; createdAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleToFrontend(user.role),
    phone: user.phone ?? undefined,
    createdAt: user.createdAt.toISOString(),
  }
}

export const userService = {
  async updateProfile(userId: string, payload: { name: string; phone: string | undefined }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: payload.name,
        phone: payload.phone ?? null,
      },
    })
    return userDto(user)
  },

  async listContacts(userId: string) {
    const rows = await prisma.contactMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        productName: true,
        productId: true,
        createdAt: true,
        message: true,
      },
    })
    return {
      data: rows.map((r) => ({
        id: r.id,
        productName: r.productName ?? 'General enquiry',
        productId: r.productId,
        createdAt: r.createdAt.toISOString(),
        preview: r.message.length > 120 ? `${r.message.slice(0, 120)}…` : r.message,
      })),
    }
  },
}
