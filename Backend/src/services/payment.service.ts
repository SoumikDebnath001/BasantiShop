import crypto from 'crypto'
import Razorpay from 'razorpay'
import { prisma } from '../config/prisma.js'
import { env } from '../config/env.js'
import { Prisma } from '@prisma/client'

function makeError(msg: string, status: number): Error {
  const e = new Error(msg)
  ;(e as any).status = status
  return e
}

function getRazorpay(): Razorpay {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw makeError('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.', 503)
  }
  return new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET })
}

export const paymentService = {
  // ── Step 1: validate cart → create DB order + Razorpay order ──
  async createOrder(
    userId: string,
    phoneNumber: string,
    lines: { productId: string; quantity: number }[]
  ) {
    const rzp = getRazorpay()

    // Deduplicate lines
    const merged = new Map<string, number>()
    for (const l of lines) merged.set(l.productId, (merged.get(l.productId) ?? 0) + l.quantity)
    const dedupedLines = [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity }))

    // Validate products & stock
    const ids = dedupedLines.map((l) => l.productId)
    const products = await prisma.product.findMany({ where: { id: { in: ids } } })
    if (products.length !== ids.length) throw makeError('One or more products are invalid', 400)

    let total = 0
    const orderLines: {
      productId: string
      name: string
      price: Prisma.Decimal
      quantity: number
      costPerUnit: Prisma.Decimal
    }[] = []

    for (const l of dedupedLines) {
      const p = products.find((x) => x.id === l.productId)!
      if (l.quantity > p.stock) throw makeError(`Insufficient stock for "${p.name}"`, 400)
      total += Number(p.sellingPrice) * l.quantity
      orderLines.push({
        productId: p.id,
        name: p.name,
        price: p.sellingPrice,
        quantity: l.quantity,
        costPerUnit: p.originalPrice,
      })
    }

    // Create Razorpay order (amount in paise)
    const rzpOrder = await rzp.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: `bzs_${Date.now()}`,
    })

    // Create DB order (PENDING, paymentStatus=UNPAID)
    const order = await prisma.order.create({
      data: {
        userId,
        phoneNumber,
        totalAmount: new Prisma.Decimal(total.toFixed(2)),
        status: 'PENDING',
        paymentMethod: 'ONLINE',
        paymentStatus: 'UNPAID',
        razorpayOrderId: rzpOrder.id,
        items: { create: orderLines },
      },
    })

    return {
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount as number, // paise
      currency: rzpOrder.currency as string,
      keyId: env.RAZORPAY_KEY_ID,
    }
  },

  // ── Step 2: verify signature → mark order PAID ─────────────────
  async verifyPayment(payload: {
    orderId: string
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
    userId: string
  }) {
    const order = await prisma.order.findUnique({ where: { id: payload.orderId } })
    if (!order) throw makeError('Order not found', 404)
    if (order.userId !== payload.userId) throw makeError('Forbidden', 403)
    if (order.paymentStatus === 'PAID') throw makeError('Order is already paid', 409)
    if (order.razorpayOrderId !== payload.razorpayOrderId) throw makeError('Order ID mismatch', 400)

    // HMAC-SHA256 signature verification — key_secret NEVER leaves server
    const body = `${payload.razorpayOrderId}|${payload.razorpayPaymentId}`
    const expected = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(payload.razorpaySignature))) {
      await prisma.order.update({ where: { id: payload.orderId }, data: { paymentStatus: 'FAILED' } })
      throw makeError('Payment signature verification failed. Contact support.', 400)
    }

    await prisma.order.update({
      where: { id: payload.orderId },
      data: { paymentStatus: 'PAID', razorpayPaymentId: payload.razorpayPaymentId },
    })

    return { success: true, orderId: payload.orderId }
  },

  // ── Get Razorpay key_id (public — safe to expose) ──────────────
  getConfig() {
    if (!env.RAZORPAY_KEY_ID) throw makeError('Razorpay not configured', 503)
    return { keyId: env.RAZORPAY_KEY_ID }
  },
}
