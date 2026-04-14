import axiosInstance from '../api/axios'
import { API_ENDPOINTS } from '../config/api'
import { Product, ProductFormData, PaginatedResponse } from '../types'

const normalizePaginatedProducts = (payload: unknown, fallbackLimit = 100): PaginatedResponse<Product> => {
  if (Array.isArray(payload)) {
    return {
      data: payload as Product[],
      total: payload.length,
      page: 1,
      limit: fallbackLimit,
      totalPages: 1,
    }
  }
  if (payload && typeof payload === 'object' && Array.isArray((payload as PaginatedResponse<Product>).data)) {
    return payload as PaginatedResponse<Product>
  }
  return {
    data: [],
    total: 0,
    page: 1,
    limit: fallbackLimit,
    totalPages: 0,
  }
}

export const productService = {
  async getProductsAdmin(params?: {
    search?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Product>> {
    const { data } = await axiosInstance.get<PaginatedResponse<Product> | Product[]>(API_ENDPOINTS.PRODUCTS_ADMIN, {
      params: { ...params, limit: Math.min(params?.limit ?? 100, 100) },
    })
    return normalizePaginatedProducts(data, Math.min(params?.limit ?? 100, 100))
  },

  async getProducts(params?: {
    search?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Product>> {
    const { data } = await axiosInstance.get<PaginatedResponse<Product> | Product[]>(API_ENDPOINTS.PRODUCTS, {
      params,
    })
    return normalizePaginatedProducts(data, params?.limit ?? 8)
  },

  async getProduct(idOrSlug: string): Promise<Product> {
    const { data } = await axiosInstance.get<Product>(API_ENDPOINTS.PRODUCT(idOrSlug))
    return data
  },

  async getProductAdmin(id: string): Promise<Product> {
    const { data } = await axiosInstance.get<Product>(API_ENDPOINTS.PRODUCT_ADMIN(id))
    return data
  },

  async createProduct(payload: ProductFormData): Promise<Product> {
    const { data } = await axiosInstance.post<Product>(API_ENDPOINTS.PRODUCTS, payload)
    return data
  },

  async updateProduct(id: string, payload: Partial<ProductFormData>): Promise<Product> {
    const { data } = await axiosInstance.put<Product>(API_ENDPOINTS.PRODUCT(id), payload)
    return data
  },

  async deleteProduct(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.PRODUCT(id))
  },

  async rateProduct(productId: string, rating: number): Promise<Product> {
    const { data } = await axiosInstance.post<Product>(API_ENDPOINTS.PRODUCT_RATE(productId), { rating })
    return data
  },
}
