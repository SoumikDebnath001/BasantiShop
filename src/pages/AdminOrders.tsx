import { useState, useEffect, useMemo } from 'react'
import {
  ClipboardList,
  CheckCircle,
  Trash2,
  Undo2,
  Truck,
  RotateCcw,
  Ban,
} from 'lucide-react'
import { orderService } from '../services/orderService'
import { useToast } from '../context/ToastContext'
import type { Order } from '../types'
import { formatPrice, formatDate } from '../utils/format'
import { getApiErrorMessage } from '../utils/apiError'
import Modal from '../components/Modal'

type Tab = 'pending' | 'confirmed' | 'delivered'

function statusStyle(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-700'
    case 'CONFIRMED':
      return 'bg-blue-50 text-blue-700'
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-700'
    case 'RETURNED':
      return 'bg-purple-50 text-purple-700'
    case 'CANCELLED':
      return 'bg-red-50 text-red-700'
    default:
      return 'bg-gray-100 text-muted'
  }
}

export default function AdminOrders() {
  const [tab, setTab] = useState<Tab>('pending')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const { showToast } = useToast()

  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null)
  const [finalAmount, setFinalAmount] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null)

  const load = () => {
    setLoading(true)
    orderService
      .getAllOrders()
      .then(setOrders)
      .catch((err) => {
        showToast(getApiErrorMessage(err, 'Failed to load orders'), 'error')
        setOrders([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (tab === 'pending') return orders.filter((o) => o.status === 'PENDING')
    if (tab === 'confirmed') return orders.filter((o) => o.status === 'CONFIRMED')
    return orders.filter((o) => o.status === 'DELIVERED')
  }, [orders, tab])

  const run = async (id: string, fn: () => Promise<Order | void>, msg: string) => {
    setBusyId(id)
    try {
      const updated = await fn()
      if (updated) {
        setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
      } else {
        setOrders((prev) => prev.filter((o) => o.id !== id))
      }
      showToast(msg, 'success')
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Action failed'), 'error')
    } finally {
      setBusyId(null)
    }
  }

  const openConfirm = (o: Order) => {
    setConfirmOrder(o)
    setFinalAmount(String(o.totalAmount))
  }

  const submitConfirm = async () => {
    if (!confirmOrder) return
    const n = Number(finalAmount)
    if (!Number.isFinite(n) || n <= 0) {
      showToast('Enter a valid final price', 'error')
      return
    }
    const id = confirmOrder.id
    setBusyId(id)
    try {
      const updated = await orderService.patchOrder(id, { status: 'CONFIRMED', finalTotalAmount: n })
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
      showToast('Order confirmed with negotiated total.', 'success')
      setConfirmOrder(null)
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not confirm order'), 'error')
    } finally {
      setBusyId(null)
    }
  }

  const submitDelete = async () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    setBusyId(id)
    try {
      await orderService.deleteOrder(id)
      setOrders((prev) => prev.filter((o) => o.id !== id))
      showToast('Order deleted.', 'success')
      setDeleteTarget(null)
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not delete order'), 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-charcoal">Orders</h1>
        <p className="text-muted text-sm mt-0.5">Manage lifecycle, negotiation, and fulfilment</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            ['pending', 'Unconfirmed'],
            ['confirmed', 'Confirmed'],
            ['delivered', 'Delivered'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === key ? 'bg-charcoal text-white' : 'bg-white text-muted border border-border hover:text-charcoal'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading orders…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <ClipboardList size={28} className="text-muted mx-auto mb-2" />
          <p className="text-charcoal font-medium">No orders in this tab</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-border p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Customer</p>
                  <p className="text-sm font-medium text-charcoal">{order.user.name}</p>
                  <p className="text-xs text-muted">{order.user.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Phone</p>
                  <p className="text-sm font-medium text-charcoal">{order.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Listed total</p>
                  <p className="font-display text-lg font-bold text-charcoal">{formatPrice(order.totalAmount)}</p>
                </div>
                {order.finalTotalAmount != null && (
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Final total</p>
                    <p className="font-display text-lg font-bold text-charcoal">
                      {formatPrice(order.finalTotalAmount)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Status</p>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted mb-2">{formatDate(order.createdAt)}</p>

              <ul className="space-y-2 mb-4 border-t border-border pt-4">
                {order.items.map((line) => (
                  <li key={line.id} className="flex justify-between text-sm text-charcoal">
                    <span className="line-clamp-2">
                      {line.name} × {line.quantity}
                    </span>
                    <span className="shrink-0 text-muted">
                      {formatPrice(line.price * line.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2">
                {order.status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() => openConfirm(order)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-charcoal text-white text-sm font-medium rounded-xl hover:bg-accent transition-colors disabled:opacity-60"
                    >
                      <CheckCircle size={16} />
                      Confirm
                    </button>
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() => setDeleteTarget(order)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors disabled:opacity-60"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </>
                )}
                {order.status === 'CONFIRMED' && (
                  <>
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() =>
                        run(order.id, () => orderService.patchOrder(order.id, { status: 'PENDING' }), 'Order unconfirmed.')
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-border text-sm font-medium rounded-xl hover:bg-cream transition-colors disabled:opacity-60"
                    >
                      <Undo2 size={16} />
                      Unconfirm
                    </button>
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() =>
                        run(
                          order.id,
                          () => orderService.patchOrder(order.id, { status: 'DELIVERED' }),
                          'Marked as delivered.'
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-charcoal text-white text-sm font-medium rounded-xl hover:bg-accent transition-colors disabled:opacity-60"
                    >
                      <Truck size={16} />
                      Mark delivered
                    </button>
                  </>
                )}
                {order.status === 'DELIVERED' && (
                  <>
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() =>
                        run(
                          order.id,
                          () => orderService.patchOrder(order.id, { status: 'RETURNED' }),
                          'Marked as returned (stock restored).'
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-border text-sm font-medium rounded-xl hover:bg-cream transition-colors disabled:opacity-60"
                    >
                      <RotateCcw size={16} />
                      Returned
                    </button>
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() =>
                        run(
                          order.id,
                          () => orderService.patchOrder(order.id, { status: 'CANCELLED' }),
                          'Order cancelled (stock restored).'
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors disabled:opacity-60"
                    >
                      <Ban size={16} />
                      Cancelled
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!confirmOrder}
        onClose={() => setConfirmOrder(null)}
        title="Confirm order"
        size="sm"
      >
        <div className="p-6 pt-0 space-y-4">
          <p className="text-sm text-muted">
            Listed total {confirmOrder ? formatPrice(confirmOrder.totalAmount) : ''}. Final negotiated charge must not
            exceed this amount.
          </p>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Final selling price (total)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={finalAmount}
              onChange={(e) => setFinalAmount(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setConfirmOrder(null)}
              className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busyId === confirmOrder?.id}
              onClick={submitConfirm}
              className="flex-1 py-2.5 bg-charcoal text-white rounded-xl text-sm font-medium disabled:opacity-60"
            >
              {busyId === confirmOrder?.id ? 'Saving…' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete order" size="sm">
        <div className="p-6 pt-0 space-y-4 text-center">
          <p className="text-sm text-muted">Delete this pending order permanently?</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busyId === deleteTarget?.id}
              onClick={submitDelete}
              className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium disabled:opacity-60"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
