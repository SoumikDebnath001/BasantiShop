import { prisma } from '../config/prisma.js'

export function slugifyBase(name: string): string {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72)
  return s.length > 0 ? s : 'product'
}

export async function uniqueProductSlug(base: string, excludeProductId?: string): Promise<string> {
  let slug = base
  let n = 0
  for (;;) {
    const existing = await prisma.product.findFirst({
      where: {
        slug,
        ...(excludeProductId ? { NOT: { id: excludeProductId } } : {}),
      },
      select: { id: true },
    })
    if (!existing) return slug
    slug = `${base}-${++n}`
  }
}
