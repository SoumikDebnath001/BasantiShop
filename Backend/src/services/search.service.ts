import { prisma } from '../config/prisma.js'

const MAX_CATEGORIES = 12
const MAX_PRODUCTS = 12

export const searchService = {
  async search(q: string) {
    const query = q.trim()
    if (!query) {
      return {
        categories: [] as { id: string; name: string }[],
        products: [] as {
          id: string
          slug: string
          name: string
          category: string
          image: string | null
        }[],
      }
    }

    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        take: MAX_CATEGORIES,
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      }),
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { shortDescription: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: MAX_PRODUCTS,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          slug: true,
          name: true,
          category: true,
          images: { select: { url: true, position: true }, orderBy: { position: 'asc' }, take: 1 },
        },
      }),
    ])

    return {
      categories,
      products: products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        image: p.images[0]?.url ?? null,
      })),
    }
  },
}
