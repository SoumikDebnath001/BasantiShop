import type { Request, Response } from 'express';
export declare const paymentController: {
    getConfig(_req: Request, res: Response): Promise<void>;
    createOrder(req: Request, res: Response): Promise<void>;
    verifyPayment(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=payment.controller.d.ts.map