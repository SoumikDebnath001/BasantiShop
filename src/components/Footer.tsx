import { Link } from 'react-router-dom'
import { Instagram, Twitter, Facebook, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-charcoal text-xs font-display font-bold">L</span>
              </div>
              <span className="font-display text-xl font-semibold tracking-tight">Luxe</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Curated products for a thoughtful life. Quality over quantity, always.
            </p>
            <div className="flex gap-3 mt-5">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {['Products', 'New Arrivals', 'Best Sellers', 'Sale'].map((item) => (
                <li key={item}>
                  <Link
                    to="/products"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Support</h4>
            <ul className="space-y-2.5">
              {['Contact Us', 'FAQ', 'Returns', 'Shipping'].map((item) => (
                <li key={item}>
                  <Link to="/contact" className="text-sm text-white/60 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} Luxe. All rights reserved.</p>
          <a href="mailto:hello@luxe.com" className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors">
            <Mail size={13} />
            hello@luxe.com
          </a>
        </div>
      </div>
    </footer>
  )
}
