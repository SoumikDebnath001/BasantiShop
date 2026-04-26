import 'dotenv/config';
export declare const env: {
    readonly NODE_ENV: string;
    readonly PORT: number;
    readonly DATABASE_URL: string;
    readonly JWT_SECRET: string;
    readonly CORS_ORIGIN: string;
    readonly CLOUDINARY_CLOUD_NAME: string | undefined;
    readonly CLOUDINARY_API_KEY: string | undefined;
    readonly CLOUDINARY_API_SECRET: string | undefined;
};
export declare const isProd: boolean;
/** Comma-separated allowlist support for CORS origins. */
export declare const allowedCorsOrigins: string[];
//# sourceMappingURL=env.d.ts.map