import { useState, useEffect, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import {
  User, ShoppingCart, MessageSquare, Save, Package,
  FileText, Download, Loader2, ClipboardList,
  CheckCircle2, Truck, Star, LogOut,
} from 'lucide-react'
import InvoiceModal from '../components/InvoiceModal'
import LogoutConfirmModal from '../components/LogoutConfirmModal'
import { useNavigate } from 'react-router-dom'
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

type Tab = 'overview' | 'orders' | 'profile' | 'cart' | 'messages'
type OrderSubTab = 'active' | 'delivered'

const TABS: { id: Tab; icon: typeof User; label: string }[] = [
  { id: 'overview', icon: User, label: 'Overview' },
  { id: 'orders', icon: ClipboardList, label: 'Orders' },
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'cart', icon: ShoppingCart, label: 'Cart' },
  { id: 'messages', icon: MessageSquare, label: 'Messages' },
]

function statusBadge(status: OrderStatus) {
  switch (status) {
    case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'CONFIRMED': return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'DELIVERED': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'RETURNED': return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200'
    default: return 'bg-gray-50 text-gray-700 border-border'
  }
}

type ProfileForm = { name: string; email: string; phone: string }

function OrderCard({ order, onDownloadInvoice, onViewInvoice, invoiceLoading }: {
  order: Order
  onDownloadInvoice: (id: string) => void
  onViewInvoice: (id: string) => void
  invoiceLoading: string | null
}) {
  const busy = invoiceLoading === order.id
  return (
    <div className="bg-white rounded-2xl border border-border p-4 shadow-card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-mono text-xs text-muted">#{order.id.slice(-8).toUpperCase()}</p>
          <p className="text-xs text-muted mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${statusBadge(order.status)}`}>
          {order.status === 'DELIVERED' && <CheckCircle2 size={11} className="inline mr-0.5 -mt-0.5" />}
          {order.status}
        </span>
      </div>

      <ul className="text-sm text-charcoal space-y-1 mb-3 border-t border-border pt-3">
        {order.items.map((i) => (
          <li key={i.id} className="flex justify-between gap-2">
            <span className="truncate text-sm">{i.name} × {i.quantity}</span>
            <span className="text-muted shrink-0 text-xs">{formatPrice(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
        <span className="font-display font-bold text-charcoal text-base">{formatPrice(order.displayTotal)}</span>
        {(order.status === 'CONFIRMED' || order.status === 'DELIVERED') && order.invoiceUrl && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => onViewInvoice(order.id)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-border hover:bg-cream transition-colors disabled:opacity-50"
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
              View
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDownloadInvoice(order.id)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-charcoal text-white hover:bg-accent transition-colors disabled:opacity-50"
            >
              <Download size={13} />
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, updateUser, logout } = useAuth()
  const { items, totalPrice, totalItems } = useCart()
  const navigate = useNavigate()

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const handleLogout = () => {
    logout()
    navigate('/')
  }
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
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: { name: user?.name, email: user?.email, phone: user?.phone || '' },
  })

  useEffect(() => {
    reset({ name: user?.name, email: user?.email, phone: user?.phone || '' })
  }, [user, reset])

  const loadOverview = useCallback(async () => {
    if (!user) return
    setOverviewLoading(true)
    try { setOverview(await orderService.getOverview()) }
    catch (err) { showToast(getApiErrorMessage(err, 'Could not load overview.'), 'error'); setOverview(null) }
    finally { setOverviewLoading(false) }
  }, [user, showToast])

  const loadOrders = useCallback(async () => {
    if (!user) return
    setOrdersLoading(true)
    try { setMyOrders(await orderService.getMyOrders()) }
    catch (err) { showToast(getApiErrorMessage(err, 'Could not load orders.'), 'error'); setMyOrders([]) }
    finally { setOrdersLoading(false) }
  }, [user, showToast])

  const loadDelivered = useCallback(async () => {
    if (!user) return
    setDeliveredLoading(true)
    try { setDeliveredHistory(await orderService.getDeliveredHistory()) }
    catch (err) { showToast(getApiErrorMessage(err, 'Could not load history.'), 'error'); setDeliveredHistory([]) }
    finally { setDeliveredLoading(false) }
  }, [user, showToast])

  const loadContacts = useCallback(async () => {
    if (!user?.id) return
    setContactsLoading(true)
    try { setContacts(await contactService.getHistoryByUser(user.id)) }
    catch (err) { showToast(getApiErrorMessage(err, 'Could not load messages.'), 'error'); setContacts([]) }
    finally { setContactsLoading(false) }
  }, [user, showToast])

  useEffect(() => { void loadOverview() }, [loadOverview])
  useEffect(() => { if (tab === 'orders') void loadOrders() }, [tab, loadOrders])
  useEffect(() => { if (tab === 'orders' && orderSubTab === 'delivered') void loadDelivered() }, [tab, orderSubTab, loadDelivered])
  useEffect(() => { if (tab === 'messages') void loadContacts() }, [tab, loadContacts])

  const activeOrders = useMemo(
    () => myOrders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED'),
    [myOrders]
  )

  const onProfileSave = async (data: ProfileForm) => {
    try {
      const updated = await userService.updateProfile({ name: data.name, phone: data.phone || undefined })
      updateUser(updated)
      showToast('Profile updated!', 'success')
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not update profile.'), 'error')
    }
  }

  const submitShopReview = async () => {
    if (shopMessage.trim().length < 3) { showToast('Please write a short message.', 'warning'); return }
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
    try { await orderService.downloadInvoice(orderId); showToast('Invoice downloaded.', 'success') }
    catch (err) { showToast(getApiErrorMessage(err, 'Could not download invoice.'), 'error') }
    finally { setInvoiceLoading(null) }
  }

  const handleViewInvoice = (orderId: string) => {
    setViewingOrderId(orderId)
  }

  return (
    <>
    <div className="animate-fade-in">
      <Seo title="My dashboard" description={`Account and orders at ${SHOP_NAME}.`} />

      {/* ── Page header ── */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-0">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-charcoal">
                Hello, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-muted text-sm mt-1">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0 mt-1"
              aria-label="Sign out"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>

          {/* Horizontal tab strip */}
          <div className="flex overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 gap-1" style={{ scrollbarWidth: 'none' }}>
            {TABS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all shrink-0 ${
                  tab === id
                    ? 'border-accent text-charcoal'
                    : 'border-transparent text-muted hover:text-charcoal'
                }`}
              >
                <Icon size={15} />
                {label}
                {id === 'cart' && totalItems > 0 && (
                  <span className="ml-0.5 min-w-[18px] h-[18px] px-1 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">

        {/* Overview */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {overviewLoading ? (
              <div className="flex items-center justify-center py-16 text-muted gap-2">
                <Loader2 className="animate-spin" size={20} />
                Loading…
              </div>
            ) : (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Total orders', value: overview?.totalOrders ?? 0, icon: Package, color: 'text-charcoal' },
                    { label: 'Pending', value: overview?.pendingOrders ?? 0, icon: ClipboardList, color: 'text-amber-600' },
                    { label: 'Confirmed', value: overview?.confirmedOrders ?? 0, icon: CheckCircle2, color: 'text-blue-600' },
                    { label: 'Delivered', value: overview?.deliveredOrders ?? 0, icon: Truck, color: 'text-emerald-600' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-2xl border border-border p-4 shadow-card">
                      <Icon size={18} className={`${color} mb-2`} />
                      <p className="font-display text-2xl font-bold text-charcoal">{value}</p>
                      <p className="text-xs text-muted mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent activity */}
                <div className="bg-white rounded-2xl border border-border p-5 shadow-card">
                  <h3 className="font-semibold text-charcoal mb-4 text-sm uppercase tracking-wide">Recent activity</h3>
                  {!overview?.recentActivity?.length ? (
                    <p className="text-sm text-muted">No orders yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {overview.recentActivity.map((a) => (
                        <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 text-sm border-b border-border last:border-0 pb-3 last:pb-0">
                          <span className="text-muted text-xs">{formatDate(a.createdAt)}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusBadge(a.status)}`}>
                            {a.status}
                          </span>
                          <span className="font-semibold text-charcoal">{formatPrice(a.displayTotal)}</span>
                          <span className="text-xs text-muted">{a.itemCount} item{a.itemCount !== 1 ? 's' : ''}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            {/* Review form */}
            <div className="bg-white rounded-2xl border border-border p-5 shadow-card">
              <h3 className="font-semibold text-charcoal mb-1">Rate {SHOP_NAME}</h3>
              <p className="text-xs text-muted mb-4">Share your overall experience with the store.</p>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-label={`${v} stars`}
                    onClick={() => setShopRating(v)}
                    className="p-0.5"
                  >
                    <Star size={24} className={shopRating >= v ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                  </button>
                ))}
              </div>
              <textarea
                value={shopMessage}
                onChange={(e) => setShopMessage(e.target.value)}
                placeholder="Tell us about your visit…"
                rows={3}
                className="w-full px-4 py-3 border border-border rounded-2xl text-sm mb-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none"
              />
              <button
                type="button"
                onClick={submitShopReview}
                disabled={shopSubmitting}
                className="px-5 py-2.5 bg-charcoal text-white text-sm font-semibold rounded-xl hover:bg-accent transition-colors disabled:opacity-60"
              >
                {shopSubmitting ? 'Submitting…' : 'Submit review'}
              </button>
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div className="space-y-5">
            <div className="flex gap-2">
              {([
                { id: 'active' as OrderSubTab, label: 'Active' },
                { id: 'delivered' as OrderSubTab, label: 'Delivered' },
              ]).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setOrderSubTab(id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    orderSubTab === id ? 'bg-charcoal text-white' : 'bg-white border border-border text-charcoal hover:bg-cream'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {(ordersLoading && orderSubTab === 'active') || (deliveredLoading && orderSubTab === 'delivered') ? (
              <div className="flex items-center gap-2 text-muted py-12 justify-center">
                <Loader2 className="animate-spin" size={20} />
                Loading…
              </div>
            ) : (
              <>
                {orderSubTab === 'active' && !ordersLoading && activeOrders.length === 0 && (
                  <div className="bg-white border border-dashed border-border rounded-2xl p-12 text-center">
                    <Package size={24} className="text-muted mx-auto mb-3" />
                    <p className="text-charcoal font-medium">No active orders</p>
                    <p className="text-muted text-sm mt-1">Your pending and confirmed orders will appear here.</p>
                  </div>
                )}
                {orderSubTab === 'delivered' && !deliveredLoading && deliveredHistory.length === 0 && (
                  <div className="bg-white border border-dashed border-border rounded-2xl p-12 text-center">
                    <Truck size={24} className="text-muted mx-auto mb-3" />
                    <p className="text-charcoal font-medium">No delivered orders yet</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orderSubTab === 'active' && !ordersLoading && activeOrders.map((o) => (
                    <OrderCard key={o.id} order={o} onDownloadInvoice={handleDownloadInvoice} onViewInvoice={handleViewInvoice} invoiceLoading={invoiceLoading} />
                  ))}
                  {orderSubTab === 'delivered' && !deliveredLoading && deliveredHistory.map((o) => (
                    <OrderCard key={o.id} order={o} onDownloadInvoice={handleDownloadInvoice} onViewInvoice={handleViewInvoice} invoiceLoading={invoiceLoading} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Profile */}
        {tab === 'profile' && (
          <div className="max-w-md">
            <div className="bg-white rounded-2xl border border-border p-5 shadow-card">
              <h3 className="font-semibold text-charcoal mb-5">Your profile</h3>
              <form onSubmit={handleSubmit(onProfileSave)} className="space-y-4">
                <FormInput
                  label="Full name"
                  error={errors.name?.message}
                  {...register('name', { required: 'Name is required' })}
                />
                <FormInput
                  label="Email"
                  readOnly
                  className="bg-cream/80 cursor-not-allowed"
                  hint="Email cannot be changed"
                  {...register('email')}
                />
                <FormInput
                  label="Phone (optional)"
                  placeholder="+91 98765 43210"
                  {...register('phone')}
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-charcoal text-white text-sm font-semibold rounded-xl hover:bg-accent transition-colors"
                >
                  <Save size={15} />
                  Save changes
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Cart */}
        {tab === 'cart' && (
          <div>
            {items.length === 0 ? (
              <div className="bg-white border border-dashed border-border rounded-2xl p-12 text-center">
                <ShoppingCart size={24} className="text-muted mx-auto mb-3" />
                <p className="text-charcoal font-medium">Your cart is empty</p>
                <p className="text-muted text-sm mt-1">Browse products and add items here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-border px-4 shadow-card">
                {items.map((i) => (
                  <CartItemRow key={i.product.id} item={i} />
                ))}
                <div className="flex justify-between items-center py-4 border-t border-border">
                  <span className="font-semibold text-charcoal">Total</span>
                  <span className="font-display text-xl font-bold text-charcoal">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {tab === 'messages' && (
          <div className="space-y-4">
            {contactsLoading ? (
              <div className="flex items-center justify-center gap-2 text-muted py-16">
                <Loader2 className="animate-spin" size={20} />
                Loading…
              </div>
            ) : contacts.length === 0 ? (
              <div className="bg-white border border-dashed border-border rounded-2xl p-12 text-center">
                <MessageSquare size={24} className="text-muted mx-auto mb-3" />
                <p className="text-charcoal font-medium">No messages yet</p>
                <p className="text-muted text-sm mt-1">Messages you send via Contact will appear here.</p>
              </div>
            ) : (
              contacts.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-border p-4 shadow-card space-y-3">
                  <div className="flex flex-wrap justify-between gap-2 text-sm">
                    <span className="font-semibold text-charcoal">{c.productName}</span>
                    <span className="text-xs text-muted">{formatDate(c.createdAt)}</span>
                  </div>
                  <div className="rounded-xl bg-cream p-3 text-sm text-charcoal">
                    <p className="text-[11px] font-semibold text-muted mb-1 uppercase tracking-wide">Your message</p>
                    <p>{c.message}</p>
                  </div>
                  {c.response ? (
                    <div className="rounded-xl border border-accent/25 bg-accent/5 p-3 text-sm">
                      <p className="text-[11px] font-semibold text-accent mb-1 uppercase tracking-wide">Store reply</p>
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

    {viewingOrderId && (
      <InvoiceModal
        orderId={viewingOrderId}
        onClose={() => setViewingOrderId(null)}
      />
    )}
    {showLogoutConfirm && (
      <LogoutConfirmModal
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    )}
    </>
  )
}
