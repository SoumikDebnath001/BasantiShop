import { loginSchema, registerSchema } from '../validators/auth.schemas.js';
import { authService } from '../services/auth.service.js';
import { adminLogService, ADMIN_ACTIONS } from '../services/adminLog.service.js';
export const authController = {
    async register(req, res) {
        const payload = registerSchema.parse(req.body);
        const result = await authService.register({ ...payload, phone: payload.phone });
        res.json(result);
    },
    async login(req, res) {
        const payload = loginSchema.parse(req.body);
        const result = await authService.login(payload);
        if (result.user.role === 'admin') {
            await adminLogService.log(result.user.id, ADMIN_ACTIONS.ADMIN_LOGIN, {
                email: result.user.email,
            });
        }
        res.json(result);
    },
    async me(req, res) {
        const userId = req.user.id;
        const user = await authService.me(userId);
        res.json(user);
    },
};
//# sourceMappingURL=auth.controller.js.map