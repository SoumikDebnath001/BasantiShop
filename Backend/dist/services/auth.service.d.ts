export declare const authService: {
    registerInitiate(payload: {
        name: string;
        email: string;
        password: string;
        phone?: string;
    }): Promise<{
        message: string;
    }>;
    registerVerify(payload: {
        email: string;
        otp: string;
    }): Promise<{
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: "admin" | "customer";
            phone: string | undefined;
            createdAt: string;
        };
    }>;
    login(payload: {
        email: string;
        password: string;
    }): Promise<{
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: "admin" | "customer";
            phone: string | undefined;
            createdAt: string;
        };
    }>;
    loginSendOtp(email: string): Promise<{
        message: string;
    }>;
    loginVerifyOtp(payload: {
        email: string;
        otp: string;
    }): Promise<{
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: "admin" | "customer";
            phone: string | undefined;
            createdAt: string;
        };
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(payload: {
        email: string;
        otp: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    me(userId: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: "admin" | "customer";
        phone: string | undefined;
        createdAt: string;
    }>;
};
//# sourceMappingURL=auth.service.d.ts.map