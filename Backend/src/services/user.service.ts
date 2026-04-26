import { prisma } from '../config/prisma.js'
import type { UserRole } from '@prisma/client'
import { contactService } from './contact.service.js'

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
    const data = await contactService.listHistoryForUser(userId)
    return { data }
  },
}
