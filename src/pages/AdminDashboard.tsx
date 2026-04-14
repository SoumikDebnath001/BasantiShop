import { useState, useEffect, useCallback } from 'react'
import { Package, ShoppingCart, TrendingUp, ArrowRight, ClipboardList, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/format'
import { orderService } from '../services/orderService'
import { analyticsService } from '../services/analyticsService'
import { productService } from '../services/productService'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [pendingOrderCount, setPendingOrderCount] = useState(0)
  const [productTotal, setProductTotal] = useState(0)
  const [pl, setPl] = useState<{ totalSales: number; totalProfit: number; totalLoss: number; orderCount: number } | null>(
    null
  )

  const loadDashboardData = useCallback(async () => {
    const [ordersResult, productsResult, analyticsResult] = await Promise.allSettled([
      orderService.getAllOrders(),
      productService.getProductsAdmin({ limit: 1 }),
      analyticsService.getProfitLoss(),
    ])

    if (ordersResult.status === 'fulfilled') {
      setPendingOrderCount(ordersResult.value.filter((o) => o.status === 'PENDING').length)
    } else {
      setPendingOrderCount(0)
    }

    if (productsResult.status === 'fulfilled') {
      setProductTotal(productsResult.value.total)
    } else {
      setProductTotal(0)
    }

    if (analyticsResult.status === 'fulfilled') {
      setPl(analyticsResult.value.summary)
    } else {
      setPl(null)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const net = pl ? pl.totalProfit - pl.totalLoss : null

  const stats = [
    { icon: Package, label: 'Total Products', value: String(productTotal), color: 'bg-blue-50 text-blue-600' },
    { icon: ShoppingCart, label: 'Pending Orders', value: String(pendingOrderCount), color: 'bg-amber-50 text-amber-600' },
    {
      icon: DollarSign,
      label: 'Total sales (confirmed)',
      value: pl ? formatPrice(pl.totalSales) : '—',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: TrendingUp,
      label: 'Net profit',
      value: net != null ? formatPrice(net) : '—',
      color: 'bg-purple-50 text-purple-600',
    },
  ]

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-charcoal">
          Welcome, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-muted text-sm mt-1">Here's what's happening in your store</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="font-display text-2xl font-bold text-charcoal">{value}</p>
            <p className="text-muted text-sm mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-charcoal">Profit &amp; loss</h3>
            <Link to="/admin/analytics" className="text-xs text-muted hover:text-charcoal flex items-center gap-1">
              Details <ArrowRight size={12} />
            </Link>
          </div>
          {pl ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Gross profit (sum of wins)</dt>
                <dd className="font-medium text-charcoal">{formatPrice(pl.totalProfit)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Losses (negative margins)</dt>
                <dd className="font-medium text-charcoal">{formatPrice(pl.totalLoss)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <dt className="text-muted">Orders in scope</dt>
                <dd className="font-medium text-charcoal">{pl.orderCount}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted">Load analytics to see breakdown.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-charcoal mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/admin/products/new"
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent/30 hover:bg-cream transition-all group"
            >
              <div className="w-9 h-9 bg-cream rounded-xl flex items-center justify-center group-hover:bg-accent/10">
                <Package size={16} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal">Add New Product</p>
                <p className="text-xs text-muted">Create a product listing</p>
              </div>
              <ArrowRight size={14} className="text-muted ml-auto" />
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent/30 hover:bg-cream transition-all group"
            >
              <div className="w-9 h-9 bg-cream rounded-xl flex items-center justify-center group-hover:bg-accent/10">
                <ClipboardList size={16} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal">Manage Orders</p>
                <p className="text-xs text-muted">Lifecycle &amp; negotiation</p>
              </div>
              <ArrowRight size={14} className="text-muted ml-auto" />
            </Link>
            <Link
              to="/admin/shop-reviews"
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent/30 hover:bg-cream transition-all group"
            >
              <div className="w-9 h-9 bg-cream rounded-xl flex items-center justify-center group-hover:bg-accent/10">
                <TrendingUp size={16} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal">Shop reviews</p>
                <p className="text-xs text-muted">Customer feedback</p>
              </div>
              <ArrowRight size={14} className="text-muted ml-auto" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
