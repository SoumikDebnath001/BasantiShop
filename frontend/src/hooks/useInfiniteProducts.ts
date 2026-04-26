import { useState, useEffect, useCallback, useRef } from 'react'
import type { Product, ProductFilters } from '../types'
import { productService } from '../services/productService'

const PAGE_LIMIT = 8

type Params = {
  enabled: boolean
  filters: Pick<ProductFilters, 'search' | 'category' | 'minPrice' | 'maxPrice' | 'sortBy'>
}

export function useInfiniteProducts({ enabled, filters }: Params) {
  const [items, setItems] = useState<Product[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const pageRef = useRef(0)
  const totalPagesRef = useRef(0)
  const reqId = useRef(0)

  const buildParams = (page: number) => ({
    search: filters.search.trim() || undefined,
    category: filters.category || undefined,
    minPrice: filters.minPrice !== '' ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice !== '' ? Number(filters.maxPrice) : undefined,
    sortBy: filters.sortBy,
    page,
    limit: PAGE_LIMIT,
  })

  useEffect(() => {
    if (!enabled) {
      setItems([])
      setError(null)
      setHasMore(false)
      setTotal(0)
      pageRef.current = 0
      totalPagesRef.current = 0
      return
    }

    const id = ++reqId.current
    setIsInitialLoading(true)
    setError(null)

    productService
      .getProducts(buildParams(1))
      .then((res) => {
        if (reqId.current !== id) return
        setItems(res.data)
        setTotal(res.total)
        pageRef.current = 1
        totalPagesRef.current = res.totalPages
        setHasMore(1 < res.totalPages)
      })
      .catch((err: unknown) => {
        if (reqId.current !== id) return
        setError(err instanceof Error ? err.message : 'Failed to load products')
        setItems([])
        setHasMore(false)
        setTotal(0)
      })
      .finally(() => {
        if (reqId.current !== id) return
        setIsInitialLoading(false)
      })
  }, [
    enabled,
    filters.search,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.sortBy,
  ])

  const loadMore = useCallback(async () => {
    if (!enabled || isLoadingMore || isInitialLoading) return
    const next = pageRef.current + 1
    if (next > totalPagesRef.current) return

    setIsLoadingMore(true)
    setError(null)
    try {
      const res = await productService.getProducts(buildParams(next))
      setItems((prev) => [...prev, ...res.data])
      pageRef.current = next
      setHasMore(next < totalPagesRef.current)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load more')
    } finally {
      setIsLoadingMore(false)
    }
  }, [
    enabled,
    isLoadingMore,
    isInitialLoading,
    filters.search,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.sortBy,
  ])

  return {
    items,
    total,
    isInitialLoading,
    isLoadingMore,
    error,
    loadMore,
    hasMore,
  }
}
