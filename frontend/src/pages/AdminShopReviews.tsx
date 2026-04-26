import { useEffect, useState, useCallback } from 'react'
import { MessageSquare } from 'lucide-react'
import { shopReviewService } from '../services/shopReviewService'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/format'
import { getApiErrorMessage } from '../utils/apiError'
import type { ShopReview } from '../types'

export default function AdminShopReviews() {
  const { showToast } = useToast()
  const [rows, setRows] = useState<ShopReview[]>([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-charcoal">Shop reviews</h1>
        <p className="text-muted text-sm mt-0.5">Customer ratings of the store (not individual products)</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <MessageSquare size={28} className="text-muted mx-auto mb-2" />
          <p className="text-charcoal font-medium">No shop reviews yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-border p-6">
              <div className="flex flex-wrap justify-between gap-2 mb-2">
                <p className="text-sm font-medium text-charcoal">{r.user.name}</p>
                <span className="text-xs text-muted">{formatDate(r.createdAt)}</span>
              </div>
              <p className="text-xs text-muted mb-2">{r.user.email}</p>
              <p className="text-sm text-charcoal mb-2">
                Rating: <strong>{r.rating}</strong> / 5
              </p>
              <p className="text-sm text-muted leading-relaxed">{r.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
