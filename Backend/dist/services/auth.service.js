import { prisma } from '../config/prisma.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken } from '../utils/jwt.js';
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
export const authService = {
    async register(payload) {
        const existing = await prisma.user.findUnique({ where: { email: payload.email } });
        if (existing) {
            const err = new Error('Email already in use');
            err.status = 409;
            throw err;
        }
        const passwordHash = await hashPassword(payload.password);
        const user = await prisma.user.create({
            data: {
                name: payload.name,
                email: payload.email,
                phone: payload.phone ?? null,
                passwordHash,
                role: 'CUSTOMER',
            },
        });
        const token = signAccessToken({ id: user.id, role: roleToFrontend(user.role) });
        return { token, user: userDto(user) };
    },
    async login(payload) {
        const user = await prisma.user.findUnique({ where: { email: payload.email } });
        if (!user) {
            const err = new Error('Invalid credentials');
            err.status = 401;
            throw err;
        }
        const ok = await verifyPassword(payload.password, user.passwordHash);
        if (!ok) {
            const err = new Error('Invalid credentials');
            err.status = 401;
            throw err;
        }
        const token = signAccessToken({ id: user.id, role: roleToFrontend(user.role) });
        return { token, user: userDto(user) };
    },
    async me(userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            const err = new Error('Unauthorized');
            err.status = 401;
            throw err;
        }
        return userDto(user);
    },
};
//# sourceMappingURL=auth.service.js.map