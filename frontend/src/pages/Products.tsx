import { useState, useEffect, useRef, useCallback } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import Seo from '../components/Seo'
import SearchBar from '../components/SearchBar'
import FilterSidebar from '../components/FilterSidebar'
import ProductGrid from '../components/ProductGrid'
import { useInfiniteProducts } from '../hooks/useInfiniteProducts'
import type { ProductFilters } from '../types'
import { categoryService } from '../services/categoryService'
import { SHOP_NAME } from '../constants/brand'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [categoryNames, setCategoryNames] = useState<string[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  const [filters, setFilters] = useState<ProductFilters>(() => ({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
  }))

  useEffect(() => {
    const cat = searchParams.get('category') || ''
    const q = searchParams.get('q') || ''
    setFilters((prev) => {
      if (prev.category === cat && prev.search === q) return prev
      return { ...prev, category: cat, search: q }
    })
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    setCategoriesLoading(true)
    setCategoriesError(null)
    categoryService
      .list()
      .then((rows) => {
        if (!cancelled) setCategoryNames(rows.map((r) => r.name))
      })
      .catch(() => {
        if (!cancelled) {
          setCategoriesError('Could not load categories')
          setCategoryNames([])
        }
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const updateFilters = useCallback(
    (patch: Partial<ProductFilters>) => {
      setFilters((prev) => {
        const next = { ...prev, ...patch }
        const p = new URLSearchParams()
        if (next.category) p.set('category', next.category)
        if (next.search.trim()) p.set('q', next.search.trim())
        setSearchParams(p, { replace: true })
        return next
      })
    },
    [setSearchParams]
  )

  const shouldFetch = !!(filters.category || filters.search.trim())

  const { items, total, isInitialLoading, isLoadingMore, error, loadMore, hasMore } = useInfiniteProducts({
    enabled: shouldFetch,
    filters,
  })

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!shouldFetch || !hasMore) return
    const el = sentinelRef.current
    if (!el) return
    const ob = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore()
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    )
    ob.observe(el)
    return () => ob.disconnect()
  }, [shouldFetch, hasMore, loadMore, items.length])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Seo
        title="Shop products"
        description={`Browse ${SHOP_NAME} catalog by category or search.`}
      />
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-charcoal tracking-tight">Products</h1>
          {shouldFetch && (
            <p className="text-muted text-sm mt-1">
              {isInitialLoading ? 'Loading…' : `${total} product${total !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-charcoal hover:bg-white transition-colors lg:hidden shrink-0"
        >
          <SlidersHorizontal size={15} />
          Filters
        </button>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-56 shrink-0">
          <FilterSidebar
            filters={filters}
            onChange={updateFilters}
            categories={categoryNames}
            categoriesLoading={categoriesLoading}
            categoriesError={categoriesError}
          />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <SearchBar
              value={filters.search}
              onChange={(v) => updateFilters({ search: v })}
              placeholder="Search in this view…"
              className="max-w-md"
            />
          </div>

          {!shouldFetch && (
            <div className="bg-white border border-border rounded-2xl p-8 text-center shadow-sm">
              <p className="text-charcoal font-medium mb-2">Choose how you want to shop</p>
              <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
                Select a category from the sidebar, or type in the search box. Products appear only after you pick a
                category or enter a search.
              </p>
            </div>
          )}

          {error && shouldFetch && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          {shouldFetch && (
            <>
              <ProductGrid
                products={items}
                isLoading={isInitialLoading}
                loadingMore={isLoadingMore}
                emptyMessage="No products match these filters. Try another category or search."
              />
              <div ref={sentinelRef} className="h-4 w-full" aria-hidden />
            </>
          )}
        </div>
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/40 border-0 cursor-default"
            aria-label="Close filters"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative ml-auto w-72 bg-white h-full overflow-auto p-6 animate-slide-up shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-charcoal">Filters</h3>
              <button type="button" onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-muted" />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              onChange={(p) => {
                updateFilters(p)
              }}
              categories={categoryNames}
              categoriesLoading={categoriesLoading}
              categoriesError={categoriesError}
            />
          </div>
        </div>
      )}
    </div>
  )
}
