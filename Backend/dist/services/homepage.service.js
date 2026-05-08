import { prisma } from '../config/prisma.js';
const DEFAULTS = {
    heroHeadline: 'Quality variety, thoughtfully stocked.',
    heroSubtext: 'We are a local variety store. Create an account to explore our catalog of products.',
    heroCta: 'Shop Now',
    announcementBanner: null,
    announcementEnabled: false,
    aboutTitle: 'About Basanti',
    aboutText: 'Basanti Variety Store brings together everyday essentials and specialty finds in one place. We focus on clear pricing, honest stock levels, and helping you complete your purchase.',
};
export const homepageService = {
    async get() {
        const content = await prisma.homepageContent.findUnique({
            where: { id: 'singleton' },
        });
        return content ?? { id: 'singleton', ...DEFAULTS, updatedAt: new Date() };
    },
    async update(data) {
        const content = await prisma.homepageContent.upsert({
            where: { id: 'singleton' },
            create: { id: 'singleton', ...DEFAULTS, ...data },
            update: data,
        });
        return content;
    },
};
//# sourceMappingURL=homepage.service.js.map