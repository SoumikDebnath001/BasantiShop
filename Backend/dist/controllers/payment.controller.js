import { z } from 'zod';
import { paymentService } from '../services/payment.service.js';
const createOrderSchema = z.object({
    phoneNumber: z.string().min(5).max(20),
    items: z.array(z.object({ productId: z.string().cuid(), quantity: z.number().int().min(1) })).min(1),
});
const verifySchema = z.object({
    orderId: z.string().cuid(),
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
});
export const paymentController = {
    async getConfig(_req, res) {
        const config = paymentService.getConfig();
        res.json(config);
    },
    async createOrder(req, res) {
        const { phoneNumber, items } = createOrderSchema.parse(req.body);
        const result = await paymentService.createOrder(req.user.id, phoneNumber, items);
        res.status(201).json(result);
    },
    async verifyPayment(req, res) {
        const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = verifySchema.parse(req.body);
        const result = await paymentService.verifyPayment({
            orderId,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            userId: req.user.id,
        });
        res.json(result);
    },
};
//# sourceMappingURL=payment.controller.js.map