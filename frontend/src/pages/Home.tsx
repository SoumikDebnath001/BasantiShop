import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { ArrowRight, Zap, Shield, Truck, RefreshCw } from 'lucide-react'
import ContactModal from '../components/ContactModal'
import { useAuth } from '../context/AuthContext'
import { shopReviewService } from '../services/shopReviewService'
import type { ShopReview } from '../types'
import { SHOP_NAME } from '../constants/brand'

const WHY_US = [
  {
    icon: Zap,
    title: 'Live inventory',
    desc: 'Signed-in customers browse real-time stock and clear prices before they order.',
  },
  {
    icon: Shield,
    title: 'Simple booking',
    desc: 'Add items to your cart and place an order with your phone number. No online payment on the site.',
  },
  {
    icon: Truck,
    title: 'Pickup & delivery',
    desc: 'Pick up from the store or arrange delivery where available.',
  },
  {
    icon: RefreshCw,
    title: 'Growing catalog',
    desc: 'We are expanding categories and products regularly.',
  },
]

const HOW_STEPS = [
  { step: '1', title: 'Create an account', desc: 'Register with your email so we can link your orders and cart.' },
  { step: '2', title: 'Browse by category', desc: 'After login, open Shop by category and choose what you need.' },
  { step: '3', title: 'Add to cart & order', desc: 'Add products, review your cart, and submit your order. We will reach out to confirm.' },
]

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [contactOpen, setContactOpen] = useState(false)
  const [reviews, setReviews] = useState<ShopReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setReviewsLoading(true)
    setReviewsError(null)
    shopReviewService
      .listPublic()
      .then((rows) => {
        if (!cancelled) setReviews(rows)
      })
      .catch(() => {
        if (!cancelled) {
          setReviewsError('Reviews could not be loaded.')
          setReviews([])
        }
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="animate-fade-in">
      <Seo
        title={`${SHOP_NAME} — Home`}
        description={`${SHOP_NAME}: browse categories when signed in, read reviews, and learn how ordering works.`}
      />

      <section className="relative overflow-hidden bg-charcoal text-white">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #C8956C 0%, transparent 50%), radial-gradient(circle at 80% 20%, #A3724E 0%, transparent 40%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-4">
              {SHOP_NAME}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
              Quality variety,{' '}
              <span className="italic text-accent">thoughtfully</span> stocked.
            </h1>
            <p className="text-white/65 text-lg leading-relaxed mb-8 max-w-xl">
              We are a local variety store. Create an account to explore categories and products, or learn more about
              us below.
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-medium px-6 py-3.5 rounded-xl transition-colors"
                >
                  Shop by category <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-medium px-6 py-3.5 rounded-xl transition-colors"
                  >
                    Create account <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3.5 rounded-xl backdrop-blur-sm transition-colors border border-white/10"
                  >
                    Sign in
                  </Link>
                </>
              )}
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3.5 rounded-xl backdrop-blur-sm transition-colors"
              >
                Contact us
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-24">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-charcoal mb-3 text-center">
          How it works
        </h2>
        <p className="text-muted text-center text-sm max-w-xl mx-auto mb-12">
          Ordering is designed to be straightforward: browse when logged in, then we follow up with you directly.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_STEPS.map(({ step, title, desc }) => (
            <div
              key={step}
              className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-charcoal text-white text-sm font-bold mb-4">
                {step}
              </span>
              <h3 className="font-semibold text-charcoal mb-2">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="bg-white border-y border-border scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-charcoal text-center mb-4">
            About us
          </h2>
          <p className="text-muted text-center max-w-2xl mx-auto text-sm leading-relaxed mb-12">
            {SHOP_NAME} brings together everyday essentials and specialty finds in one place. We focus on clear pricing,
            honest stock levels, and helping you complete your purchase with a quick follow-up after you place an
            order.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-2xl bg-cream/60 border border-border/80">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Icon size={22} className="text-accent" />
                </div>
                <h3 className="font-semibold text-charcoal mb-2">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-24">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-charcoal text-center mb-3">
          Customer reviews
        </h2>
        <p className="text-muted text-center text-sm mb-10">What shoppers have shared about their experience.</p>

        {reviewsLoading && <p className="text-center text-muted text-sm">Loading reviews…</p>}
        {reviewsError && <p className="text-center text-red-600 text-sm">{reviewsError}</p>}

        {!reviewsLoading && !reviewsError && reviews.length === 0 && (
          <p className="text-center text-muted text-sm">No reviews yet — be the first after you shop with us.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="bg-white rounded-2xl border border-border p-5 shadow-sm hover:border-accent/25 transition-colors"
            >
              <p className="text-sm mb-2" aria-label={`${r.rating} out of 5 stars`}>
                <span className="text-amber-400">{'★'.repeat(r.rating)}</span>
                <span className="text-gray-200">{'★'.repeat(Math.max(0, 5 - r.rating))}</span>
              </p>
              <p className="text-charcoal text-sm leading-relaxed mb-3">{r.message}</p>
              <p className="text-xs text-muted">
                {r.user?.name ?? 'Customer'} · {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-charcoal rounded-3xl p-10 lg:p-16 text-white text-center relative overflow-hidden border border-white/5">
          <div
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #C8956C, transparent 60%)' }}
          />
          <div className="relative">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">Ready when you are</h2>
            <p className="text-white/60 text-lg mb-8 max-w-md mx-auto leading-relaxed">
              Sign in to browse categories and products. We will contact you after you place an order.
            </p>
            {!isAuthenticated ? (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3.5 rounded-xl transition-colors"
              >
                Get started <ArrowRight size={18} />
              </Link>
            ) : (
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3.5 rounded-xl transition-colors"
              >
                Go to categories <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </div>
      </section>

      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  )
}
