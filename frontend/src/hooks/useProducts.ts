import { useState, useEffect, useCallback } from 'react'
import { Product, ProductFilters, PaginatedResponse } from '../types'
import { productService } from '../services/productService'

export const useProducts = (initialFilters?: Partial<ProductFilters>) => {
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: 'All',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
    ...initialFilters,
  })

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await productService.getProducts({
        search: filters.search || undefined,
        category: filters.category !== 'All' ? filters.category : undefined,
        minPrice: filters.minPrice !== '' ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice !== '' ? Number(filters.maxPrice) : undefined,
        sortBy: filters.sortBy,
        page,
        limit: 8,
      })
      setData(result)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPage(1)
  }

  return { data, isLoading, error, filters, updateFilters, page, setPage, refetch: fetchProducts }
}

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(() => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    productService
      .getProduct(id)
      .then(setProduct)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load product'))
      .finally(() => setIsLoading(false))
  }, [id])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { product, isLoading, error, refetch }
}
