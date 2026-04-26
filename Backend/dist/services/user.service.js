import { prisma } from '../config/prisma.js';
import { contactService } from './contact.service.js';
function roleToFrontend(role) {
    return role === 'ADMIN' ? 'admin' : 'customer';
}
function userDto(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleToFrontend(user.role),
        phone: user.phone ?? undefined,
        createdAt: user.createdAt.toISOString(),
    };
}
export const userService = {
    async updateProfile(userId, payload) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name: payload.name,
                phone: payload.phone ?? null,
            },
        });
        return userDto(user);
    },
    async listContacts(userId) {
        const data = await contactService.listHistoryForUser(userId);
        return { data };
    },
};
//# sourceMappingURL=user.service.js.map