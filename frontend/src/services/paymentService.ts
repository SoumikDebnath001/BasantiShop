import axiosInstance from '../api/axios'
import { API_ENDPOINTS } from '../config/api'

export interface RazorpayOrderResponse {
  orderId: string
  razorpayOrderId: string
  amount: number   // paise
  currency: string
  keyId: string
}

export const paymentService = {
  async getConfig(): Promise<{ keyId: string }> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.PAYMENT_CONFIG)
    return data
  },

  async createOrder(payload: {
    phoneNumber: string
    items: { productId: string; quantity: number }[]
  }): Promise<RazorpayOrderResponse> {
    const { data } = await axiosInstance.post<RazorpayOrderResponse>(
      API_ENDPOINTS.PAYMENT_CREATE_ORDER,
      payload
    )
    return data
  },

  async verifyPayment(payload: {
    orderId: string
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
  }): Promise<{ success: boolean; orderId: string }> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.PAYMENT_VERIFY, payload)
    return data
  },
}
