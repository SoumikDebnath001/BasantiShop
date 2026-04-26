import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { analyticsService } from '../services/analyticsService'
import { useToast } from '../context/ToastContext'
import { formatPrice, formatDate } from '../utils/format'
import { getApiErrorMessage } from '../utils/apiError'
import type { ProfitLossResponse } from '../types'

export default function AdminAnalytics() {
  const { showToast } = useToast()
  const [data, setData] = useState<ProfitLossResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsService
      .getProfitLoss()
      .then(setData)
      .catch((e) => {
        showToast(getApiErrorMessage(e, 'Failed to load analytics'), 'error')
        setData(null)
      })
      .finally(() => setLoading(false))
  }, [showToast])

  const s = data?.summary

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-charcoal">Profit &amp; loss</h1>
        <p className="text-muted text-sm mt-0.5">Based on confirmed &amp; delivered orders with negotiated totals</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : !s ? (
        <p className="text-sm text-muted">No data</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              ['Total sales', formatPrice(s.totalSales)],
              ['Total profit (margins ≥ 0)', formatPrice(s.totalProfit)],
              ['Total loss (negative margins)', formatPrice(s.totalLoss)],
              ['Net', formatPrice(s.totalProfit - s.totalLoss)],
            ].map(([label, val]) => (
              <div key={label} className="bg-white rounded-2xl border border-border p-5">
                <p className="text-xs text-muted uppercase tracking-wide mb-1">{label}</p>
                <p className="font-display text-xl font-bold text-charcoal">{val}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <TrendingUp size={16} className="text-muted" />
              <h2 className="font-semibold text-charcoal text-sm">Order-wise breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50 text-left text-xs text-muted uppercase">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Final total</th>
                    <th className="px-4 py-3">Cost</th>
                    <th className="px-4 py-3">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(data?.orders ?? []).map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">{formatDate(row.createdAt)}</td>
                      <td className="px-4 py-3 text-charcoal">{row.customerName}</td>
                      <td className="px-4 py-3">{row.status}</td>
                      <td className="px-4 py-3">{formatPrice(row.finalTotal)}</td>
                      <td className="px-4 py-3 text-muted">{formatPrice(row.totalCost)}</td>
                      <td className={`px-4 py-3 font-medium ${row.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {formatPrice(row.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
