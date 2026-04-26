import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { User, ShoppingBag, ShoppingCart, MessageSquare, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { FormInput } from '../components/FormInput'
import CartItemRow from '../components/CartItemRow'
import { formatPrice, formatDate } from '../utils/format'
import { userService } from '../services/userService'
import type { ContactHistoryItem, Order } from '../types'
import { getApiErrorMessage } from '../utils/apiError'
import { orderService } from '../services/orderService'
import { shopReviewService } from '../services/shopReviewService'
import type { OrderStatus } from '../types'

type Tab = 'overview' | 'profile' | 'cart' | 'contacts'

const TABS = [
  { id: 'overview' as Tab, icon: User, label: 'Overview' },
  { id: 'profile' as Tab, icon: User, label: 'Profile' },
  { id: 'cart' as Tab, icon: ShoppingCart, label: 'My Cart' },
  { id: 'contacts' as Tab, icon: MessageSquare, label: 'Contact History' },
]

type ProfileForm = { name: string; email: string; phone: string }

function orderStatusClass(status: OrderStatus) {
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

export default function Dashboard() {
  const { user, updateUser } = useAuth()
  const { items, totalPrice, totalItems } = useCart()
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>('overview')
  const [shopRating, setShopRating] = useState(5)
  const [shopMessage, setShopMessage] = useState('')
  const [shopSubmitting, setShopSubmitting] = useState(false)
  const [contacts, setContacts] = useState<ContactHistoryItem[]>([])
  const [contactsLoading, setContactsLoading] = useState(false)
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: { name: user?.name, email: user?.email, phone: user?.phone || '' },
  })

  useEffect(() => {
    reset({ name: user?.name, email: user?.email, phone: user?.phone || '' })
  }, [user, reset])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setContactsLoading(true)
    userService
      .getContacts()
      .then((res) => {
        if (!cancelled) setContacts(res.data)
      })
      .catch(() => {
        if (!cancelled) setContacts([])
      })
      .finally(() => {
        if (!cancelled) setContactsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setOrdersLoading(true)
    orderService
      .getMyOrders()
      .then((list) => {
        if (!cancelled) setMyOrders(list)
      })
      .catch(() => {
        if (!cancelled) setMyOrders([])
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

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

  const messageCount = contacts.length

  const submitShopReview = async () => {
    if (shopMessage.trim().length < 3) {
      showToast('Please write a short message (at least 3 characters).', 'warning')
      return
    }
    setShopSubmitting(true)
    try {
      await shopReviewService.submitReview(shopRating, shopMessage.trim())
      showToast('Thanks for reviewing our shop!', 'success')
      setShopMessage('')
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not submit review.'), 'error')
    } finally {
      setShopSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-charcoal">
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted mt-1 text-sm">Manage your account and orders</p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden md:block w-52 shrink-0">
          <nav className="space-y-1">
            {TABS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === id ? 'bg-charcoal text-white' : 'text-muted hover:bg-white hover:text-charcoal'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="md:hidden w-full">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  tab === id ? 'bg-charcoal text-white' : 'bg-white text-muted border border-border'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {tab === 'overview' && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: ShoppingCart, label: 'Cart Items', value: totalItems },
                  { icon: ShoppingBag, label: 'Cart Value', value: formatPrice(totalPrice) },
                  { icon: MessageSquare, label: 'Messages Sent', value: messageCount },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white rounded-2xl border border-border p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 bg-cream rounded-xl flex items-center justify-center">
                        <Icon size={16} className="text-accent" />
                      </div>
                      <span className="text-sm text-muted">{label}</span>
                    </div>
                    <p className="font-display text-2xl font-bold text-charcoal">{value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-border p-6">
                <h3 className="font-semibold text-charcoal mb-1">Account Info</h3>
                <p className="text-muted text-sm mb-4">Your current profile details</p>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-muted text-xs uppercase tracking-wide mb-0.5">Name</dt><dd className="text-charcoal font-medium">{user?.name}</dd></div>
                  <div><dt className="text-muted text-xs uppercase tracking-wide mb-0.5">Email</dt><dd className="text-charcoal font-medium">{user?.email}</dd></div>
                  <div><dt className="text-muted text-xs uppercase tracking-wide mb-0.5">Role</dt><dd className="text-charcoal font-medium capitalize">{user?.role}</dd></div>
                  <div><dt className="text-muted text-xs uppercase tracking-wide mb-0.5">Phone</dt><dd className="text-charcoal font-medium">{user?.phone || '—'}</dd></div>
                </dl>
              </div>

              <div className="bg-white rounded-2xl border border-border p-6">
                <h3 className="font-semibold text-charcoal mb-1">Order History</h3>
                {ordersLoading ? (
                  <p className="text-muted text-sm">Loading…</p>
                ) : myOrders.length === 0 ? (
                  <p className="text-muted text-sm">
                    No orders yet.{' '}
                    <Link to="/cart" className="text-charcoal underline">
                      View your cart
                    </Link>
                  </p>
                ) : (
                  <ul className="space-y-2 mt-2">
                    {myOrders.slice(0, 6).map((o) => (
                      <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 text-sm border-b border-border last:border-0 pb-2">
                        <span className="text-charcoal">
                          {formatDate(o.createdAt)} · {formatPrice(o.displayTotal ?? o.totalAmount)}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${orderStatusClass(o.status)}`}>
                          {o.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-border p-6">
                <h3 className="font-semibold text-charcoal mb-1">Review the shop</h3>
                <p className="text-muted text-sm mb-4">Rate your overall experience (not individual products).</p>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      aria-label={`${v} stars`}
                      onClick={() => setShopRating(v)}
                      className={`text-lg ${shopRating >= v ? 'text-amber-400' : 'text-gray-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  value={shopMessage}
                  onChange={(e) => setShopMessage(e.target.value)}
                  placeholder="Tell us about your experience…"
                  rows={3}
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 mb-3"
                />
                <button
                  type="button"
                  disabled={shopSubmitting}
                  onClick={submitShopReview}
                  className="px-5 py-2.5 bg-charcoal text-white text-sm font-medium rounded-xl hover:bg-accent transition-colors disabled:opacity-60"
                >
                  {shopSubmitting ? 'Sending…' : 'Submit shop review'}
                </button>
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div className="bg-white rounded-2xl border border-border p-6 animate-fade-in">
              <h2 className="font-semibold text-charcoal mb-5">Update Profile</h2>
              <form onSubmit={handleSubmit(onProfileSave)} className="space-y-4 max-w-md">
                <FormInput
                  label="Full Name"
                  required
                  error={errors.name?.message}
                  {...register('name', { required: 'Name is required' })}
                />
                <FormInput
                  label="Email"
                  type="email"
                  required
                  error={errors.email?.message}
                  {...register('email', { required: 'Email is required' })}
                />
                <FormInput
                  label="Phone"
                  {...register('phone')}
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white text-sm font-medium rounded-xl hover:bg-accent transition-colors"
                >
                  <Save size={15} /> Save Changes
                </button>
              </form>
            </div>
          )}

          {tab === 'cart' && (
            <div className="animate-fade-in">
              {items.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border p-10 text-center">
                  <ShoppingCart size={28} className="text-muted mx-auto mb-3" />
                  <p className="text-charcoal font-medium">Your cart is empty</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-border px-6">
                  {items.map((item) => <CartItemRow key={item.product.id} item={item} />)}
                  <div className="py-4 flex justify-end">
                    <span className="font-display text-xl font-bold text-charcoal">
                      Total: {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'contacts' && (
            <div className="bg-white rounded-2xl border border-border p-6 animate-fade-in">
              <h2 className="font-semibold text-charcoal mb-4">Contact History</h2>
              {contactsLoading ? (
                <p className="text-sm text-muted">Loading…</p>
              ) : contacts.length === 0 ? (
                <p className="text-sm text-muted">No messages yet.</p>
              ) : (
                <div className="space-y-3">
                  {contacts.map((msg) => (
                    <div key={msg.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-medium text-charcoal line-clamp-1">{msg.productName}</p>
                        <p className="text-xs text-muted line-clamp-2">{msg.preview}</p>
                        <p className="text-xs text-muted mt-1">{formatDate(msg.createdAt)}</p>
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-muted shrink-0">
                        Received
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
