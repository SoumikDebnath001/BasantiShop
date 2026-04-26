export declare const authService: {
    register(payload: {
        name: string;
        email: string;
        password: string;
        phone: string | undefined;
    }): Promise<{
        token: string;
        user: any;
    }>;
    login(payload: {
        email: string;
        password: string;
    }): Promise<{
        token: string;
        user: any;
    }>;
    me(userId: string): Promise<any>;
};
//# sourceMappingURL=auth.service.d.ts.map