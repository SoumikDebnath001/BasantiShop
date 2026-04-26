import { prisma } from '../config/prisma.js'
import { Prisma } from '@prisma/client'
import type { OrderStatus } from '@prisma/client'
import { generateOrderInvoicePdf } from './invoice.service.js'

function orderDto(o: {
  id: string
  userId: string
  phoneNumber: string
  totalAmount: Prisma.Decimal
  finalTotalAmount: Prisma.Decimal | null
  status: OrderStatus
  deliveredAt: Date | null
  invoiceUrl: string | null
  createdAt: Date
  user: { id: string; name: string; email: string }
  items: {
    id: string
    productId: string | null
    name: string
    price: Prisma.Decimal
    quantity: number
    costPerUnit: Prisma.Decimal
  }[]
}) {
  const listed = Number(o.totalAmount)
  const final = o.finalTotalAmount != null ? Number(o.finalTotalAmount) : null
  return {
    id: o.id,
    userId: o.userId,
    phoneNumber: o.phoneNumber,
    totalAmount: listed,
    finalTotalAmount: final,
    displayTotal: final ?? listed,
    status: o.status,
    deliveredAt: o.deliveredAt?.toISOString() ?? null,
    invoiceUrl: o.invoiceUrl ?? null,
    createdAt: o.createdAt.toISOString(),
    user: o.user,
    items: o.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      name: i.name,
      price: Number(i.price),
      quantity: i.quantity,
      lineListedTotal: Number(i.price) * i.quantity,
      costPerUnit: Number(i.costPerUnit),
    })),
  }
}

async function restockItems(tx: Prisma.TransactionClient, items: { productId: string | null; quantity: number }[]) {
  for (const item of items) {
    if (!item.productId) continue
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    })
  }
}

async function decrementStock(tx: Prisma.TransactionClient, items: { productId: string | null; quantity: number }[]) {
  for (const item of items) {
    if (!item.productId) continue
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    })
  }
}

