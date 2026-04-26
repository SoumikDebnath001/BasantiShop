import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  LogOut,
  ShieldCheck,
  ArrowLeft,
  ClipboardList,
  TrendingUp,
  MessageSquare,
  Mail,
  ScrollText,
  FolderTree,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/orders', icon: ClipboardList, label: 'Orders' },
  { to: '/admin/analytics', icon: TrendingUp, label: 'Profit & loss' },
  { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
  { to: '/admin/contact-messages', icon: Mail, label: 'Contact messages' },
  { to: '/admin/products', icon: Package, label: 'Manage Products' },
  { to: '/admin/products/new', icon: PlusCircle, label: 'Add Product' },
  { to: '/admin/shop-reviews', icon: MessageSquare, label: 'Shop reviews' },
  { to: '/admin/logs', icon: ScrollText, label: 'Activity log' },
]

export default function AdminLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="w-60 bg-charcoal text-white flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={18} className="text-accent" />
            <span className="font-display font-semibold text-lg">Admin</span>
          </div>
          <p className="text-xs text-white/40 truncate">{user?.email}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/10 space-y-1">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
            View Store
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
