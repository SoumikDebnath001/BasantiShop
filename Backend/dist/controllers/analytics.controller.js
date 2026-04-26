import { analyticsService } from '../services/analytics.service.js';
export const analyticsController = {
    async profitLoss(_req, res) {
        const data = await analyticsService.profitLoss();
        res.set('Cache-Control', 'private, max-age=10');
        res.json(data);
    },
};
//# sourceMappingURL=analytics.controller.js.map