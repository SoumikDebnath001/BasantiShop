import { useEffect, useState, useMemo, useCallback } from 'react'
import { Receipt, Loader2, Search, X, FileText, Download, CheckCircle2, RotateCcw } from 'lucide-react'
import { orderService } from '../services/orderService'
import { useToast } from '../context/ToastContext'
import { formatDate, formatPrice } from '../utils/format'
import { getApiErrorMessage } from '../utils/apiError'
import InvoiceModal from '../components/InvoiceModal'
import type { Order } from '../types'

type BillStatus = 'DELIVERED' | 'RETURNED'

function statusStyle(status: BillStatus) {
  if (status === 'RETURNED') return 'bg-purple-50 text-purple-700 border-purple-200'
  return 'bg-emerald-50 text-emerald-700 border-emerald-200'
}

export default function AdminBills() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchId, setSearchId] = useState('')
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const all = await orderService.getAllOrders()
      setOrders(all.filter((o) => o.status === 'DELIVERED' || o.status === 'RETURNED'))
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Failed to load bills'), 'error')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { void load() }, [load])

  const filtered = useMemo(() => {
    const q = searchId.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((o) =>
      o.id.toLowerCase().includes(q) ||
      o.id.slice(-8).toLowerCase().includes(q)
    )
  }, [orders, searchId])

  const handleDownload = async (order: Order) => {
    setDownloadingId(order.id)
    try {
      await orderService.downloadInvoice(order.id, `bill-${order.id.slice(-8).toUpperCase()}.pdf`)
      showToast('Bill downloaded.', 'success')
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Could not download bill.'), 'error')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-charcoal flex items-center gap-2">
          <Receipt size={24} className="text-accent" />
          Bills
        </h1>
        <p className="text-muted text-sm mt-1">
          Finalised bills for delivered and returned orders. Search by Bill ID.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Search by Bill ID…"
          className="w-full pl-9 pr-9 py-2.5 border border-border rounded-xl text-sm text-charcoal placeholder:text-gray-400 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 bg-white"
        />
        {searchId && (
          <button
            type="button"
            onClick={() => setSearchId('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted py-12">
          <Loader2 className="animate-spin" size={22} />
          Loading bills…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <Receipt size={28} className="text-muted mx-auto mb-2" />
          <p className="text-charcoal font-medium">
            {searchId ? `No bills match "${searchId}"` : 'No finalised bills yet'}
          </p>
          <p className="text-sm text-muted mt-1">
            {!searchId && 'Bills appear here once orders are delivered or returned.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const shortId = order.id.slice(-8).toUpperCase()
            const status = order.status as BillStatus
            const busy = downloadingId === order.id

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-border px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-accent/30 transition-colors"
              >
                {/* Bill ID + status */}
                <div className="flex items-center gap-3 sm:w-48 shrink-0">
                  <div className="w-9 h-9 bg-cream rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-semibold text-charcoal">#{shortId}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle(status)}`}>
                      {status === 'DELIVERED'
                        ? <><CheckCircle2 size={9} />Delivered</>
                        : <><RotateCcw size={9} />Returned</>
                      }
                    </span>
                  </div>
                </div>

                {/* Customer + items */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal truncate">{order.user?.name ?? '—'}</p>
                  <p className="text-xs text-muted">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {formatDate(order.createdAt)}
                  </p>
                </div>

                {/* Total */}
                <div className="shrink-0">
                  <p className="font-display font-bold text-charcoal">{formatPrice(order.displayTotal)}</p>
                </div>

                {/* Actions */}
                {order.invoiceUrl ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewingOrderId(order.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-border hover:bg-cream transition-colors"
                    >
                      <FileText size={13} />
                      View
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleDownload(order)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-charcoal text-white hover:bg-accent transition-colors disabled:opacity-60"
                    >
                      {busy ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                      Download
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-muted italic shrink-0">No bill file</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {viewingOrderId && (
        <InvoiceModal
          orderId={viewingOrderId}
          onClose={() => setViewingOrderId(null)}
        />
      )}
    </div>
  )
}
