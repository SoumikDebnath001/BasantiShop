import axiosInstance from '../api/axios'
import { API_ENDPOINTS } from '../config/api'
import type { SearchSuggestions } from '../types'

export const searchService = {
  async search(q: string): Promise<SearchSuggestions> {
    const { data } = await axiosInstance.get<SearchSuggestions>(API_ENDPOINTS.SEARCH, {
      params: { q },
    })
    return {
      categories: Array.isArray(data?.categories) ? data.categories : [],
      products: Array.isArray(data?.products) ? data.products : [],
    }
  },
}
