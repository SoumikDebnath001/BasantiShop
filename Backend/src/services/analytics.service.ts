import { prisma } from '../config/prisma.js'

const PROFIT_STATUSES = ['CONFIRMED', 'DELIVERED'] as const

export const analyticsService = {
  async profitLoss() {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: [...PROFIT_STATUSES] },
        finalTotalAmount: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
    })

    let totalSales = 0
    let totalProfit = 0
    let totalLoss = 0
    const breakdown: {
      id: string
      status: string
      customerName: string
      listedTotal: number
      finalTotal: number
      totalCost: number
      profit: number
      createdAt: string
    }[] = []

    for (const o of orders) {
      const finalTotal = Number(o.finalTotalAmount)
      const listedTotal = Number(o.totalAmount)
      const totalCost = o.items.reduce((s, i) => s + Number(i.costPerUnit) * i.quantity, 0)
      const profit = finalTotal - totalCost
      totalSales += finalTotal
      if (profit >= 0) totalProfit += profit
      else totalLoss += -profit

      breakdown.push({
        id: o.id,
        status: o.status,
        customerName: o.user.name,
        listedTotal,
        finalTotal,
        totalCost,
        profit,
        createdAt: o.createdAt.toISOString(),
      })
    }

    return {
      summary: {
        totalSales,
        totalProfit,
        totalLoss,
        orderCount: orders.length,
      },
      orders: breakdown,
    }
  },
}
