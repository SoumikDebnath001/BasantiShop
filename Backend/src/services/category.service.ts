import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma.js'

export const categoryService = {
  async list() {
    const rows = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, createdAt: true },
    })
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      createdAt: r.createdAt.toISOString(),
    }))
  },

  async create(name: string) {
    const trimmed = name.trim()
    try {
      const row = await prisma.category.create({
        data: { name: trimmed },
        select: { id: true, name: true, createdAt: true },
      })
      return {
        id: row.id,
        name: row.name,
        createdAt: row.createdAt.toISOString(),
      }
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const err = new Error('A category with this name already exists')
        ;(err as any).status = 409
        throw err
      }
      throw e
    }
  },
}
