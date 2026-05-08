import type { OtpPurpose } from '@prisma/client';
declare function generateOtp(): string;
export declare const otpService: {
    generateOtp: typeof generateOtp;
    storeOtp(email: string, purpose: OtpPurpose, expiryMs: number): Promise<string>;
    verifyOtp(email: string, code: string, purpose: OtpPurpose): Promise<boolean>;
};
export {};
//# sourceMappingURL=otp.service.d.ts.map