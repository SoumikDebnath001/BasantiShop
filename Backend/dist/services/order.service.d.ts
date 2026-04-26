import { Prisma } from '@prisma/client';
export declare const orderService: {
    create(userId: string, phoneNumber: string, lines: {
        productId: string;
        quantity: number;
    }[]): Promise<{
        id: string;
        userId: string;
        phoneNumber: string;
        totalAmount: number;
        finalTotalAmount: number | null;
        displayTotal: number;
        status: import("@prisma/client").$Enums.OrderStatus;
        deliveredAt: string | null;
        invoiceUrl: string | null;
        createdAt: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
        items: {
            id: string;
            productId: string | null;
            name: string;
            price: number;
            quantity: number;
            lineListedTotal: number;
            costPerUnit: number;
        }[];
    }>;
    listMine(userId: string): Promise<{
        id: string;
        userId: string;
        phoneNumber: string;
        totalAmount: number;
        finalTotalAmount: number | null;
        displayTotal: number;
        status: import("@prisma/client").$Enums.OrderStatus;
        deliveredAt: string | null;
        invoiceUrl: string | null;
        createdAt: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
        items: {
            id: string;
            productId: string | null;
            name: string;
            price: number;
            quantity: number;
            lineListedTotal: number;
            costPerUnit: number;
        }[];
    }[]>;
    listAll(): Promise<{
        id: string;
        userId: string;
        phoneNumber: string;
        totalAmount: number;
        finalTotalAmount: number | null;
        displayTotal: number;
        status: import("@prisma/client").$Enums.OrderStatus;
        deliveredAt: string | null;
        invoiceUrl: string | null;
        createdAt: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
        items: {
            id: string;
            productId: string | null;
            name: string;
            price: number;
            quantity: number;
            lineListedTotal: number;
            costPerUnit: number;
        }[];
    }[]>;
    findOrThrow(orderId: string): Promise<{
        items: {
            name: string;
            id: string;
            productId: string | null;
            price: Prisma.Decimal;
            quantity: number;
            costPerUnit: Prisma.Decimal;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        phoneNumber: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        finalTotalAmount: Prisma.Decimal | null;
        totalAmount: Prisma.Decimal;
        deliveredAt: Date | null;
        invoiceUrl: string | null;
    }>;
    findRawForInvoice(orderId: string): Promise<{
        userId: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        invoiceUrl: string | null;
    } | null>;
    deletePending(orderId: string): Promise<void>;
    confirm(orderId: string, finalTotalAmount: number): Promise<{
        id: string;
        userId: string;
        phoneNumber: string;
        totalAmount: number;
        finalTotalAmount: number | null;
        displayTotal: number;
        status: import("@prisma/client").$Enums.OrderStatus;
        deliveredAt: string | null;
        invoiceUrl: string | null;
        createdAt: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
        items: {
            id: string;
            productId: string | null;
            name: string;
            price: number;
            quantity: number;
            lineListedTotal: number;
            costPerUnit: number;
        }[];
    }>;
    unconfirm(orderId: string): Promise<{
        id: string;
        userId: string;
        phoneNumber: string;
        totalAmount: number;
        finalTotalAmount: number | null;
        displayTotal: number;
        status: import("@prisma/client").$Enums.OrderStatus;
        deliveredAt: string | null;
        invoiceUrl: string | null;
        createdAt: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
        items: {
            id: string;
            productId: string | null;
            name: string;
            price: number;
            quantity: number;
            lineListedTotal: number;
            costPerUnit: number;
        }[];
    }>;
    markDelivered(orderId: string): Promise<{
        id: string;
        userId: string;
        phoneNumber: string;
        totalAmount: number;
        finalTotalAmount: number | null;
        displayTotal: number;
        status: import("@prisma/client").$Enums.OrderStatus;
        deliveredAt: string | null;
        invoiceUrl: string | null;
        createdAt: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
        items: {
            id: string;
            productId: string | null;
            name: string;
            price: number;
            quantity: number;
            lineListedTotal: number;
            costPerUnit: number;
        }[];
    }>;
    listDeliveredLastYear(userId: string): Promise<{
        id: string;
        userId: string;
        phoneNumber: string;
        totalAmount: number;
        finalTotalAmount: number | null;
        displayTotal: number;
        status: import("@prisma/client").$Enums.OrderStatus;
        deliveredAt: string | null;
        invoiceUrl: string | null;
        createdAt: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
        items: {
            id: string;
            productId: string | null;
            name: string;
            price: number;
            quantity: number;
            lineListedTotal: number;
            costPerUnit: number;
        }[];
    }[]>;
    listForUser(targetUserId: string, requesterId: string, requesterRole: "admin" | "customer"): Promise<{
        id: string;
        userId: string;
        phoneNumber: string;
        totalAmount: number;
        finalTotalAmount: number | null;
        displayTotal: number;
        status: import("@prisma/client").$Enums.OrderStatus;
        deliveredAt: string | null;
        invoiceUrl: string | null;
        createdAt: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
        items: {
            id: string;
            productId: string | null;
            name: string;
            price: number;
            quantity: number;
            lineListedTotal: number;
            costPerUnit: number;
        }[];
    }[]>;
    getMyOverview(userId: string): Promise<{
        totalOrders: number;
        pendingOrders: number;
        confirmedOrders: number;
        deliveredOrders: number;
        recentActivity: {
            id: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            createdAt: string;
            displayTotal: number;
            itemCount: number;
        }[];
    }>;
    markReturned(orderId: string): Promise<{
        id: string;
        userId: string;
        phoneNumber: string;
        totalAmount: number;
        finalTotalAmount: number | null;
        displayTotal: number;
        status: import("@prisma/client").$Enums.OrderStatus;
        deliveredAt: string | null;
        invoiceUrl: string | null;
        createdAt: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
        items: {
            id: string;
            productId: string | null;
            name: string;
            price: number;
            quantity: number;
            lineListedTotal: number;
            costPerUnit: number;
        }[];
    }>;
    markCancelledFromDelivered(orderId: string): Promise<{
        id: string;
        userId: string;
        phoneNumber: string;
        totalAmount: number;
        finalTotalAmount: number | null;
        displayTotal: number;
        status: import("@prisma/client").$Enums.OrderStatus;
        deliveredAt: string | null;
        invoiceUrl: string | null;
        createdAt: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
        items: {
            id: string;
            productId: string | null;
            name: string;
            price: number;
            quantity: number;
            lineListedTotal: number;
            costPerUnit: number;
        }[];
    }>;
};
//# sourceMappingURL=order.service.d.ts.map