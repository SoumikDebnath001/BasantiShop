export declare const categoryService: {
    list(): Promise<{
        id: string;
        name: string;
        createdAt: string;
    }[]>;
    create(name: string): Promise<{
        id: string;
        name: string;
        createdAt: string;
    }>;
};
//# sourceMappingURL=category.service.d.ts.map