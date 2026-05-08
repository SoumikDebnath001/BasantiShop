import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingCart, User, ChevronDown, LogOut, Shield,
  Search, Home, Tag, X, LayoutDashboard,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import NavbarSearch from './NavbarSearch'
import LogoutConfirmModal from './LogoutConfirmModal'
import { SHOP_NAME } from '../constants/brand'
//@ts-ignore
import logo from '../assets/logo.png'

function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close search on route change
  useEffect(() => { setSearchOpen(false) }, [location.pathname])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  const guestDesktopNav = [
    { to: '/', label: 'Home', end: true },
    { to: '/#about', label: 'About' },
    { to: '/#reviews', label: 'Reviews' },
    { to: '/#how-it-works', label: 'How it works' },
    { to: '/contact', label: 'Contact' },
  ]
  const customerDesktopNav = [
    { to: '/', label: 'Home', end: true },
    { to: '/categories', label: 'Shop' },
    { to: '/contact', label: 'Contact' },
  ]
  const desktopNav = isAuthenticated && !isAdmin ? customerDesktopNav : guestDesktopNav

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative text-sm font-medium transition-colors py-1
      ${isActive
        ? 'text-charcoal after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-accent after:rounded-full'
        : 'text-muted hover:text-charcoal'
      }`

  /* ── Bottom nav tabs ── */
  const bottomTabs = [
    { to: '/', icon: Home, label: 'Home', end: true },
    { to: '/categories', icon: Tag, label: 'Shop', end: false },
    { to: '/cart', icon: ShoppingCart, label: 'Cart', end: false },
    { to: '/dashboard', icon: User, label: 'Me', end: false },
  ]

  return (
    <>
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16 gap-3">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label={SHOP_NAME}>
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <img src={logo} alt="" className="w-full h-full object-contain" />
              </div>
              <span className="font-display text-[14px] sm:text-[17px] font-semibold text-charcoal tracking-tight leading-none">
                {SHOP_NAME}
              </span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-7">
              {desktopNav.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={!!end} className={navLinkClass}>
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1">

              {/* Search toggle (customers on mobile) */}
              {isAuthenticated && !isAdmin && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(!searchOpen)}
                  className={`md:hidden p-2.5 rounded-xl transition-colors ${searchOpen ? 'bg-cream text-charcoal' : 'text-muted hover:text-charcoal hover:bg-cream'}`}
                  aria-label={searchOpen ? 'Close search' : 'Search'}
                >
                  {searchOpen ? <X size={20} /> : <Search size={20} />}
                </button>
              )}

              {/* Cart (customers — desktop only; mobile has bottom nav) */}
              {isAuthenticated && !isAdmin && (
                <Link
                  to="/cart"
                  className="relative p-2.5 rounded-xl hover:bg-cream text-charcoal transition-colors hidden md:inline-flex"
                  aria-label={`Cart — ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
                >
                  <ShoppingCart size={20} />
                  <CartBadge count={totalItems} />
                </Link>
              )}

              {/* User dropdown (desktop) */}
              {isAuthenticated ? (
                <div ref={dropdownRef} className="relative hidden md:block">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl hover:bg-cream transition-colors"
                    aria-expanded={dropdownOpen}
                  >
                    <div className="w-8 h-8 bg-charcoal rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-semibold">
                        {user?.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-charcoal max-w-[90px] truncate hidden lg:block">
                      {user?.name}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`text-muted transition-transform hidden lg:block ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-border shadow-card-hover py-1.5 animate-slide-up">
                      <div className="px-4 py-3 border-b border-border/60 mb-1">
                        <p className="text-sm font-medium text-charcoal truncate">{user?.name}</p>
                        <p className="text-xs text-muted truncate">{user?.email}</p>
                      </div>
                      {isAdmin ? (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-cream transition-colors"
                        >
                          <Shield size={15} className="text-muted" />
                          Admin panel
                        </Link>
                      ) : (
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-cream transition-colors"
                        >
                          <LayoutDashboard size={15} className="text-muted" />
                          Dashboard
                        </Link>
                      )}
                      <hr className="my-1 border-border" />
                      <button
                        type="button"
                        onClick={() => { setDropdownOpen(false); setShowLogoutConfirm(true) }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} />
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-charcoal hover:text-accent transition-colors px-3 py-2 rounded-xl hover:bg-cream"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-semibold bg-charcoal text-white px-4 py-2.5 rounded-xl hover:bg-accent transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile: guest login/register buttons */}
              {!isAuthenticated && (
                <div className="flex items-center gap-1.5 md:hidden">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-charcoal px-3 py-2 rounded-xl hover:bg-cream transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-semibold bg-charcoal text-white px-4 py-2.5 rounded-xl hover:bg-accent transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile search bar — slides down when toggled */}
          {searchOpen && isAuthenticated && !isAdmin && (
            <div className="md:hidden pb-3 animate-slide-down">
              <NavbarSearch />
            </div>
          )}

          {/* Desktop search bar — always shown for auth customers */}
          {isAuthenticated && !isAdmin && (
            <div className="hidden md:block pb-3">
              <NavbarSearch />
            </div>
          )}
        </div>
      </header>

      {/* ── Mobile bottom nav (auth customers only) ── */}
      {isAuthenticated && !isAdmin && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-border pb-safe">
          <div className="flex">
            {bottomTabs.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center gap-0.5 py-2.5 relative transition-colors ${
                    isActive ? 'text-accent' : 'text-muted'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <Icon size={22} strokeWidth={isActive ? 2 : 1.75} />
                      {to === '/cart' && <CartBadge count={totalItems} />}
                    </div>
                    <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-accent' : 'text-muted'}`}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
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
