import type { Request, Response } from 'express';
export declare const authController: {
    registerInitiate(req: Request, res: Response): Promise<void>;
    registerVerify(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    loginSendOtp(req: Request, res: Response): Promise<void>;
    loginVerifyOtp(req: Request, res: Response): Promise<void>;
    forgotPassword(req: Request, res: Response): Promise<void>;
    resetPassword(req: Request, res: Response): Promise<void>;
    me(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=auth.controller.d.ts.map