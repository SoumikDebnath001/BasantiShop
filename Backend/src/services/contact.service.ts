import { prisma } from '../config/prisma.js'

export const contactService = {
  async create(payload: {
    name: string
    phone: string
    email: string
    message: string
    productId: string | undefined
    productName: string | undefined
    userId: string | undefined
  }) {
    let productId: string | null = payload.productId ?? null
    if (productId) {
      const exists = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } })
      if (!exists) productId = null
    }

    await prisma.contactMessage.create({
      data: {
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        message: payload.message,
        productId,
        productName: payload.productName ?? null,
        userId: payload.userId ?? null,
      },
    })
  },

  async listHistoryForUser(userId: string) {
    const rows = await prisma.contactMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return rows.map((r) => ({
      id: r.id,
      productName: r.productName ?? 'General enquiry',
      productId: r.productId,
      message: r.message,
      response: r.response,
      createdAt: r.createdAt.toISOString(),
      preview: r.message.length > 120 ? `${r.message.slice(0, 120)}…` : r.message,
    }))
  },

  async setAdminResponse(messageId: string, response: string) {
    const row = await prisma.contactMessage.update({
      where: { id: messageId },
      data: { response },
      select: { id: true, response: true },
    })
    return row
  },

  /** All contact form submissions (newest first). Admin only. */
  async listAllForAdmin() {
    const rows = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      email: r.email,
      message: r.message,
      response: r.response,
      productName: r.productName,
      productId: r.productId,
      userId: r.userId,
      user: r.user
        ? { id: r.user.id, name: r.user.name, email: r.user.email }
        : null,
      createdAt: r.createdAt.toISOString(),
    }))
  },
}

