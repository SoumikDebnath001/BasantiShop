import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FolderOpen } from 'lucide-react'
import Seo from '../components/Seo'
import { categoryService } from '../services/categoryService'
import type { CategoryDTO } from '../types'
import { getApiErrorMessage } from '../utils/apiError'
import { SHOP_NAME } from '../constants/brand'

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
      .then((rows) => {
        if (!cancelled) setCategories(rows)
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load categories'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <Seo
        title="Shop by category"
        description={`Browse product categories at ${SHOP_NAME}.`}
      />
      <div className="max-w-2xl mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal tracking-tight mb-3">
          Shop by category
        </h1>
        <p className="text-muted leading-relaxed">
          Pick a category to see everything we currently have in stock. You can refine further on the next screen.
        </p>
      </div>

      {loading && <p className="text-muted text-sm">Loading categories…</p>}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm max-w-lg">{error}</div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="bg-white border border-border rounded-2xl p-8 text-center text-muted text-sm">
          No categories yet. An administrator can add categories from the admin panel.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/products?category=${encodeURIComponent(c.name)}`}
            className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-border hover:border-accent/40 hover:shadow-md transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-cream flex items-center justify-center group-hover:bg-accent/15 transition-colors">
              <FolderOpen size={22} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-charcoal text-lg truncate">{c.name}</h2>
              <p className="text-xs text-muted mt-0.5">View products</p>
            </div>
            <ArrowRight
              size={18}
              className="text-muted group-hover:translate-x-0.5 group-hover:text-accent transition-all shrink-0"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
