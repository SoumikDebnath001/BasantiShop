import fs from 'node:fs';
import { createOrderSchema, patchOrderSchema } from '../validators/order.schemas.js';
import { orderService } from '../services/order.service.js';
import { adminLogService, ADMIN_ACTIONS } from '../services/adminLog.service.js';
import { resolveInvoiceAbsolutePath } from '../services/invoice.service.js';
export const orderController = {
    async create(req, res) {
        const body = createOrderSchema.parse(req.body);
        const userId = req.user.id;
        const order = await orderService.create(userId, body.phoneNumber, body.items);
        res.status(201).json(order);
    },
    async my(req, res) {
        const userId = req.user.id;
        const orders = await orderService.listMine(userId);
        res.set('Cache-Control', 'private, no-store');
        res.json(orders);
    },
    async myOverview(req, res) {
        const userId = req.user.id;
        const overview = await orderService.getMyOverview(userId);
        res.set('Cache-Control', 'private, no-store');
        res.json(overview);
    },
    async historyDeliveredLastYear(req, res) {
        const userId = req.user.id;
        const orders = await orderService.listDeliveredLastYear(userId);
        res.set('Cache-Control', 'private, no-store');
        res.json(orders);
    },
    async listForUser(req, res) {
        const targetUserId = String(req.params.userId);
        const orders = await orderService.listForUser(targetUserId, req.user.id, req.user.role);
        res.set('Cache-Control', 'private, no-store');
        res.json(orders);
    },
    async downloadInvoice(req, res) {
        const orderId = String(req.params.id);
        const userId = req.user.id;
        const order = await orderService.findRawForInvoice(orderId);
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        if (order.userId !== userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        if (order.status !== 'DELIVERED' || !order.invoiceUrl) {
            res.status(404).json({ error: 'Invoice not available' });
            return;
        }
        let abs;
        try {
            abs = resolveInvoiceAbsolutePath(order.invoiceUrl);
        }
        catch {
            res.status(400).json({ error: 'Invalid invoice' });
            return;
        }
        if (!fs.existsSync(abs)) {
            res.status(404).json({ error: 'Invoice file missing' });
            return;
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${orderId}.pdf"`);
        fs.createReadStream(abs).pipe(res);
    },
    async listAll(_req, res) {
        const orders = await orderService.listAll();
        res.json(orders);
    },
    async updateStatus(req, res) {
        const body = patchOrderSchema.parse(req.body);
        const id = String(req.params.id);
        const adminId = req.user.id;
        let order;
        switch (body.status) {
            case 'CONFIRMED':
                order = await orderService.confirm(id, body.finalTotalAmount);
                await adminLogService.log(adminId, ADMIN_ACTIONS.CONFIRM_ORDER, {
                    orderId: id,
                    finalTotalAmount: body.finalTotalAmount,
                });
                break;
            case 'PENDING':
                order = await orderService.unconfirm(id);
                await adminLogService.log(adminId, ADMIN_ACTIONS.UNCONFIRM_ORDER, { orderId: id });
                break;
            case 'DELIVERED':
                order = await orderService.markDelivered(id);
                await adminLogService.log(adminId, ADMIN_ACTIONS.DELIVER_ORDER, { orderId: id });
                break;
            case 'RETURNED':
                order = await orderService.markReturned(id);
                await adminLogService.log(adminId, ADMIN_ACTIONS.RETURN_ORDER, { orderId: id });
                break;
            case 'CANCELLED':
                order = await orderService.markCancelledFromDelivered(id);
                await adminLogService.log(adminId, ADMIN_ACTIONS.CANCEL_ORDER, { orderId: id });
                break;
            default:
                res.status(400).json({ error: 'Unsupported status' });
                return;
        }
        res.json(order);
    },
    async remove(req, res) {
        const id = String(req.params.id);
        await orderService.deletePending(id);
        await adminLogService.log(req.user.id, ADMIN_ACTIONS.DELETE_ORDER, { orderId: id });
        res.status(204).end();
    },
};
//# sourceMappingURL=order.controller.js.map