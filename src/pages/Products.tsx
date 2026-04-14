import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import Seo from '../components/Seo'
import SearchBar from '../components/SearchBar'
import FilterSidebar from '../components/FilterSidebar'
import ProductGrid from '../components/ProductGrid'
import Pagination from '../components/Pagination'
import { useProducts } from '../hooks/useProducts'

export default function Products() {
  const { data, isLoading, error, filters, updateFilters, page, setPage } = useProducts()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Seo
        title="All products"
        description="Filter and explore our full catalog with live stock and clear pricing."
      />
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-charcoal">All Products</h1>
          {data && (
            <p className="text-muted text-sm mt-1">
              {data.total} product{data.total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-charcoal hover:bg-gray-100 transition-colors lg:hidden"
        >
          <SlidersHorizontal size={15} />
          Filters
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block w-52 shrink-0">
          <FilterSidebar filters={filters} onChange={updateFilters} />
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <SearchBar
              value={filters.search}
              onChange={(v) => updateFilters({ search: v })}
              className="max-w-md"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          <ProductGrid products={data?.data || []} isLoading={isLoading} />

          {data && (
            <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
          )}
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-charcoal/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative ml-auto w-72 bg-white h-full overflow-auto p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-charcoal">Filters</h3>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={18} className="text-muted" />
              </button>
            </div>
            <FilterSidebar filters={filters} onChange={updateFilters} />
          </div>
        </div>
      )}
    </div>
  )
}
