import { Link } from 'react-router-dom'
import { Instagram, Twitter, Facebook, Mail } from 'lucide-react'
import { SHOP_NAME } from '../constants/brand'

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-display font-bold">B</span>
              </div>
              <span className="font-display text-xl font-semibold tracking-tight">{SHOP_NAME}</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-md">
              Everyday essentials and variety, with a simple order flow and personal follow-up from our team.
            </p>
            <div className="flex gap-3 mt-6">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label="Social"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/45 mb-4">Explore</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-sm text-white/60 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-white/60 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/45 mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/contact" className="text-sm text-white/60 hover:text-white transition-colors">
                  Contact us
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} {SHOP_NAME}. All rights reserved.
          </p>
          <a
            href="mailto:contact@basantivarietystore.example"
            className="flex items-center gap-2 text-xs text-white/45 hover:text-white transition-colors"
          >
            <Mail size={13} />
            contact@basantivarietystore.example
          </a>
        </div>
      </div>
    </footer>
  )
}
