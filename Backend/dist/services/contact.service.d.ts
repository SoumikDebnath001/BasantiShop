export declare const contactService: {
    create(payload: {
        name: string;
        phone: string;
        email: string;
        message: string;
        productId: string | undefined;
        productName: string | undefined;
        userId: string | undefined;
    }): Promise<void>;
    listHistoryForUser(userId: string): Promise<{
        id: string;
        productName: string;
        productId: string | null;
        message: string;
        response: string | null;
        createdAt: string;
        preview: string;
    }[]>;
    setAdminResponse(messageId: string, response: string): Promise<{
        id: string;
        response: string | null;
    }>;
    /** All contact form submissions (newest first). Admin only. */
    listAllForAdmin(): Promise<{
        id: string;
        name: string;
        phone: string;
        email: string;
        message: string;
        response: string | null;
        productName: string | null;
        productId: string | null;
        userId: string | null;
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        createdAt: string;
    }[]>;
};
//# sourceMappingURL=contact.service.d.ts.map