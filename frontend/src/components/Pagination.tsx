import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visible = pages.filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)

  const renderPages = () => {
    const result = []
    let lastRendered = 0
    for (const p of visible) {
      if (lastRendered && p - lastRendered > 1) {
        result.push(<span key={`ellipsis-${p}`} className="px-2 text-muted">…</span>)
      }
      result.push(
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
            p === page
              ? 'bg-charcoal text-white'
              : 'text-charcoal hover:bg-gray-100'
          }`}
        >
          {p}
        </button>
      )
      lastRendered = p
    }
    return result
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-charcoal hover:bg-gray-100 transition-all disabled:opacity-30"
      >
        <ChevronLeft size={18} />
      </button>
      {renderPages()}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-charcoal hover:bg-gray-100 transition-all disabled:opacity-30"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
