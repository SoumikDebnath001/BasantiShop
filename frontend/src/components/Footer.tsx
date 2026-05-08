import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Instagram, Twitter, Facebook, Mail, LogOut } from 'lucide-react'
import { SHOP_NAME } from '../constants/brand'
import { useAuth } from '../context/AuthContext'
import LogoutConfirmModal from './LogoutConfirmModal'

export default function Footer() {
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
    <footer className="bg-charcoal text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-8 md:mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-display font-bold">B</span>
              </div>
              <span className="font-display text-lg font-semibold tracking-tight">{SHOP_NAME}</span>
            </div>
            <p className="text-white/55 text-sm leading-relaxed max-w-xs">
              Everyday essentials and variety, with a simple order flow and personal follow-up from our team.
            </p>
            <div className="flex gap-2.5 mt-5">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label="Social media"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/#how-it-works', label: 'How it works' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-white/55 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-4">Account</h4>
            <ul className="space-y-2.5">
              {isAuthenticated ? (
                <>
                  {!isAdmin && (
                    <li>
                      <Link to="/dashboard" className="text-sm text-white/55 hover:text-white transition-colors">
                        My dashboard
                      </Link>
                    </li>
                  )}
                  {isAdmin && (
                    <li>
                      <Link to="/admin" className="text-sm text-white/55 hover:text-white transition-colors">
                        Admin panel
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to="/contact" className="text-sm text-white/55 hover:text-white transition-colors">
                      Contact us
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setShowLogoutConfirm(true)}
                      className="flex items-center gap-1.5 text-sm text-red-400/80 hover:text-red-400 transition-colors"
                    >
                      <LogOut size={13} />
                      Sign out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  {[
                    { to: '/login', label: 'Sign in' },
                    { to: '/register', label: 'Register' },
                    { to: '/contact', label: 'Contact us' },
                  ].map(({ to, label }) => (
                    <li key={to}>
                      <Link to={to} className="text-sm text-white/55 hover:text-white transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} {SHOP_NAME}. All rights reserved.
          </p>
          <a
            href="mailto:basantistore7@gmail.com"
            className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white transition-colors"
          >
            <Mail size={12} />
            basantistore7@gmail.com
          </a>
        </div>
      </div>
    </footer>

    {showLogoutConfirm && (
      <LogoutConfirmModal
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    )}
  </>
  )
}
