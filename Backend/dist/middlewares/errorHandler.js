import { ZodError } from 'zod';
export function errorHandler(err, _req, res, _next) {
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: 'Validation error',
            details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        });
    }
    const status = typeof err?.status === 'number' ? err.status : 500;
    const message = status === 500 ? 'Internal Server Error' : err?.message || 'Error';
    if (status === 204)
        return res.status(204).end();
    res.status(status).json({ error: message });
}
//# sourceMappingURL=errorHandler.js.map