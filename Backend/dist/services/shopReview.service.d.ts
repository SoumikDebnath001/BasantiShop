export declare const shopReviewService: {
    create(userId: string, rating: number, message: string): Promise<{
        id: string;
        userId: string;
        rating: number;
        message: string;
        createdAt: string;
        user: {
            name: string;
            email: string;
            id: string;
        };
    }>;
    listPublic(limit?: number): Promise<{
        id: string;
        userId: string;
        rating: number;
        message: string;
        createdAt: string;
        user: {
            name: string;
            email: string;
            id: string;
        };
    }[]>;
    listAllForAdmin(): Promise<{
        id: string;
        userId: string;
        rating: number;
        message: string;
        createdAt: string;
        user: {
            name: string;
            email: string;
            id: string;
        };
    }[]>;
    deleteById(id: string): Promise<void>;
    publicSummary(): Promise<{
        averageRating: number;
        reviewCount: number;
    }>;
};
//# sourceMappingURL=shopReview.service.d.ts.map