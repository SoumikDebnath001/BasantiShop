import { verifyAccessToken } from '../utils/jwt.js';
export function auth(req, _res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        const err = new Error('Unauthorized');
        err.status = 401;
        throw err;
    }
    const token = header.slice('Bearer '.length).trim();
    try {
        req.user = verifyAccessToken(token);
        next();
    }
    catch {
        const err = new Error('Unauthorized');
        err.status = 401;
        throw err;
    }
}
//# sourceMappingURL=auth.js.map