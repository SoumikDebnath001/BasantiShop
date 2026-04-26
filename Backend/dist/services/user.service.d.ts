export declare const userService: {
    updateProfile(userId: string, payload: {
        name: string;
        phone: string | undefined;
    }): Promise<{
        id: string;
        name: string;
        email: string;
        role: "admin" | "customer";
        phone: string | undefined;
        createdAt: string;
    }>;
    listContacts(userId: string): Promise<{
        data: {
            id: string;
            productName: string;
            productId: string | null;
            message: string;
            response: string | null;
            createdAt: string;
            preview: string;
        }[];
    }>;
};
//# sourceMappingURL=user.service.d.ts.map