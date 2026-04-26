import axiosInstance from '../api/axios'
import { API_ENDPOINTS } from '../config/api'
import type { ShopReview, ShopSummary } from '../types'

const normalizeSummary = (payload: unknown): ShopSummary => {
  if (payload && typeof payload === 'object') {
    const maybe = payload as Partial<ShopSummary>
    return {
      averageRating: typeof maybe.averageRating === 'number' ? maybe.averageRating : 0,
      reviewCount: typeof maybe.reviewCount === 'number' ? maybe.reviewCount : 0,
    }
  }
  return { averageRating: 0, reviewCount: 0 }
}

const normalizeReviews = (payload: unknown): ShopReview[] => {
  if (Array.isArray(payload)) return payload as ShopReview[]
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: ShopReview[] }).data)) {
    return (payload as { data: ShopReview[] }).data
  }
  return []
}

export const shopReviewService = {
  async getSummary(): Promise<ShopSummary> {
    const { data } = await axiosInstance.get<ShopSummary>(API_ENDPOINTS.SHOP_SUMMARY)
    return normalizeSummary(data)
  },

  async submitReview(rating: number, message: string): Promise<ShopReview> {
    const { data } = await axiosInstance.post<ShopReview | { data: ShopReview }>(API_ENDPOINTS.SHOP_REVIEWS, {
      rating,
      message,
    })
    if (data && typeof data === 'object' && 'data' in data && data.data) {
      return data.data
    }
    return data as ShopReview
  },

  async listAllAdmin(): Promise<ShopReview[]> {
    const { data } = await axiosInstance.get<ShopReview[] | { data: ShopReview[] }>(API_ENDPOINTS.SHOP_REVIEWS)
    return normalizeReviews(data)
  },

  async listPublic(): Promise<ShopReview[]> {
    const { data } = await axiosInstance.get<ShopReview[]>(API_ENDPOINTS.SHOP_REVIEWS_PUBLIC)
    return normalizeReviews(data)
  },
}
