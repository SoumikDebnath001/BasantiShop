import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, ChevronDown, Menu, X, LayoutDashboard, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
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

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
  <div className="w-20 h-20 flex items-center justify-center">
    <img 
      src={logo} 
      alt="logo" 
      className="w-full h-full object-contain"
    />
  </div>
  
  <span className="font-display text-xl font-semibold text-charcoal tracking-tight">
    Basanti Variety store
  </span>
</Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/products" className={navLinkClass}>Products</NavLink>
            <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <Link
                to="/cart"
                className="relative p-2 rounded-xl hover:bg-gray-100 text-charcoal transition-colors"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* Auth */}
            {isAuthenticated ? (
              <div ref={dropdownRef} className="relative hidden md:block">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 bg-charcoal rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {user?.name?.[0]?.toUpperCase()}
                    </span>
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
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-gray-50 transition-colors"
                      >
                        <Shield size={15} className="text-muted" />
                        Admin Panel
                      </Link>
                    ) : (
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard size={15} className="text-muted" />
                        Dashboard
                      </Link>
                    )}
                    <hr className="my-1 border-border" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
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

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 text-charcoal transition-colors md:hidden"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-1 animate-slide-up">
            {[
              { to: '/', label: 'Home' },
              { to: '/products', label: 'Products' },
              { to: '/contact', label: 'Contact' },
              ...(isAuthenticated ? [{ to: '/cart', label: 'Cart' }] as const : []),
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-gray-100 text-charcoal' : 'text-muted hover:text-charcoal hover:bg-gray-50'}`
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
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-charcoal hover:bg-gray-50"
                >
                  <User size={15} />
                  {isAdmin ? 'Admin Panel' : 'Dashboard'}
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50"
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
                  className="flex-1 text-center text-sm font-medium border border-border py-2.5 rounded-xl text-charcoal hover:bg-gray-50"
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
