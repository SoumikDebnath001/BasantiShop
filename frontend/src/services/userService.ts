import axiosInstance from '../api/axios'
import { API_ENDPOINTS } from '../config/api'
import type { ContactHistoryItem, User } from '../types'

export const userService = {
  async updateProfile(payload: { name: string; phone?: string }): Promise<User> {
    const { data } = await axiosInstance.patch<User>(API_ENDPOINTS.PROFILE, payload)
    return data
  },

  async getContacts(): Promise<{ data: ContactHistoryItem[] }> {
    const { data } = await axiosInstance.get<{ data: ContactHistoryItem[] }>(API_ENDPOINTS.CONTACTS)
    return data
  },
}
