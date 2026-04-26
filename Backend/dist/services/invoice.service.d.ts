import { Prisma } from '@prisma/client';
export type InvoiceOrderInput = {
    id: string;
    createdAt: Date;
    user: {
        name: string;
        email: string;
    };
    items: {
        name: string;
        quantity: number;
        price: Prisma.Decimal;
    }[];
    displayTotal: number;
};
/**
 * Writes invoice PDF under uploads/invoices/{orderId}.pdf.
 * @returns Relative path for DB: `invoices/{orderId}.pdf`
 */
export declare function generateOrderInvoicePdf(order: InvoiceOrderInput): Promise<string>;
/** Absolute path for a DB-stored relative path like invoices/xxx.pdf */
export declare function resolveInvoiceAbsolutePath(storedRelative: string): string;
//# sourceMappingURL=invoice.service.d.ts.map