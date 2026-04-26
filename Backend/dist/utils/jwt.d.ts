export type JwtUser = {
    id: string;
    role: 'admin' | 'customer';
};
export declare function signAccessToken(payload: JwtUser): string;
export declare function verifyAccessToken(token: string): JwtUser;
//# sourceMappingURL=jwt.d.ts.map