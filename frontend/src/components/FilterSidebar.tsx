import { ProductFilters } from '../types'
import { CATEGORIES } from '../utils/mockData'

interface FilterSidebarProps {
  filters: ProductFilters
  onChange: (filters: Partial<ProductFilters>) => void
}

export default function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Category</h3>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
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
      </div>

      {/* Price Range */}
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

      {/* Sort */}
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
        onClick={() => onChange({ category: 'All', minPrice: '', maxPrice: '', sortBy: 'newest', search: '' })}
        className="w-full text-sm text-muted hover:text-charcoal underline underline-offset-2 transition-colors"
      >
        Clear all filters
      </button>
    </aside>
  )
}
