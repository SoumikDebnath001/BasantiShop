import { ProductFilters } from '../types'

interface FilterSidebarProps {
  filters: ProductFilters
  onChange: (filters: Partial<ProductFilters>) => void
  categories: string[]
  categoriesLoading?: boolean
  categoriesError?: string | null
}

export default function FilterSidebar({
  filters,
  onChange,
  categories,
  categoriesLoading,
  categoriesError,
}: FilterSidebarProps) {
  return (
    <aside className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Category</h3>
        {categoriesError && (
          <p className="text-xs text-red-600 mb-2">{categoriesError}</p>
        )}
        {categoriesLoading ? (
          <p className="text-sm text-muted">Loading categories…</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted">No categories yet. Ask an admin to add categories.</p>
        ) : (
          <div className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onChange({ category: cat })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  filters.category === cat
                    ? 'bg-charcoal text-white font-medium'
                    : 'text-charcoal hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Price Range</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : '' })}
            className="w-full px-3 py-2 border border-border rounded-xl text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : '' })}
            className="w-full px-3 py-2 border border-border rounded-xl text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
          />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Sort By</h3>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ sortBy: e.target.value as ProductFilters['sortBy'] })}
          className="w-full px-3 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all bg-white"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      <button
        type="button"
        onClick={() => onChange({ category: '', minPrice: '', maxPrice: '', sortBy: 'newest', search: '' })}
        className="w-full text-sm text-muted hover:text-charcoal underline underline-offset-2 transition-colors"
      >
        Clear filters
      </button>
    </aside>
  )
}
