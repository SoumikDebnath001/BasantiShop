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
}

