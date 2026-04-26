import type { Request, Response, NextFunction } from 'express';
import { type JwtUser } from '../utils/jwt.js';
declare global {
    namespace Express {
        interface Request {
            user?: JwtUser;
        }
    }
}
export declare function auth(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map