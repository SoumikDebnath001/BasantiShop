import { useEffect, useState, useCallback } from 'react'
import { MessageSquare, Trash2, Loader2, Star, AlertTriangle } from 'lucide-react'
import { shopReviewService } from '../services/shopReviewService'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/format'
import { getApiErrorMessage } from '../utils/apiError'
import type { ShopReview } from '../types'

export default function AdminShopReviews() {
  const { showToast } = useToast()
  const [rows, setRows] = useState<ShopReview[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadReviews = useCallback(async () => {
    setLoading(true)
    try {
      const data = await shopReviewService.listAllAdmin()
      setRows(data)
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Failed to load reviews'), 'error')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { loadReviews() }, [loadReviews])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await shopReviewService.deleteReview(id)
      setRows((prev) => prev.filter((r) => r.id !== id))
      showToast('Review deleted.', 'success')
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Could not delete review'), 'error')
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-charcoal flex items-center gap-2">
          <MessageSquare size={24} className="text-accent" />
          Shop Reviews
        </h1>
        <p className="text-muted text-sm mt-0.5">Customer ratings of the store. Delete inappropriate reviews.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted py-12">
          <Loader2 className="animate-spin" size={22} />
          Loading reviews…
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <MessageSquare size={28} className="text-muted mx-auto mb-2" />
          <p className="text-charcoal font-medium">No shop reviews yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-border p-5 md:p-6">
              {/* Header */}
              <div className="flex flex-wrap justify-between gap-2 mb-1">
                <div>
                  <p className="text-sm font-semibold text-charcoal">{r.user.name}</p>
                  <p className="text-xs text-muted">{r.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{formatDate(r.createdAt)}</span>

                  {confirmId === r.id ? (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5">
                      <AlertTriangle size={13} className="text-red-500 shrink-0" />
                      <span className="text-xs text-red-700 font-medium">Delete?</span>
                      <button
                        type="button"
                        disabled={deletingId === r.id}
                        onClick={() => handleDelete(r.id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-60"
                      >
                        {deletingId === r.id ? <Loader2 size={12} className="animate-spin" /> : 'Yes'}
                      </button>
                      <span className="text-red-300">·</span>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="text-xs text-muted hover:text-charcoal"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(r.id)}
                      className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete review"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Star rating */}
              <div className="flex items-center gap-0.5 my-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
                  />
                ))}
                <span className="text-xs text-muted ml-1">{r.rating}/5</span>
              </div>

              <p className="text-sm text-charcoal leading-relaxed">{r.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
