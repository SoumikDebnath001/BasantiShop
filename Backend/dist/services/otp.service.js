import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
function generateOtp() {
    return String(crypto.randomInt(100000, 999999));
}
function timingSafeCompare(a, b) {
    if (a.length !== b.length)
        return false;
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
export const otpService = {
    generateOtp,
    async storeOtp(email, purpose, expiryMs) {
        const code = generateOtp();
        const expiresAt = new Date(Date.now() + expiryMs);
        await prisma.otpCode.deleteMany({ where: { email, purpose } });
        await prisma.otpCode.create({ data: { email, code, purpose, expiresAt } });
        return code;
    },
    async verifyOtp(email, code, purpose) {
        const record = await prisma.otpCode.findFirst({
            where: { email, purpose, used: false, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
        });
        if (!record)
            return false;
        if (!timingSafeCompare(record.code, code))
            return false;
        await prisma.otpCode.update({ where: { id: record.id }, data: { used: true } });
        return true;
    },
};
//# sourceMappingURL=otp.service.js.map