import axiosInstance from '../api/axios'
import { API_ENDPOINTS } from '../config/api'

export interface AdminContactMessage {
  id: string
  name: string
  phone: string
  email: string
  message: string
  response: string | null
  productName: string | null
  productId: string | null
  userId: string | null
  user: { id: string; name: string; email: string } | null
  createdAt: string
}

export const adminContactService = {
  async listAll(): Promise<AdminContactMessage[]> {
    const { data } = await axiosInstance.get<AdminContactMessage[]>(API_ENDPOINTS.CONTACT_ADMIN_MESSAGES)
    return Array.isArray(data) ? data : []
  },

  async saveResponse(messageId: string, response: string): Promise<{ id: string; response: string }> {
    const { data } = await axiosInstance.patch<{ id: string; response: string }>(
      API_ENDPOINTS.CONTACT_MESSAGE_RESPONSE(messageId),
      { response }
    )
    return data
  },
}
