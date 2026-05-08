import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Layers } from 'lucide-react'
import Seo from '../components/Seo'
import { categoryService } from '../services/categoryService'
import type { CategoryDTO } from '../types'
import { getApiErrorMessage } from '../utils/apiError'
import { SHOP_NAME } from '../constants/brand'

const BG_COLORS = [
  'bg-orange-50 border-orange-100 hover:border-orange-200',
  'bg-blue-50 border-blue-100 hover:border-blue-200',
  'bg-emerald-50 border-emerald-100 hover:border-emerald-200',
  'bg-purple-50 border-purple-100 hover:border-purple-200',
  'bg-pink-50 border-pink-100 hover:border-pink-200',
  'bg-amber-50 border-amber-100 hover:border-amber-200',
  'bg-cyan-50 border-cyan-100 hover:border-cyan-200',
  'bg-rose-50 border-rose-100 hover:border-rose-200',
]
const TEXT_COLORS = [
  'text-orange-600', 'text-blue-600', 'text-emerald-600', 'text-purple-600',
  'text-pink-600', 'text-amber-600', 'text-cyan-600', 'text-rose-600',
]

export default function Categories() {
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    categoryService
      .list()
      .then((rows) => { if (!cancelled) setCategories(rows) })
      .catch((err) => { if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load categories')) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-fade-in">
      <Seo title="Shop by category" description={`Browse product categories at ${SHOP_NAME}.`} />

      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-4xl font-bold text-charcoal mb-2">
          Shop by category
        </h1>
        <p className="text-muted text-sm md:text-base">
          Pick a category to see everything in stock.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-border animate-skeleton-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm max-w-md">
          {error}
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="bg-white border border-dashed border-border rounded-2xl p-12 text-center">
          <Layers size={28} className="text-muted mx-auto mb-3" />
          <p className="text-charcoal font-medium">No categories yet</p>
          <p className="text-muted text-sm mt-1">An admin can add categories from the panel.</p>
        </div>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {categories.map((c, i) => {
            const idx = i % BG_COLORS.length
            return (
              <Link
                key={c.id}
                to={`/products?category=${encodeURIComponent(c.name)}`}
                className={`group flex flex-col items-center justify-center gap-3 p-5 md:p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 ${BG_COLORS[idx]}`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-card`}>
                  <Layers size={22} className={TEXT_COLORS[idx]} />
                </div>
                <div className="text-center">
                  <h2 className="font-semibold text-charcoal text-sm leading-snug line-clamp-2">{c.name}</h2>
                  <span className={`inline-flex items-center gap-0.5 text-xs font-medium mt-1 ${TEXT_COLORS[idx]}`}>
                    View <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
