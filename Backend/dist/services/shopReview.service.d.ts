export declare const shopReviewService: {
    create(userId: string, rating: number, message: string): Promise<{
        id: string;
        userId: string;
        rating: number;
        message: string;
        createdAt: string;
        user: {
            email: string;
            name: string;
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
            email: string;
            name: string;
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
            email: string;
            name: string;
            id: string;
        };
    }[]>;
    publicSummary(): Promise<{
        averageRating: number;
        reviewCount: number;
    }>;
};
//# sourceMappingURL=shopReview.service.d.ts.map