export function requireAdmin(req, _res, next) {
    if (req.user?.role !== 'admin') {
        const err = new Error('Forbidden');
        err.status = 403;
        throw err;
    }
    next();
}
//# sourceMappingURL=requireAdmin.js.map