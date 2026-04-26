export declare const searchService: {
    search(q: string): Promise<{
        categories: {
            id: string;
            name: string;
        }[];
        products: {
            id: string;
            slug: string;
            name: string;
            category: string;
            image: string | null;
        }[];
    }>;
};
//# sourceMappingURL=search.service.d.ts.map