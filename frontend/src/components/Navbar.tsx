import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, ChevronDown, Menu, X, LayoutDashboard, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import NavbarSearch from './NavbarSearch'
import { SHOP_NAME } from '../constants/brand'
//@ts-ignore
import logo from '../assets/logo.png'

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
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

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-charcoal' : 'text-muted hover:text-charcoal'}`

  type NavItem = { to: string; label: string; end?: boolean }

  const guestNav: NavItem[] = [
    { to: '/', label: 'Home', end: true },
    { to: '/#about', label: 'About us' },
    { to: '/#reviews', label: 'Reviews' },
    { to: '/#how-it-works', label: 'How it works' },
    { to: '/contact', label: 'Contact' },
  ]

  const customerNav: NavItem[] = [
    { to: '/', label: 'Home', end: true },
    { to: '/categories', label: 'Shop' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-0">
        <div className="flex flex-col gap-2 md:gap-0">
          <div className="flex items-center justify-between gap-3 h-14 md:h-[4.25rem]">
            <Link to="/" className="flex items-center gap-2 shrink-0 min-w-0 max-w-[55%] sm:max-w-none">
              <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
                <img src={logo} alt="" className="w-full h-full object-contain" />
              </div>
              <span className="font-display text-lg sm:text-xl font-semibold text-charcoal tracking-tight truncate">
                {SHOP_NAME}
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 shrink-0">
              {(isAuthenticated && !isAdmin ? customerNav : guestNav).map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={!!end} className={navLinkClass}>
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isAuthenticated && (
              <Link
                to="/cart"
                className="relative p-2 rounded-xl hover:bg-cream text-charcoal transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[1.15rem] h-5 px-1 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div ref={dropdownRef} className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-xl hover:bg-cream transition-colors"
                >
                  <div className="w-8 h-8 bg-charcoal rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">{user?.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-charcoal max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown size={14} className={`text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-border shadow-xl py-1.5 animate-slide-up">
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
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-charcoal hover:text-accent transition-colors px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-charcoal text-white px-4 py-2 rounded-xl hover:bg-accent transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl hover:bg-cream text-charcoal transition-colors md:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          </div>

          {isAuthenticated && !isAdmin && (
            <div className="w-full max-w-2xl md:mx-auto pb-1 md:pb-3 md:pt-0 border-t border-border/70 md:border-t-0 pt-2 md:mt-0">
              <NavbarSearch />
            </div>
          )}
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-1 animate-slide-up">
            {(isAuthenticated && !isAdmin ? customerNav : guestNav).map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={!!end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-cream text-charcoal' : 'text-muted hover:text-charcoal hover:bg-cream/80'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <hr className="border-border my-2" />
            {isAuthenticated ? (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-charcoal hover:bg-cream"
                >
                  <User size={15} />
                  {isAdmin ? 'Admin panel' : 'Dashboard'}
                </Link>
                {isAuthenticated && !isAdmin && (
                  <Link
                    to="/cart"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-charcoal hover:bg-cream"
                  >
                    <ShoppingCart size={15} />
                    Cart
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    handleLogout()
                    setMobileOpen(false)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center text-sm font-medium border border-border py-2.5 rounded-xl text-charcoal hover:bg-cream"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center text-sm font-medium bg-charcoal text-white py-2.5 rounded-xl hover:bg-accent"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
