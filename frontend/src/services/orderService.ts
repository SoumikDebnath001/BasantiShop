import axiosInstance from '../api/axios'
import { API_ENDPOINTS } from '../config/api'
import type { CreateOrderPayload, DashboardOverview, Order, PatchOrderPayload } from '../types'

export const orderService = {
  async create(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await axiosInstance.post<Order>(API_ENDPOINTS.ORDERS, payload)
    return data
  },

  async getMyOrders(): Promise<Order[]> {
    const { data } = await axiosInstance.get<Order[]>(API_ENDPOINTS.MY_ORDERS)
    return data
  },

  async getOrdersForUser(userId: string): Promise<Order[]> {
    const { data } = await axiosInstance.get<Order[]>(API_ENDPOINTS.ORDERS_USER(userId))
    return data
  },

  async getOverview(): Promise<DashboardOverview> {
    const { data } = await axiosInstance.get<DashboardOverview>(API_ENDPOINTS.ORDERS_OVERVIEW)
    return data
  },

  /** Delivered orders in the last year (for invoices / delivered tab). */
  async getDeliveredHistory(): Promise<Order[]> {
    const { data } = await axiosInstance.get<Order[]>(API_ENDPOINTS.ORDERS_HISTORY)
    return data
  },

  async getAllOrders(): Promise<Order[]> {
    const { data } = await axiosInstance.get<Order[]>(API_ENDPOINTS.ORDERS)
    return data
  },

  async patchOrder(id: string, payload: PatchOrderPayload): Promise<Order> {
    const { data } = await axiosInstance.patch<Order>(API_ENDPOINTS.ORDER(id), payload)
    return data
  },

  // UNUSED - reserved for future use (admin UI uses patchOrder → PATCH /orders/:id)
  // async patchOrderStatus(id: string, payload: PatchOrderPayload): Promise<Order> {
  //   const { data } = await axiosInstance.patch<Order>(API_ENDPOINTS.ORDER_STATUS(id), payload)
  //   return data
  // },

  async deleteOrder(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.ORDER(id))
  },

  /** Download invoice PDF (owner only). */
  async downloadInvoice(orderId: string, filename = `invoice-${orderId}.pdf`): Promise<void> {
    const res = await axiosInstance.get(API_ENDPOINTS.ORDER_INVOICE(orderId), {
      responseType: 'blob',
    })
    const blob = new Blob([res.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  },

  async viewInvoiceInNewTab(orderId: string): Promise<void> {
    const res = await axiosInstance.get(API_ENDPOINTS.ORDER_INVOICE(orderId), {
      responseType: 'blob',
    })
    const blob = new Blob([res.data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener,noreferrer')
    setTimeout(() => URL.revokeObjectURL(url), 120_000)
  },
}
