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
    readonly SMTP_HOST: string;
    readonly SMTP_PORT: number;
    readonly SMTP_USER: string;
    readonly SMTP_PASS: string;
    readonly SMTP_FROM: string;
    readonly RAZORPAY_KEY_ID: string;
    readonly RAZORPAY_KEY_SECRET: string;
};
export declare const isProd: boolean;
export declare const allowedCorsOrigins: string[];
//# sourceMappingURL=env.d.ts.map