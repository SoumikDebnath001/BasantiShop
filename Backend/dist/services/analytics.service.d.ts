export declare const analyticsService: {
    profitLoss(): Promise<{
        summary: {
            totalSales: number;
            totalProfit: number;
            totalLoss: number;
            orderCount: number;
        };
        orders: {
            id: string;
            status: string;
            customerName: string;
            listedTotal: number;
            finalTotal: number;
            totalCost: number;
            profit: number;
            createdAt: string;
        }[];
    }>;
};
//# sourceMappingURL=analytics.service.d.ts.map