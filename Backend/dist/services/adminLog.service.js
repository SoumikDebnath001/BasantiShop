import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
export const ADMIN_ACTIONS = {
    CREATE_PRODUCT: 'CREATE_PRODUCT',
    UPDATE_PRODUCT: 'UPDATE_PRODUCT',
    DELETE_PRODUCT: 'DELETE_PRODUCT',
    CREATE_ORDER: 'CREATE_ORDER',
    DELETE_ORDER: 'DELETE_ORDER',
    CONFIRM_ORDER: 'CONFIRM_ORDER',
    UNCONFIRM_ORDER: 'UNCONFIRM_ORDER',
    DELIVER_ORDER: 'DELIVER_ORDER',
    RETURN_ORDER: 'RETURN_ORDER',
    CANCEL_ORDER: 'CANCEL_ORDER',
    ADMIN_LOGIN: 'ADMIN_LOGIN',
};
export const adminLogService = {
    async log(adminId, action, details) {
        await prisma.adminLog.create({
            data: {
                adminId,
                action,
                details: details,
            },
        });
    },
    async list(limit = 100) {
        const rows = await prisma.adminLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: Math.min(limit, 500),
            include: { admin: { select: { id: true, name: true, email: true } } },
        });
        return rows.map((r) => ({
            id: r.id,
            adminId: r.adminId,
            action: r.action,
            details: r.details,
            createdAt: r.createdAt.toISOString(),
            admin: r.admin,
        }));
    },
};
//# sourceMappingURL=adminLog.service.js.map