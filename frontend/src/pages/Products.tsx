import { useState, useEffect, useRef, useCallback } from 'react'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import Seo from '../components/Seo'
import FilterSidebar from '../components/FilterSidebar'
import ProductGrid from '../components/ProductGrid'
import NavbarSearch from '../components/NavbarSearch'
import { useInfiniteProducts } from '../hooks/useInfiniteProducts'
import type { ProductFilters } from '../types'
import { categoryService } from '../services/categoryService'
import { SHOP_NAME } from '../constants/brand'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)
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
      .then((rows) => { if (!cancelled) setCategoryNames(rows.map((r) => r.name)) })
      .catch(() => { if (!cancelled) { setCategoriesError('Could not load categories'); setCategoryNames([]) } })
      .finally(() => { if (!cancelled) setCategoriesLoading(false) })
    return () => { cancelled = true }
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
  const { items, total, isInitialLoading, isLoadingMore, error, loadMore, hasMore } = useInfiniteProducts({ enabled: shouldFetch, filters })
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!shouldFetch || !hasMore) return
    const el = sentinelRef.current
    if (!el) return
    const ob = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) void loadMore() },
      { root: null, rootMargin: '300px', threshold: 0 }
    )
    ob.observe(el)
    return () => ob.disconnect()
  }, [shouldFetch, hasMore, loadMore, items.length])

  const sortOptions: { value: ProductFilters['sortBy']; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price ↑' },
    { value: 'price-desc', label: 'Price ↓' },
    { value: 'name', label: 'A–Z' },
  ]

  return (
    <div className="animate-fade-in">
      <Seo title="Shop products" description={`Browse ${SHOP_NAME} catalog by category or search.`} />

      {/* ── Sticky top search + filter bar ── */}
      <div className="sticky top-14 md:top-[5.5rem] z-30 bg-cream/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2">
          {/* Search - hidden on mobile (navbar has it), shown on desktop */}
          <div className="flex-1 hidden md:block">
            <NavbarSearch />
          </div>

          {/* Mobile: show active filter/category info + count */}
          <div className="flex-1 md:hidden">
            {filters.category ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-charcoal">{filters.category}</span>
                {shouldFetch && !isInitialLoading && (
                  <span className="text-xs text-muted">— {total} product{total !== 1 ? 's' : ''}</span>
                )}
                <button
                  type="button"
                  onClick={() => updateFilters({ category: '' })}
                  className="ml-auto p-1 rounded-lg text-muted hover:text-charcoal"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <span className="text-sm text-muted">
                {shouldFetch && !isInitialLoading ? `${total} product${total !== 1 ? 's' : ''}` : 'Search or pick a filter'}
              </span>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value as ProductFilters['sortBy'] })}
              className="appearance-none pl-3 pr-8 py-2.5 border border-border rounded-xl text-sm bg-white text-charcoal focus:outline-none focus:border-accent cursor-pointer"
              aria-label="Sort by"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>

          {/* Filter button */}
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border rounded-xl text-sm font-medium transition-colors shrink-0 ${
              (filters.category || filters.minPrice || filters.maxPrice)
                ? 'border-accent bg-accent/5 text-accent'
                : 'border-border bg-white text-charcoal hover:border-charcoal/30'
            }`}
          >
            <SlidersHorizontal size={15} />
            <span className="hidden sm:inline">Filters</span>
            {(filters.category || filters.minPrice || filters.maxPrice) && (
              <span className="w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {[filters.category, filters.minPrice, filters.maxPrice].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6">

        {/* Desktop: sidebar + grid */}
        <div className="flex gap-8">
          <aside className="hidden lg:block w-52 shrink-0 mt-1">
            <FilterSidebar
              filters={filters}
              onChange={updateFilters}
              categories={categoryNames}
              categoriesLoading={categoriesLoading}
              categoriesError={categoriesError}
            />
          </aside>

          <div className="flex-1 min-w-0">
            {/* Desktop result count */}
            {shouldFetch && !isInitialLoading && (
              <p className="text-sm text-muted mb-4 hidden lg:block">
                {total} product{total !== 1 ? 's' : ''}
                {filters.category && <> in <span className="font-medium text-charcoal">{filters.category}</span></>}
              </p>
            )}

            {/* Prompt when nothing selected */}
            {!shouldFetch && (
              <div className="bg-white border border-border border-dashed rounded-2xl p-10 text-center">
                <SlidersHorizontal size={24} className="text-muted mx-auto mb-3" />
                <p className="text-charcoal font-semibold mb-1">Choose how to browse</p>
                <p className="text-muted text-sm max-w-xs mx-auto">
                  Select a category or search above to see products.
                </p>
              </div>
            )}

            {error && shouldFetch && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm mb-5">
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
      </div>

      {/* ── Filter bottom sheet (mobile + tablet) ── */}
      {filterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm border-0 cursor-default"
            aria-label="Close filters"
            onClick={() => setFilterOpen(false)}
          />
          <div className="relative w-full bg-white rounded-t-3xl shadow-sheet animate-sheet-up max-h-[80vh] overflow-y-auto">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 pb-4 border-b border-border">
              <h3 className="font-semibold text-charcoal text-lg">Filters</h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { updateFilters({ category: '', minPrice: '', maxPrice: '', sortBy: 'newest', search: '' }); setFilterOpen(false) }}
                  className="text-sm text-accent font-medium"
                >
                  Clear all
                </button>
                <button type="button" onClick={() => setFilterOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100 text-muted">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-5 pb-8">
              <FilterSidebar
                filters={filters}
                onChange={(p) => { updateFilters(p); if (p.category !== undefined) setFilterOpen(false) }}
                categories={categoryNames}
                categoriesLoading={categoriesLoading}
                categoriesError={categoriesError}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
