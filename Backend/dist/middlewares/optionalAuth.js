import { verifyAccessToken } from '../utils/jwt.js';
export function optionalAuth(req, _res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return next();
    }
    const token = header.slice('Bearer '.length).trim();
    try {
        req.user = verifyAccessToken(token);
    }
    catch {
        // invalid token: proceed without user
    }
    next();
}
//# sourceMappingURL=optionalAuth.js.map