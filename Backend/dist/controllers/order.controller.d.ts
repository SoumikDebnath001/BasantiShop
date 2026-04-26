import type { Request, Response } from 'express';
export declare const orderController: {
    create(req: Request, res: Response): Promise<void>;
    my(req: Request, res: Response): Promise<void>;
    myOverview(req: Request, res: Response): Promise<void>;
    historyDeliveredLastYear(req: Request, res: Response): Promise<void>;
    listForUser(req: Request, res: Response): Promise<void>;
    downloadInvoice(req: Request, res: Response): Promise<void>;
    listAll(_req: Request, res: Response): Promise<void>;
    updateStatus(req: Request, res: Response): Promise<void>;
    remove(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=order.controller.d.ts.map