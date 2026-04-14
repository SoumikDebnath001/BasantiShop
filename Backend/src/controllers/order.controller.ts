import type { Request, Response } from 'express'
import { createOrderSchema, patchOrderSchema } from '../validators/order.schemas.js'
import { orderService } from '../services/order.service.js'
import { adminLogService, ADMIN_ACTIONS } from '../services/adminLog.service.js'

export const orderController = {
  async create(req: Request, res: Response) {
    const body = createOrderSchema.parse(req.body)
    const userId = req.user!.id
    const order = await orderService.create(userId, body.phoneNumber, body.items)
    res.status(201).json(order)
  },

  async my(req: Request, res: Response) {
    const userId = req.user!.id
    const orders = await orderService.listMine(userId)
    res.json(orders)
  },

  async listAll(_req: Request, res: Response) {
    const orders = await orderService.listAll()
    res.json(orders)
  },

  async updateStatus(req: Request, res: Response) {
    const body = patchOrderSchema.parse(req.body)
    const id = String(req.params.id)
    const adminId = req.user!.id

    let order
    switch (body.status) {
      case 'CONFIRMED':
        order = await orderService.confirm(id, body.finalTotalAmount)
        await adminLogService.log(adminId, ADMIN_ACTIONS.CONFIRM_ORDER, {
          orderId: id,
          finalTotalAmount: body.finalTotalAmount,
        })
        break
      case 'PENDING':
        order = await orderService.unconfirm(id)
        await adminLogService.log(adminId, ADMIN_ACTIONS.UNCONFIRM_ORDER, { orderId: id })
        break
      case 'DELIVERED':
        order = await orderService.markDelivered(id)
        await adminLogService.log(adminId, ADMIN_ACTIONS.DELIVER_ORDER, { orderId: id })
        break
      case 'RETURNED':
        order = await orderService.markReturned(id)
        await adminLogService.log(adminId, ADMIN_ACTIONS.RETURN_ORDER, { orderId: id })
        break
      case 'CANCELLED':
        order = await orderService.markCancelledFromDelivered(id)
        await adminLogService.log(adminId, ADMIN_ACTIONS.CANCEL_ORDER, { orderId: id })
        break
      default:
        res.status(400).json({ error: 'Unsupported status' })
        return
    }
    res.json(order)
  },

  async remove(req: Request, res: Response) {
    const id = String(req.params.id)
    await orderService.deletePending(id)
    await adminLogService.log(req.user!.id, ADMIN_ACTIONS.DELETE_ORDER, { orderId: id })
    res.status(204).end()
  },
}
