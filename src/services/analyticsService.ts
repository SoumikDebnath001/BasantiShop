import axiosInstance from '../api/axios'
import { API_ENDPOINTS } from '../config/api'
import type { ProfitLossResponse } from '../types'

export const analyticsService = {
  async getProfitLoss(): Promise<ProfitLossResponse> {
    const { data } = await axiosInstance.get<ProfitLossResponse>(API_ENDPOINTS.ANALYTICS_PROFIT)
    return data
  },
}
