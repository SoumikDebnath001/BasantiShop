export declare const productService: {
    validateImageUrls(urls: string[]): void;
    list(params: {
        search: string | undefined;
        category: string | undefined;
        minPrice: number | undefined;
        maxPrice: number | undefined;
        sortBy: string | undefined;
        page: number | undefined;
        limit: number | undefined;
        userId?: string;
    }): Promise<{
        data: {
            myRating?: number | null;
            id: string;
            slug: string;
            name: string;
            description: string;
            price: number;
            category: string;
            stock: number;
            images: string[];
            shortDescription: string | undefined;
            createdAt: string;
            averageRating: number;
            ratingCount: number;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    listForAdmin(params: {
        search: string | undefined;
        category: string | undefined;
        minPrice: number | undefined;
        maxPrice: number | undefined;
        sortBy: string | undefined;
        page: number | undefined;
        limit: number | undefined;
    }): Promise<{
        data: {
            id: string;
            slug: string;
            name: string;
            description: string;
            originalPrice: number;
            sellingPrice: number;
            price: number;
            category: string;
            stock: number;
            images: string[];
            shortDescription: string | undefined;
            createdAt: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getByIdOrSlug(idOrSlug: string, userId?: string): Promise<{
        myRating?: number | null;
        id: string;
        slug: string;
        name: string;
        description: string;
        price: number;
        category: string;
        stock: number;
        images: string[];
        shortDescription: string | undefined;
        createdAt: string;
        averageRating: number;
        ratingCount: number;
    }>;
    getAdmin(id: string): Promise<{
        id: string;
        slug: string;
        name: string;
        description: string;
        originalPrice: number;
        sellingPrice: number;
        price: number;
        category: string;
        stock: number;
        images: string[];
        shortDescription: string | undefined;
        createdAt: string;
    }>;
    create(payload: {
        name: string;
        description: string;
        originalPrice: number;
        sellingPrice: number;
        category: string;
        stock: number;
        images: string[];
        shortDescription: string | undefined;
    }): Promise<{
        id: string;
        slug: string;
        name: string;
        description: string;
        originalPrice: number;
        sellingPrice: number;
        price: number;
        category: string;
        stock: number;
        images: string[];
        shortDescription: string | undefined;
        createdAt: string;
    }>;
    update(id: string, payload: Partial<{
        name: string;
        description: string;
        originalPrice: number;
        sellingPrice: number;
        category: string;
        stock: number;
        images: string[];
        shortDescription?: string | undefined;
    }>): Promise<{
        id: string;
        slug: string;
        name: string;
        description: string;
        originalPrice: number;
        sellingPrice: number;
        price: number;
        category: string;
        stock: number;
        images: string[];
        shortDescription: string | undefined;
        createdAt: string;
    }>;
    remove(id: string): Promise<void>;
    upsertRating(userId: string, productId: string, rating: number): Promise<{
        myRating?: number | null;
        id: string;
        slug: string;
        name: string;
        description: string;
        price: number;
        category: string;
        stock: number;
        images: string[];
        shortDescription: string | undefined;
        createdAt: string;
        averageRating: number;
        ratingCount: number;
    }>;
};
//# sourceMappingURL=product.service.d.ts.map