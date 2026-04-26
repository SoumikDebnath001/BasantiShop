import { useState, useEffect, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import {
  User,
  ShoppingCart,
  MessageSquare,
  Save,
  Package,
  FileText,
  Download,
  Loader2,
  ClipboardList,
  CheckCircle2,
  Truck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { FormInput } from '../components/FormInput'
import CartItemRow from '../components/CartItemRow'
import Seo from '../components/Seo'
import { formatPrice, formatDate } from '../utils/format'
import { userService } from '../services/userService'
import { contactService } from '../services/contactService'
import type { ContactHistoryItem, Order } from '../types'
import { getApiErrorMessage } from '../utils/apiError'
import { orderService } from '../services/orderService'
import { shopReviewService } from '../services/shopReviewService'
import type { DashboardOverview, OrderStatus } from '../types'
import { SHOP_NAME } from '../constants/brand'

type Tab = 'overview' | 'orders' | 'profile' | 'cart' | 'contacts'
type OrderSubTab = 'active' | 'confirmed' | 'delivered'

const TABS: { id: Tab; icon: typeof User; label: string }[] = [
  { id: 'overview', icon: User, label: 'Overview' },
  { id: 'orders', icon: ClipboardList, label: 'Orders' },
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'cart', icon: ShoppingCart, label: 'My Cart' },
  { id: 'contacts', icon: MessageSquare, label: 'Contact History' },
]

const ORDER_SUBTABS: { id: OrderSubTab; label: string }[] = [
  { id: 'active', label: 'Active orders' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'delivered', label: 'Delivered' },
]

function orderStatusBadgeClass(status: OrderStatus) {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-800 border-amber-200'
    case 'CONFIRMED':
      return 'bg-blue-50 text-blue-800 border-blue-200'
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200'
    case 'RETURNED':
      return 'bg-purple-50 text-purple-800 border-purple-200'
    case 'CANCELLED':
      return 'bg-red-50 text-red-800 border-red-200'
    default:
      return 'bg-gray-50 text-gray-700 border-border'
  }
}

type ProfileForm = { name: string; email: string; phone: string }

