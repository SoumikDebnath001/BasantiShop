import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import LogoutConfirmModal from '../components/LogoutConfirmModal'
import {
  LayoutDashboard, Package, PlusCircle, LogOut, ShieldCheck,
  ArrowLeft, ClipboardList, TrendingUp, MessageSquare, Mail,
  ScrollText, FolderTree, Home, Menu, X, Receipt,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/orders', icon: ClipboardList, label: 'Orders' },
  { to: '/admin/bills', icon: Receipt, label: 'Bills' },
  { to: '/admin/analytics', icon: TrendingUp, label: 'Profit & loss' },
  { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
  { to: '/admin/contact-messages', icon: Mail, label: 'Messages' },
  { to: '/admin/products', icon: Package, label: 'Manage Products' },
  { to: '/admin/products/new', icon: PlusCircle, label: 'Add Product' },
  { to: '/admin/shop-reviews', icon: MessageSquare, label: 'Reviews' },
  { to: '/admin/homepage', icon: Home, label: 'Homepage editor' },
  { to: '/admin/logs', icon: ScrollText, label: 'Activity log' },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
    isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
  }`

export default function AdminLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={17} className="text-accent" />
          <span className="font-display font-semibold text-lg">Admin</span>
        </div>
        <p className="text-xs text-white/40 truncate">{user?.email}</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={navLinkClass}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-0.5">
        <NavLink
          to="/"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <ArrowLeft size={16} />
          View store
        </NavLink>
        <button
          onClick={() => { setSidebarOpen(false); setShowLogoutConfirm(true) }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </>
  )

  return (
    <>
    <div className="min-h-screen bg-cream flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-charcoal text-white flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 bg-charcoal text-white flex flex-col animate-slide-up shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-40 bg-white border-b border-border flex items-center gap-3 px-4 h-14">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-cream transition-colors text-charcoal"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-accent" />
            <span className="font-display font-semibold text-charcoal">Admin</span>
          </div>
        </div>

        <Outlet />
      </div>
    </div>

    {showLogoutConfirm && (
      <LogoutConfirmModal
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    )}
    </>
  )
}
