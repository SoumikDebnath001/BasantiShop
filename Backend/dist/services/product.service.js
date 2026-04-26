import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';
import { slugifyBase, uniqueProductSlug } from '../utils/slug.js';
const imageUrlSchemaCheck = (url) => {
    try {
        const u = new URL(url);
        return u.protocol === 'https:' || u.protocol === 'http:';
    }
    catch {
        return false;
    }
};
async function ratingStatsMap(productIds) {
    if (!productIds.length)
        return new Map();
    const rows = await prisma.productRating.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds } },
        _avg: { rating: true },
        _count: { _all: true },
    });
    const m = new Map();
    for (const r of rows) {
        m.set(r.productId, {
            averageRating: r._avg.rating != null ? Math.round(Number(r._avg.rating) * 10) / 10 : 0,
            ratingCount: r._count._all,
        });
    }
    return m;
}
function productPublicDto(p, stats, userRating) {
    return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: Number(p.sellingPrice),
        category: p.category,
        stock: p.stock,
        images: p.images.sort((a, b) => a.position - b.position).map((i) => i.url),
        shortDescription: p.shortDescription ?? undefined,
        createdAt: p.createdAt.toISOString(),
        averageRating: stats?.averageRating ?? 0,
        ratingCount: stats?.ratingCount ?? 0,
        ...(userRating ? { myRating: userRating.myRating } : {}),
    };
}
function productAdminDto(p) {
    return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        originalPrice: Number(p.originalPrice),
        sellingPrice: Number(p.sellingPrice),
        price: Number(p.sellingPrice),
        category: p.category,
        stock: p.stock,
        images: p.images.sort((a, b) => a.position - b.position).map((i) => i.url),
        shortDescription: p.shortDescription ?? undefined,
        createdAt: p.createdAt.toISOString(),
    };
}
export const productService = {
    validateImageUrls(urls) {
        for (const url of urls) {
            if (!imageUrlSchemaCheck(url)) {
                const err = new Error('Invalid image URL');
                err.status = 400;
                throw err;
            }
        }
    },
    async list(params) {
        const page = params.page ?? 1;
        const limit = params.limit ?? 8;
        const where = {};
        if (params.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } },
                { slug: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        if (params.category) {
            where.category = params.category;
        }
        if (typeof params.minPrice === 'number' || typeof params.maxPrice === 'number') {
            where.sellingPrice = {};
            if (typeof params.minPrice === 'number')
                where.sellingPrice.gte = new Prisma.Decimal(params.minPrice);
            if (typeof params.maxPrice === 'number')
                where.sellingPrice.lte = new Prisma.Decimal(params.maxPrice);
        }
        let orderBy = { createdAt: 'desc' };
        if (params.sortBy === 'price-asc')
            orderBy = { sellingPrice: 'asc' };
        if (params.sortBy === 'price-desc')
            orderBy = { sellingPrice: 'desc' };
        if (params.sortBy === 'name')
            orderBy = { name: 'asc' };
        if (params.sortBy === 'newest')
            orderBy = { createdAt: 'desc' };
        const [total, products] = await Promise.all([
            prisma.product.count({ where }),
            prisma.product.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                include: { images: { select: { url: true, position: true } } },
            }),
        ]);
        const ids = products.map((p) => p.id);
        const stats = await ratingStatsMap(ids);
        let myRatings = new Map();
        if (params.userId && ids.length) {
            const ratings = await prisma.productRating.findMany({
                where: { userId: params.userId, productId: { in: ids } },
                select: { productId: true, rating: true },
            });
            myRatings = new Map(ratings.map((r) => [r.productId, r.rating]));
        }
        return {
            data: products.map((p) => productPublicDto(p, stats.get(p.id), params.userId ? { myRating: myRatings.get(p.id) ?? null } : undefined)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    },
    async listForAdmin(params) {
        const page = params.page ?? 1;
        const limit = params.limit ?? 100;
        const where = {};
        if (params.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } },
                { slug: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        if (params.category) {
            where.category = params.category;
        }
        if (typeof params.minPrice === 'number' || typeof params.maxPrice === 'number') {
            where.sellingPrice = {};
            if (typeof params.minPrice === 'number')
                where.sellingPrice.gte = new Prisma.Decimal(params.minPrice);
            if (typeof params.maxPrice === 'number')
                where.sellingPrice.lte = new Prisma.Decimal(params.maxPrice);
        }
        let orderBy = { createdAt: 'desc' };
        if (params.sortBy === 'price-asc')
            orderBy = { sellingPrice: 'asc' };
        if (params.sortBy === 'price-desc')
            orderBy = { sellingPrice: 'desc' };
        if (params.sortBy === 'name')
            orderBy = { name: 'asc' };
        if (params.sortBy === 'newest')
            orderBy = { createdAt: 'desc' };
        const [total, products] = await Promise.all([
            prisma.product.count({ where }),
            prisma.product.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                include: { images: { select: { url: true, position: true } } },
            }),
        ]);
        return {
            data: products.map((p) => productAdminDto(p)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    },
    async getByIdOrSlug(idOrSlug, userId) {
        const byId = await prisma.product.findUnique({
            where: { id: idOrSlug },
            include: { images: { select: { url: true, position: true } } },
        });
        const p = byId ??
            (await prisma.product.findUnique({
                where: { slug: idOrSlug },
                include: { images: { select: { url: true, position: true } } },
            }));
        if (!p) {
            const err = new Error('Product not found');
            err.status = 404;
            throw err;
        }
        const stats = await ratingStatsMap([p.id]);
        let myRating = null;
        if (userId) {
            const row = await prisma.productRating.findUnique({
                where: { userId_productId: { userId, productId: p.id } },
                select: { rating: true },
            });
            myRating = row?.rating ?? null;
        }
        return productPublicDto(p, stats.get(p.id), userId ? { myRating } : undefined);
    },
    async getAdmin(id) {
        const p = await prisma.product.findUnique({
            where: { id },
            include: { images: { select: { url: true, position: true } } },
        });
        if (!p) {
            const err = new Error('Product not found');
            err.status = 404;
            throw err;
        }
        return productAdminDto(p);
    },
    async create(payload) {
        this.validateImageUrls(payload.images);
        const base = slugifyBase(payload.name);
        const slug = await uniqueProductSlug(base);
        const p = await prisma.product.create({
            data: {
                name: payload.name,
                slug,
                description: payload.description,
                shortDescription: payload.shortDescription ?? null,
                originalPrice: new Prisma.Decimal(payload.originalPrice),
                sellingPrice: new Prisma.Decimal(payload.sellingPrice),
                category: payload.category,
                stock: payload.stock,
                images: {
                    create: payload.images.map((url, idx) => ({ url, position: idx })),
                },
            },
            include: { images: { select: { url: true, position: true } } },
        });
        return productAdminDto(p);
    },
    async update(id, payload) {
        const existing = await prisma.product.findUnique({ where: { id }, select: { id: true, slug: true, name: true } });
        if (!existing) {
            const err = new Error('Product not found');
            err.status = 404;
            throw err;
        }
        if (payload.images)
            this.validateImageUrls(payload.images);
        const data = {};
        if (payload.name !== undefined) {
            data.name = payload.name;
            const base = slugifyBase(payload.name);
            data.slug = await uniqueProductSlug(base, id);
        }
        if (payload.description !== undefined)
            data.description = payload.description;
        if (payload.shortDescription !== undefined)
            data.shortDescription = payload.shortDescription ?? null;
        if (payload.category !== undefined)
            data.category = payload.category;
        if (payload.stock !== undefined)
            data.stock = payload.stock;
        if (payload.originalPrice !== undefined)
            data.originalPrice = new Prisma.Decimal(payload.originalPrice);
        if (payload.sellingPrice !== undefined)
            data.sellingPrice = new Prisma.Decimal(payload.sellingPrice);
        if (payload.images) {
            data.images = {
                deleteMany: {},
                create: payload.images.map((url, idx) => ({ url, position: idx })),
            };
        }
        const p = await prisma.product.update({
            where: { id },
            data,
            include: { images: { select: { url: true, position: true } } },
        });
        return productAdminDto(p);
    },
    async remove(id) {
        const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
        if (!existing) {
            const err = new Error('Product not found');
            err.status = 404;
            throw err;
        }
        await prisma.product.delete({ where: { id } });
    },
    async upsertRating(userId, productId, rating) {
        const p = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
        if (!p) {
            const err = new Error('Product not found');
            err.status = 404;
            throw err;
        }
        await prisma.productRating.upsert({
            where: { userId_productId: { userId, productId } },
            create: { userId, productId, rating },
            update: { rating },
        });
        return this.getByIdOrSlug(productId, userId);
    },
};
//# sourceMappingURL=product.service.js.map