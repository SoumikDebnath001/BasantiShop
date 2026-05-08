import { z } from 'zod';
export const registerInitiateSchema = z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(320),
    password: z.string().min(6).max(128),
    phone: z.string().max(40).optional(),
});
export const registerVerifySchema = z.object({
    email: z.string().email().max(320),
    otp: z.string().length(6).regex(/^\d{6}$/, 'OTP must be 6 digits'),
});
export const loginSchema = z.object({
    email: z.string().email().max(320),
    password: z.string().min(6).max(128),
});
export const loginSendOtpSchema = z.object({
    email: z.string().email().max(320),
});
export const loginVerifyOtpSchema = z.object({
    email: z.string().email().max(320),
    otp: z.string().length(6).regex(/^\d{6}$/, 'OTP must be 6 digits'),
});
export const forgotPasswordSchema = z.object({
    email: z.string().email().max(320),
});
export const resetPasswordSchema = z.object({
    email: z.string().email().max(320),
    otp: z.string().length(6).regex(/^\d{6}$/, 'OTP must be 6 digits'),
    newPassword: z.string().min(6).max(128),
});
// Keep for backward compat if anything imports it
export const registerSchema = registerInitiateSchema;
//# sourceMappingURL=auth.schemas.js.map