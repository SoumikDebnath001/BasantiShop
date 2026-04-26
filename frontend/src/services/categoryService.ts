import axiosInstance from '../api/axios'
import { API_ENDPOINTS } from '../config/api'
import type { CategoryDTO } from '../types'

export const categoryService = {
  async list(): Promise<CategoryDTO[]> {
    const { data } = await axiosInstance.get<CategoryDTO[]>(API_ENDPOINTS.CATEGORIES)
    return Array.isArray(data) ? data : []
  },

  async create(name: string): Promise<CategoryDTO> {
    const { data } = await axiosInstance.post<CategoryDTO>(API_ENDPOINTS.CATEGORIES, { name })
    return data
  },
}
