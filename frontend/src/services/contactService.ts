import axiosInstance from '../api/axios'
import { API_ENDPOINTS } from '../config/api'
import type { ContactHistoryItem, ContactPayload } from '../types'

export const contactService = {
  async sendContact(payload: ContactPayload): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.CONTACT, payload)
  },

  async getHistoryByUser(userId: string): Promise<ContactHistoryItem[]> {
    const { data } = await axiosInstance.get<ContactHistoryItem[]>(API_ENDPOINTS.CONTACT_HISTORY(userId))
    return Array.isArray(data) ? data : []
  },
}
