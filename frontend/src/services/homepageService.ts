import axiosInstance from '../api/axios'
import { API_ENDPOINTS } from '../config/api'
import type { HomepageContent } from '../types'

export const homepageService = {
  async get(): Promise<HomepageContent> {
    const { data } = await axiosInstance.get<HomepageContent>(API_ENDPOINTS.HOMEPAGE)
    return data
  },

  async update(payload: Partial<HomepageContent>): Promise<HomepageContent> {
    const { data } = await axiosInstance.put<HomepageContent>(API_ENDPOINTS.HOMEPAGE, payload)
    return data
  },
}
