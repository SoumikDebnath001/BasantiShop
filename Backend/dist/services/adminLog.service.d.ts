import { Prisma } from '@prisma/client';
export declare const ADMIN_ACTIONS: {
    readonly CREATE_PRODUCT: "CREATE_PRODUCT";
    readonly UPDATE_PRODUCT: "UPDATE_PRODUCT";
    readonly DELETE_PRODUCT: "DELETE_PRODUCT";
    readonly CREATE_ORDER: "CREATE_ORDER";
    readonly DELETE_ORDER: "DELETE_ORDER";
    readonly CONFIRM_ORDER: "CONFIRM_ORDER";
    readonly UNCONFIRM_ORDER: "UNCONFIRM_ORDER";
    readonly DELIVER_ORDER: "DELIVER_ORDER";
    readonly RETURN_ORDER: "RETURN_ORDER";
    readonly CANCEL_ORDER: "CANCEL_ORDER";
    readonly ADMIN_LOGIN: "ADMIN_LOGIN";
};
export declare const adminLogService: {
    log(adminId: string, action: string, details: Record<string, unknown>): Promise<void>;
    list(limit?: number): Promise<{
        id: string;
        adminId: string;
        action: string;
        details: Prisma.JsonValue;
        createdAt: string;
        admin: {
            email: string;
            name: string;
            id: string;
        };
    }[]>;
};
//# sourceMappingURL=adminLog.service.d.ts.map