export const orderService = {
  async create(userId: string, phoneNumber: string, lines: { productId: string; quantity: number }[]) {
    const merged = new Map<string, number>()
    for (const line of lines) {
      merged.set(line.productId, (merged.get(line.productId) ?? 0) + line.quantity)
    }
    lines = [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity }))

    const ids = [...new Set(lines.map((l) => l.productId))]
    const products = await prisma.product.findMany({ where: { id: { in: ids } } })
    if (products.length !== ids.length) {
      const err = new Error('One or more products are invalid')
      ;(err as any).status = 400
      throw err
    }

    let total = 0
    const orderLines: {
      productId: string
      name: string
      price: Prisma.Decimal
      quantity: number
      costPerUnit: Prisma.Decimal
    }[] = []

    for (const line of lines) {
      const p = products.find((x) => x.id === line.productId)!
      if (line.quantity > p.stock) {
        const err = new Error(`Insufficient stock for ${p.name}`)
        ;(err as any).status = 400
        throw err
      }
      const unitSell = Number(p.sellingPrice)
      const unitCost = Number(p.originalPrice)
      const lineTotal = unitSell * line.quantity
      total += lineTotal
      orderLines.push({
        productId: p.id,
        name: p.name,
        price: p.sellingPrice,
        quantity: line.quantity,
        costPerUnit: new Prisma.Decimal(unitCost.toFixed(2)),
      })
    }

    const order = await prisma.order.create({
      data: {
        userId,
        phoneNumber,
        totalAmount: new Prisma.Decimal(total.toFixed(2)),
        status: 'PENDING',
        items: {
          create: orderLines.map((l) => ({
            productId: l.productId,
            name: l.name,
            price: l.price,
            quantity: l.quantity,
            costPerUnit: l.costPerUnit,
          })),
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
    })

    return orderDto(order)
  },

  async listMine(userId: string) {
    const rows = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
    })
    return rows.map(orderDto)
  },

  async listAll() {
    const rows = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
    })
    return rows.map(orderDto)
  },

  async findOrThrow(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })
    if (!order) {
      const err = new Error('Order not found')
      ;(err as any).status = 404
      throw err
    }
    return order
  },

  async findRawForInvoice(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, status: true, invoiceUrl: true },
    })
  },

  async deletePending(orderId: string) {
    const order = await this.findOrThrow(orderId)
    if (order.status !== 'PENDING') {
      const err = new Error('Only pending orders can be deleted')
      ;(err as any).status = 400
      throw err
    }
    await prisma.order.delete({ where: { id: orderId } })
  },

  async confirm(orderId: string, finalTotalAmount: number) {
    const order = await this.findOrThrow(orderId)
    if (order.status !== 'PENDING') {
      const err = new Error('Order is not pending')
      ;(err as any).status = 400
      throw err
    }

    const finalDec = new Prisma.Decimal(finalTotalAmount.toFixed(2))
    if (finalDec.gt(order.totalAmount)) {
      const err = new Error('Final price cannot exceed listed order total')
      ;(err as any).status = 400
      throw err
    }
    if (finalDec.lte(0)) {
      const err = new Error('Final price must be positive')
      ;(err as any).status = 400
      throw err
    }

    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (!item.productId) continue
        const p = await tx.product.findUnique({ where: { id: item.productId } })
        if (!p || p.stock < item.quantity) {
          const err = new Error(`Cannot confirm: insufficient stock for ${item.name}`)
          ;(err as any).status = 409
          throw err
        }
      }
      await decrementStock(tx, order.items)
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
          finalTotalAmount: finalDec,
        },
      })
    })

    const updated = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
    })
    return orderDto(updated)
  },

  async unconfirm(orderId: string) {
    const order = await this.findOrThrow(orderId)
    if (order.status !== 'CONFIRMED') {
      const err = new Error('Only confirmed orders can be unconfirmed')
      ;(err as any).status = 400
      throw err
    }

    await prisma.$transaction(async (tx) => {
      await restockItems(tx, order.items)
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'PENDING',
          finalTotalAmount: null,
        },
      })
    })

    const updated = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
    })
    return orderDto(updated)
  },

  async markDelivered(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
    })
    if (!order) {
      const err = new Error('Order not found')
      ;(err as any).status = 404
      throw err
    }
    if (order.status !== 'CONFIRMED') {
      const err = new Error('Only confirmed orders can be marked delivered')
      ;(err as any).status = 400
      throw err
    }

    const listed = Number(order.totalAmount)
    const final = order.finalTotalAmount != null ? Number(order.finalTotalAmount) : null
    const displayTotal = final ?? listed

    const invoiceRel = await generateOrderInvoicePdf({
      id: order.id,
      createdAt: order.createdAt,
      user: { name: order.user.name, email: order.user.email },
      items: order.items,
      displayTotal,
    })

    const deliveredAt = new Date()

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
        deliveredAt,
        invoiceUrl: invoiceRel,
      },
    })

    const updated = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
    })
    return orderDto(updated)
  },

  async listDeliveredLastYear(userId: string) {
    const since = new Date()
    since.setFullYear(since.getFullYear() - 1)
    const rows = await prisma.order.findMany({
      where: {
        userId,
        status: 'DELIVERED',
        deliveredAt: { gte: since },
      },
      orderBy: { deliveredAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
    })
    return rows.map(orderDto)
  },

  async listForUser(targetUserId: string, requesterId: string, requesterRole: 'admin' | 'customer') {
    if (requesterId !== targetUserId && requesterRole !== 'admin') {
      const err = new Error('Forbidden')
      ;(err as any).status = 403
      throw err
    }
    return this.listMine(targetUserId)
  },

  async getMyOverview(userId: string) {
    const [totalOrders, pending, confirmed, delivered] = await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.order.count({ where: { userId, status: 'PENDING' } }),
      prisma.order.count({ where: { userId, status: 'CONFIRMED' } }),
      prisma.order.count({ where: { userId, status: 'DELIVERED' } }),
    ])

    const recentOrders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        items: true,
      },
    })

    return {
      totalOrders,
      pendingOrders: pending,
      confirmedOrders: confirmed,
      deliveredOrders: delivered,
      recentActivity: recentOrders.map((o) => ({
        id: o.id,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
        displayTotal: o.finalTotalAmount != null ? Number(o.finalTotalAmount) : Number(o.totalAmount),
        itemCount: o.items.length,
      })),
    }
  },

  async markReturned(orderId: string) {
    const order = await this.findOrThrow(orderId)
    if (order.status !== 'DELIVERED') {
      const err = new Error('Only delivered orders can be marked returned')
      ;(err as any).status = 400
      throw err
    }

    await prisma.$transaction(async (tx) => {
      await restockItems(tx, order.items)
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'RETURNED' },
      })
    })

    const updated = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
    })
    return orderDto(updated)
  },

  async markCancelledFromDelivered(orderId: string) {
    const order = await this.findOrThrow(orderId)
    if (order.status !== 'DELIVERED') {
      const err = new Error('Only delivered orders can be cancelled from this state')
      ;(err as any).status = 400
      throw err
    }

    await prisma.$transaction(async (tx) => {
      await restockItems(tx, order.items)
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      })
    })

    const updated = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
    })
    return orderDto(updated)
  },
}
