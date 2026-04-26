import { prisma } from '../config/prisma.js'

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, '').trim()

export const shopReviewService = {
  async create(userId: string, rating: number, message: string) {
    const clean = stripHtml(message)
    if (clean.length < 3) {
      const err = new Error('Message is too short')
      ;(err as any).status = 400
      throw err
    }
    const row = await prisma.shopReview.create({
      data: { userId, rating, message: clean.slice(0, 2000) },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    return {
      id: row.id,
      userId: row.userId,
      rating: row.rating,
      message: row.message,
      createdAt: row.createdAt.toISOString(),
      user: row.user,
    }
  },

  async listPublic(limit = 30) {
    const rows = await prisma.shopReview.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      rating: r.rating,
      message: r.message,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
    }))
  },

  async listAllForAdmin() {
    const rows = await prisma.shopReview.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      rating: r.rating,
      message: r.message,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
    }))
  },

  async publicSummary() {
    const agg = await prisma.shopReview.aggregate({
      _avg: { rating: true },
      _count: { _all: true },
    })
    return {
      averageRating: agg._avg.rating != null ? Math.round(Number(agg._avg.rating) * 10) / 10 : 0,
      reviewCount: agg._count._all,
    }
  },
}
