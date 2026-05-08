export declare const paymentService: {
    createOrder(userId: string, phoneNumber: string, lines: {
        productId: string;
        quantity: number;
    }[]): Promise<{
        orderId: string;
        razorpayOrderId: string;
        amount: number;
        currency: string;
        keyId: string;
    }>;
    verifyPayment(payload: {
        orderId: string;
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
        userId: string;
    }): Promise<{
        success: boolean;
        orderId: string;
    }>;
    getConfig(): {
        keyId: string;
    };
};
//# sourceMappingURL=payment.service.d.ts.map