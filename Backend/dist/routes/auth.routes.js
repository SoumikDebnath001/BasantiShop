import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { auth } from '../middlewares/auth.js';
import { otpRateLimiter } from '../middlewares/rateLimit.js';
export const authRouter = Router();
// Registration (two-step)
authRouter.post('/register/initiate', otpRateLimiter, authController.registerInitiate);
authRouter.post('/register/verify', otpRateLimiter, authController.registerVerify);
// Password login
authRouter.post('/login', authController.login);
// OTP login
authRouter.post('/login/send-otp', otpRateLimiter, authController.loginSendOtp);
authRouter.post('/login/verify-otp', otpRateLimiter, authController.loginVerifyOtp);
// Forgot / reset password
authRouter.post('/forgot-password', otpRateLimiter, authController.forgotPassword);
authRouter.post('/reset-password', otpRateLimiter, authController.resetPassword);
// Profile
authRouter.get('/me', auth, authController.me);
//# sourceMappingURL=auth.routes.js.map