function OrderCard({
  order,
  onDownloadInvoice,
  onViewInvoice,
  invoiceLoading,
}: {
  order: Order
  onDownloadInvoice: (id: string) => void
  onViewInvoice: (id: string) => void
  invoiceLoading: string | null
}) {
  const busy = invoiceLoading === order.id
  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs text-muted uppercase tracking-wide">Order</p>
          <p className="font-mono text-sm text-charcoal font-medium">{order.id.slice(0, 12)}…</p>
          <p className="text-xs text-muted mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${orderStatusBadgeClass(order.status)}`}
        >
          {order.status === 'DELIVERED' && <CheckCircle2 size={12} />}
          {order.status}
        </span>
      </div>
      <ul className="text-sm text-charcoal space-y-1 mb-3 border-t border-border pt-3">
        {order.items.map((i) => (
          <li key={i.id} className="flex justify-between gap-2">
            <span className="truncate">
              {i.name} × {i.quantity}
            </span>
            <span className="text-muted shrink-0">{formatPrice(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
        <span className="font-display font-semibold text-charcoal">{formatPrice(order.displayTotal)}</span>
        {order.status === 'DELIVERED' && order.invoiceUrl && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => onViewInvoice(order.id)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-border hover:bg-cream transition-colors disabled:opacity-50"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              View invoice
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDownloadInvoice(order.id)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-charcoal text-white hover:bg-accent transition-colors disabled:opacity-50"
            >
              <Download size={14} />
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, updateUser } = useAuth()
  const { items, totalPrice, totalItems } = useCart()
  const { showToast } = useToast()

  const [tab, setTab] = useState<Tab>('overview')
  const [orderSubTab, setOrderSubTab] = useState<OrderSubTab>('active')
  const [shopRating, setShopRating] = useState(5)
  const [shopMessage, setShopMessage] = useState('')
  const [shopSubmitting, setShopSubmitting] = useState(false)

  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(true)

  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [deliveredHistory, setDeliveredHistory] = useState<Order[]>([])
  const [deliveredLoading, setDeliveredLoading] = useState(false)

  const [contacts, setContacts] = useState<ContactHistoryItem[]>([])
  const [contactsLoading, setContactsLoading] = useState(false)

  const [invoiceLoading, setInvoiceLoading] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: { name: user?.name, email: user?.email, phone: user?.phone || '' },
  })

  useEffect(() => {
    reset({ name: user?.name, email: user?.email, phone: user?.phone || '' })
  }, [user, reset])

  const loadOverview = useCallback(async () => {
    if (!user) return
    setOverviewLoading(true)
    try {
      const data = await orderService.getOverview()
      setOverview(data)
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not load overview.'), 'error')
      setOverview(null)
    } finally {
      setOverviewLoading(false)
    }
  }, [user, showToast])

  const loadOrders = useCallback(async () => {
    if (!user) return
    setOrdersLoading(true)
    try {
      const list = await orderService.getMyOrders()
      setMyOrders(list)
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not load orders.'), 'error')
      setMyOrders([])
    } finally {
      setOrdersLoading(false)
    }
  }, [user, showToast])

  const loadDeliveredHistory = useCallback(async () => {
    if (!user) return
    setDeliveredLoading(true)
    try {
      const list = await orderService.getDeliveredHistory()
      setDeliveredHistory(list)
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not load delivered orders.'), 'error')
      setDeliveredHistory([])
    } finally {
      setDeliveredLoading(false)
    }
  }, [user, showToast])

  const loadContacts = useCallback(async () => {
    if (!user?.id) return
    setContactsLoading(true)
    try {
      const list = await contactService.getHistoryByUser(user.id)
      setContacts(list)
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not load contact history.'), 'error')
      setContacts([])
    } finally {
      setContactsLoading(false)
    }
  }, [user, showToast])

  useEffect(() => {
    void loadOverview()
  }, [loadOverview])

  useEffect(() => {
    if (tab === 'orders') void loadOrders()
  }, [tab, loadOrders])

  useEffect(() => {
    if (tab === 'orders' && orderSubTab === 'delivered') void loadDeliveredHistory()
  }, [tab, orderSubTab, loadDeliveredHistory])

  useEffect(() => {
    if (tab === 'contacts') void loadContacts()
  }, [tab, loadContacts])

  const filteredPipelineOrders = useMemo(() => {
    if (orderSubTab === 'active') {
      return myOrders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED')
    }
    if (orderSubTab === 'confirmed') {
      return myOrders.filter((o) => o.status === 'CONFIRMED')
    }
    return []
  }, [myOrders, orderSubTab])

  const onProfileSave = async (data: ProfileForm) => {
    try {
      const updated = await userService.updateProfile({
        name: data.name,
        phone: data.phone || undefined,
      })
      updateUser(updated)
      showToast('Profile updated successfully!', 'success')
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not update profile.'), 'error')
    }
  }

  const submitShopReview = async () => {
    if (shopMessage.trim().length < 3) {
      showToast('Please write a short message.', 'warning')
      return
    }
    setShopSubmitting(true)
    try {
      await shopReviewService.submitReview(shopRating, shopMessage.trim())
      showToast('Thanks for reviewing!', 'success')
      setShopMessage('')
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Error submitting review'), 'error')
    } finally {
      setShopSubmitting(false)
    }
  }

  const handleDownloadInvoice = async (orderId: string) => {
    setInvoiceLoading(orderId)
    try {
      await orderService.downloadInvoice(orderId)
      showToast('Invoice downloaded.', 'success')
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not download invoice.'), 'error')
    } finally {
      setInvoiceLoading(null)
    }
  }

  const handleViewInvoice = async (orderId: string) => {
    setInvoiceLoading(orderId)
    try {
      await orderService.viewInvoiceInNewTab(orderId)
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not open invoice.'), 'error')
    } finally {
      setInvoiceLoading(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 animate-fade-in">
      <Seo title="My dashboard" description={`Account and orders at ${SHOP_NAME}.`} />

      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-charcoal tracking-tight">
          Hello, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-muted text-sm mt-1">Manage your account, orders, and messages</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="hidden lg:block w-56 shrink-0 space-y-1">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-2 text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === id
                  ? 'bg-charcoal text-white shadow-sm'
                  : 'text-muted hover:bg-white hover:text-charcoal border border-transparent'
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </aside>

        <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                tab === id ? 'bg-charcoal text-white' : 'bg-white border border-border text-charcoal'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0 space-y-6">
          {tab === 'overview' && (
            <div className="space-y-6">
              {overviewLoading ? (
                <div className="flex items-center justify-center py-16 text-muted gap-2">
                  <Loader2 className="animate-spin" size={22} />
                  Loading overview…
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        label: 'Total orders',
                        value: overview?.totalOrders ?? 0,
                        icon: Package,
                      },
                      {
                        label: 'Pending',
                        value: overview?.pendingOrders ?? 0,
                        icon: ClipboardList,
                      },
                      {
                        label: 'Confirmed',
                        value: overview?.confirmedOrders ?? 0,
                        icon: CheckCircle2,
                      },
                      {
                        label: 'Delivered',
                        value: overview?.deliveredOrders ?? 0,
                        icon: Truck,
                      },
                    ].map(({ label, value, icon: Icon }) => (
                      <div
                        key={label}
                        className="bg-white rounded-2xl border border-border p-5 shadow-sm hover:border-accent/20 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center">
                            <Icon size={18} className="text-accent" />
                          </div>
                          <span className="text-xs font-medium text-muted uppercase tracking-wide">{label}</span>
                        </div>
                        <p className="font-display text-2xl font-bold text-charcoal">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                    <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
                      <ClipboardList size={18} className="text-accent" />
                      Recent activity
                    </h3>
                    {!overview?.recentActivity?.length ? (
                      <p className="text-sm text-muted">No orders yet.</p>
                    ) : (
                      <ul className="space-y-3">
                        {overview.recentActivity.map((a) => (
                          <li
                            key={a.id}
                            className="flex flex-wrap items-center justify-between gap-2 text-sm border-b border-border last:border-0 pb-3 last:pb-0"
                          >
                            <span className="text-muted">{formatDate(a.createdAt)}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${orderStatusBadgeClass(a.status)}`}>
                              {a.status}
                            </span>
                            <span className="font-medium text-charcoal">{formatPrice(a.displayTotal)}</span>
                            <span className="text-xs text-muted">{a.itemCount} item(s)</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}

              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="font-semibold text-charcoal mb-1">Review {SHOP_NAME}</h3>
                <p className="text-sm text-muted mb-4">Rate your overall experience (not individual products).</p>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      aria-label={`${v} stars`}
                      onClick={() => setShopRating(v)}
                      className={`text-xl ${shopRating >= v ? 'text-amber-400' : 'text-gray-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  value={shopMessage}
                  onChange={(e) => setShopMessage(e.target.value)}
                  placeholder="Tell us about your visit…"
                  rows={3}
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm mb-4 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
                <button
                  type="button"
                  onClick={submitShopReview}
                  disabled={shopSubmitting}
                  className="px-5 py-2.5 bg-charcoal text-white text-sm font-medium rounded-xl hover:bg-accent transition-colors disabled:opacity-60"
                >
                  {shopSubmitting ? 'Submitting…' : 'Submit review'}
                </button>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2 border-b border-border pb-2">
                {ORDER_SUBTABS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setOrderSubTab(id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      orderSubTab === id
                        ? 'bg-charcoal text-white'
                        : 'bg-white border border-border text-charcoal hover:bg-cream'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {ordersLoading && orderSubTab !== 'delivered' && (
                <div className="flex items-center gap-2 text-muted py-12 justify-center">
                  <Loader2 className="animate-spin" size={22} />
                  Loading orders…
                </div>
              )}

              {deliveredLoading && orderSubTab === 'delivered' && (
                <div className="flex items-center gap-2 text-muted py-12 justify-center">
                  <Loader2 className="animate-spin" size={22} />
                  Loading delivered orders…
                </div>
              )}

              {!ordersLoading && orderSubTab !== 'delivered' && filteredPipelineOrders.length === 0 && (
                <div className="bg-white border border-dashed border-border rounded-2xl p-10 text-center text-muted text-sm">
                  No orders in this category yet.
                </div>
              )}

              {!deliveredLoading && orderSubTab === 'delivered' && deliveredHistory.length === 0 && (
                <div className="bg-white border border-dashed border-border rounded-2xl p-10 text-center text-muted text-sm">
                  No delivered orders in the last year.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orderSubTab !== 'delivered' &&
                  !ordersLoading &&
                  filteredPipelineOrders.map((o) => (
                    <OrderCard
                      key={o.id}
                      order={o}
                      onDownloadInvoice={handleDownloadInvoice}
                      onViewInvoice={handleViewInvoice}
                      invoiceLoading={invoiceLoading}
                    />
                  ))}
                {orderSubTab === 'delivered' &&
                  !deliveredLoading &&
                  deliveredHistory.map((o) => (
                    <OrderCard
                      key={o.id}
                      order={o}
                      onDownloadInvoice={handleDownloadInvoice}
                      onViewInvoice={handleViewInvoice}
                      invoiceLoading={invoiceLoading}
                    />
                  ))}
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <form onSubmit={handleSubmit(onProfileSave)} className="max-w-md space-y-4 bg-white rounded-2xl border border-border p-6 shadow-sm">
              <FormInput label="Name" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
              <FormInput label="Email" readOnly className="bg-cream/80" {...register('email')} />
              <FormInput label="Phone" {...register('phone')} />
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white text-sm font-medium rounded-xl hover:bg-accent transition-colors"
              >
                <Save size={16} />
                Save changes
              </button>
            </form>
          )}

          {tab === 'cart' && (
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              {items.length === 0 ? (
                <p className="text-center text-muted py-8">Your cart is empty.</p>
              ) : (
                <div className="space-y-2">
                  {items.map((i) => (
                    <CartItemRow key={i.product.id} item={i} />
                  ))}
                  <p className="text-right font-semibold text-charcoal pt-4 border-t border-border">
                    Total: {formatPrice(totalPrice)} ({totalItems} items)
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'contacts' && (
            <div className="space-y-4">
              {contactsLoading ? (
                <div className="flex items-center justify-center gap-2 text-muted py-16">
                  <Loader2 className="animate-spin" size={22} />
                  Loading messages…
                </div>
              ) : contacts.length === 0 ? (
                <div className="bg-white border border-dashed border-border rounded-2xl p-10 text-center text-muted text-sm">
                  You have not sent any messages yet.
                </div>
              ) : (
                contacts.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-3 transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-wrap justify-between gap-2 text-sm">
                      <span className="font-medium text-charcoal">{c.productName}</span>
                      <span className="text-xs text-muted">{formatDate(c.createdAt)}</span>
                    </div>
                    <div className="rounded-xl bg-cream/80 p-3 text-sm text-charcoal">
                      <p className="text-xs font-semibold text-muted mb-1">Your message</p>
                      <p>{c.message}</p>
                    </div>
                    {c.response ? (
                      <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 text-sm">
                        <p className="text-xs font-semibold text-accent mb-1">Reply from store</p>
                        <p className="text-charcoal">{c.response}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted italic">Awaiting reply from the store.</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
