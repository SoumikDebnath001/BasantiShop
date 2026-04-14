import axiosInstance from '../api/axios'
import { API_ENDPOINTS } from '../config/api'
import type { CreateOrderPayload, Order, PatchOrderPayload } from '../types'

export const orderService = {
  async create(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await axiosInstance.post<Order>(API_ENDPOINTS.ORDERS, payload)
    return data
  },

  async getMyOrders(): Promise<Order[]> {
    const { data } = await axiosInstance.get<Order[]>(API_ENDPOINTS.MY_ORDERS)
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

  async deleteOrder(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.ORDER(id))
  },
}
