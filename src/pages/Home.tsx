import { useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { ArrowRight, Zap, Shield, Truck, RefreshCw } from 'lucide-react'
import ProductGrid from '../components/ProductGrid'
import ContactModal from '../components/ContactModal'
import { useProducts } from '../hooks/useProducts'
import { CATEGORIES } from '../utils/mockData'
const WHY_US = [
  { 
    icon: Zap, 
    title: 'Live Inventory Access', 
    desc: 'Browse real-time stock availability and explore products before visiting the store.' 
  },
  { 
    icon: Shield, 
    title: 'Easy Booking', 
    desc: 'Select items and reserve them instantly using your contact details. No online payment required.' 
  },
  { 
    icon: Truck, 
    title: 'Store Pickup & Delivery', 
    desc: 'Pick up your order from the store or get free delivery on orders above ₹5000.' 
  },
  { 
    icon: RefreshCw, 
    title: 'Growing Platform', 
    desc: 'This is the current version. More features and updates will be added soon.' 
  },
]
export default function Home() {
  const { data, isLoading } = useProducts()
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <div className="animate-fade-in">
      <Seo
        title="Luxe — Curated premium products"
        description="Browse real-time inventory, place orders, and shop curated premium products with store pickup and delivery."
      />
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-charcoal text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #C8956C 0%, transparent 50%), radial-gradient(circle at 80% 20%, #A3724E 0%, transparent 40%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-4">
              New Collection 2024
            </span>
            <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6">
              Crafted for the{' '}
              <span className="italic text-accent">thoughtful</span>{' '}
              life.
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-xl">
              Discover our curated collection of premium products. Each piece is selected for its quality, sustainability, and timeless design.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-medium px-6 py-3.5 rounded-xl transition-colors"
              >
                Shop Now <ArrowRight size={18} />
              </Link>
              <button
                onClick={() => setContactOpen(true)}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3.5 rounded-xl backdrop-blur-sm transition-colors"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-semibold text-charcoal">Browse by Category</h2>
          <Link to="/products" className="text-sm text-muted hover:text-charcoal transition-colors flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${cat}`}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-border hover:border-accent/30 hover:shadow-md transition-all group text-center"
            >
              <div className="w-10 h-10 bg-cream rounded-xl flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                <span className="text-lg">
                  {{'Electronics':'⚡','Clothing':'👕','Home & Garden':'🌿','Books':'📚','Sports':'🏃','Beauty':'✨','Jewelry':'💎'}[cat] || '📦'}
                </span>
              </div>
              <span className="text-xs font-medium text-charcoal">{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-semibold text-charcoal">Featured Products</h2>
            <p className="text-muted text-sm mt-1">Handpicked for quality and style</p>
          </div>
          <Link to="/products" className="text-sm text-muted hover:text-charcoal transition-colors flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid products={data?.data.slice(0, 4) || []} isLoading={isLoading} />
      </section>

      {/* ── Why Us ─────────────────────────────────────────── */}
      <section className="bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-display text-2xl font-semibold text-charcoal text-center mb-10">
            About Our Store
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6">
                <div className="w-12 h-12 bg-cream rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-accent" />
                </div>
                <h3 className="font-semibold text-charcoal mb-2">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <div className="bg-charcoal rounded-3xl p-10 lg:p-16 text-white text-center relative overflow-hidden">
    <div
      className="absolute inset-0 opacity-30"
      style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #C8956C, transparent 60%)' }}
    />
    <div className="relative">
      <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
        Explore Basanti Variety Store
      </h2>
      <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
        Check available stock, book items easily using your contact details, and pick them up from our store.
      </p>
      <Link
        to="/register"
        className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3.5 rounded-xl transition-colors"
      >
        Start Booking <ArrowRight size={18} />
      </Link>
    </div>
  </div>
</section>

      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  )
}
