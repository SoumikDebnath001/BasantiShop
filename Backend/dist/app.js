import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { allowedCorsOrigins, isProd } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { productRouter } from './routes/product.routes.js';
import { contactRouter } from './routes/contact.routes.js';
import { uploadRouter } from './routes/upload.routes.js';
import { userRouter } from './routes/user.routes.js';
import { orderRouter } from './routes/order.routes.js';
import { analyticsRouter } from './routes/analytics.routes.js';
import { shopRouter } from './routes/shop.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { categoryRouter } from './routes/category.routes.js';
import { searchRouter } from './routes/search.routes.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { apiRateLimiter, authRateLimiter } from './middlewares/rateLimit.js';
export function createApp() {
    const app = express();
    app.disable('x-powered-by');
    app.set('trust proxy', 1);
    app.use(helmet());
    app.use(cors({
        origin(origin, cb) {
            // Allow non-browser requests without Origin header (health checks, server-to-server).
            if (!origin)
                return cb(null, true);
            if (allowedCorsOrigins.includes(origin))
                return cb(null, true);
            return cb(new Error('CORS origin blocked'));
        },
        credentials: false,
    }));
    app.use(express.json({ limit: '2mb' }));
    app.use(morgan(isProd ? 'combined' : 'dev'));
    app.get('/health', (_req, res) => res.json({ ok: true }));
    app.use('/api', apiRateLimiter);
    app.use('/api/auth', authRateLimiter, authRouter);
    app.use('/api/products', productRouter);
    app.use('/api/categories', categoryRouter);
    app.use('/api/search', searchRouter);
    app.use('/api/contact', contactRouter);
    app.use('/api/user', userRouter);
    app.use('/api/orders', orderRouter);
    app.use('/api/uploads', uploadRouter);
    app.use('/api/analytics', analyticsRouter);
    app.use('/api/shop', shopRouter);
    app.use('/api/admin', adminRouter);
    app.use(notFound);
    app.use(errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map