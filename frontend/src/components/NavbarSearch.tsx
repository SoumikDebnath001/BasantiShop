import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2, Package, FolderOpen } from 'lucide-react'
import { searchService } from '../services/searchService'
import type { SearchSuggestions } from '../types'
import { productPath } from '../utils/productUrl'

const empty: SearchSuggestions = { categories: [], products: [] }

export default function NavbarSearch() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SearchSuggestions>(empty)
  const wrapRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runSearch = useCallback(async (query: string) => {
    const t = query.trim()
    if (!t) {
      setData(empty)
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await searchService.search(t)
      setData(res)
    } catch {
      setError('Search failed')
      setData(empty)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!q.trim()) {
      setData(empty)
      setError(null)
      setLoading(false)
      return
    }
    timerRef.current = setTimeout(() => {
      void runSearch(q)
    }, 280)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [q, runSearch])

  const showPanel = open && q.trim().length > 0
  const hasResults = data.categories.length > 0 || data.products.length > 0

  return (
    <div ref={wrapRef} className="relative w-full max-w-md min-w-0 mx-auto md:mx-0">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search categories & products…"
          autoComplete="off"
          className="w-full pl-9 pr-9 py-2 bg-white border border-border rounded-xl text-sm text-charcoal placeholder:text-gray-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
          aria-autocomplete="list"
          aria-expanded={showPanel}
        />
        {loading && (
          <Loader2
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted animate-spin"
            aria-hidden
          />
        )}
      </div>

      {showPanel && (
        <div
          className="absolute left-0 right-0 top-full mt-2 bg-white border border-border rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto py-2 animate-slide-up"
          role="listbox"
        >
          {error && <p className="px-4 py-3 text-sm text-red-600">{error}</p>}
          {!loading && !error && !hasResults && (
            <p className="px-4 py-3 text-sm text-muted">No matches for &ldquo;{q.trim()}&rdquo;</p>
          )}
          {data.categories.length > 0 && (
            <div className="px-2 pb-2">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted">Categories</p>
              {data.categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="option"
                  className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-xl text-sm text-charcoal hover:bg-cream transition-colors"
                  onClick={() => {
                    setOpen(false)
                    setQ('')
                    navigate(`/products?category=${encodeURIComponent(c.name)}`)
                  }}
                >
                  <FolderOpen size={15} className="text-accent shrink-0" />
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          )}
          {data.products.length > 0 && (
            <div className="px-2">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted">Products</p>
              {data.products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  className="w-full flex items-center gap-3 text-left px-3 py-2 rounded-xl text-sm hover:bg-cream transition-colors"
                  onClick={() => {
                    setOpen(false)
                    setQ('')
                    navigate(productPath({ id: p.id, slug: p.slug }))
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-border">
                    {p.image ? (
                      <img src={p.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted">
                        <Package size={16} />
                      </div>
                    )}
                  </div>
                  <span className="text-charcoal truncate">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted block text-xs truncate">{p.category}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
