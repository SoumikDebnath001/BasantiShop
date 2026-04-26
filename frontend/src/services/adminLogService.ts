import axiosInstance from '../api/axios'
import { API_ENDPOINTS } from '../config/api'
import type { AdminLogEntry } from '../types'

export const adminLogService = {
  async list(limit = 100): Promise<AdminLogEntry[]> {
    const { data } = await axiosInstance.get<AdminLogEntry[]>(API_ENDPOINTS.ADMIN_LOGS, {
      params: { limit },
    })
    return data
  },
}
