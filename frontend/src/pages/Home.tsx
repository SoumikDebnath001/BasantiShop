import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { ArrowRight, Zap, Shield, Truck, RefreshCw, Star, X, ChevronRight } from 'lucide-react'
import ContactModal from '../components/ContactModal'
import { useAuth } from '../context/AuthContext'
import { shopReviewService } from '../services/shopReviewService'
import { homepageService } from '../services/homepageService'
import { categoryService } from '../services/categoryService'
import type { ShopReview, HomepageContent, CategoryDTO } from '../types'
import { SHOP_NAME } from '../constants/brand'

const FEATURES = [
  { icon: Zap, title: 'Live inventory', desc: 'Browse real-time stock with clear prices.' },
  { icon: Shield, title: 'Simple booking', desc: 'Add to cart and place an order in seconds.' },
  { icon: Truck, title: 'Pickup & delivery', desc: 'Collect from store or arrange delivery.' },
  { icon: RefreshCw, title: 'Growing catalog', desc: 'New products added regularly.' },
]

const HOW_STEPS = [
  { step: '1', title: 'Create an account', desc: 'Register with your email to access the catalog and track your orders.' },
  { step: '2', title: 'Browse & add to cart', desc: 'Explore products by category. Add what you want to your cart.' },
  { step: '3', title: 'Place your order', desc: 'Confirm your order and we\'ll contact you to arrange delivery.' },
]

const DEFAULT_CONTENT: Omit<HomepageContent, 'id' | 'updatedAt'> = {
  heroHeadline: 'Quality variety, thoughtfully stocked.',
  heroSubtext: 'A local variety store — browse our catalog of products after creating a free account.',
  heroCta: 'Shop Now',
  announcementBanner: null,
  announcementEnabled: false,
  aboutTitle: 'About Basanti',
  aboutText: 'Basanti Variety Store brings together everyday essentials and specialty finds in one place. We believe shopping should be simple, personal, and reliable.',
}

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [contactOpen, setContactOpen] = useState(false)
  const [reviews, setReviews] = useState<ShopReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [content, setContent] = useState<Omit<HomepageContent, 'id' | 'updatedAt'>>(DEFAULT_CONTENT)
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [bannerDismissed, setBannerDismissed] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      shopReviewService.listPublic().catch(() => [] as ShopReview[]),
      homepageService.get().catch(() => null),
      categoryService.list().catch(() => [] as CategoryDTO[]),
    ]).then(([rev, hp, cats]) => {
      if (cancelled) return
      setReviews(rev)
      setReviewsLoading(false)
      if (hp) setContent(hp)
      setCategories(cats.slice(0, 8))
    })
    return () => { cancelled = true }
  }, [])

  const showBanner = content.announcementEnabled && content.announcementBanner && !bannerDismissed

  return (
    <div className="animate-fade-in">
      <Seo
        title={`${SHOP_NAME} — Home`}
        description={`${SHOP_NAME}: browse categories when signed in, read reviews, and learn how ordering works.`}
      />

      {/* ── Announcement banner ── */}
      {showBanner && (
        <div className="bg-accent text-white px-4 py-3 flex items-center justify-center gap-3 text-sm font-medium">
          <span className="text-center">{content.announcementBanner}</span>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className="shrink-0 p-0.5 rounded hover:bg-white/20 transition-colors"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-charcoal text-white min-h-[100svh] flex items-center">
        {/* Gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(ellipse at 20% 60%, rgba(200,149,108,0.22) 0%, transparent 55%), radial-gradient(ellipse at 80% 15%, rgba(163,114,78,0.15) 0%, transparent 45%)',
          }} />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 bg-white/10 rounded-full border border-white/15">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent/90">{SHOP_NAME}</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-bold leading-[1.06] mb-6 max-w-2xl" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
            {content.heroHeadline.includes(',') ? (
              <>
                {content.heroHeadline.split(',')[0]},
                <br />
                <span className="text-accent italic">
                  {content.heroHeadline.split(',').slice(1).join(',').trim()}
                </span>
              </>
            ) : (
              <span className="text-accent italic">{content.heroHeadline}</span>
            )}
          </h1>

          {/* Subtext */}
          <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-md">
            {content.heroSubtext}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xs sm:max-w-none">
            {isAuthenticated ? (
              <Link
                to="/categories"
                className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-7 py-4 rounded-2xl transition-all hover:shadow-lg hover:shadow-accent/25 text-[15px]"
              >
                {content.heroCta} <ArrowRight size={17} />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-7 py-4 rounded-2xl transition-all hover:shadow-lg hover:shadow-accent/25 text-[15px]"
                >
                  {content.heroCta} <ArrowRight size={17} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-medium px-7 py-4 rounded-2xl transition-all text-[15px]"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>

          {/* Trust pills */}
          <div className="mt-12 flex flex-wrap gap-3">
            {FEATURES.slice(0, 3).map(({ icon: Icon, title }) => (
              <div key={title} className="flex items-center gap-1.5 text-white/45 text-xs font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <Icon size={13} className="text-accent/70" />
                {title}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25 hidden md:flex">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/25 to-transparent" />
        </div>
      </section>

      {/* ── Category chips ── */}
      {categories.length > 0 && (
        <section className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Categories</span>
              <div className="h-px flex-1 bg-border" />
              {isAuthenticated && (
                <Link to="/categories" className="text-xs text-accent font-medium hover:underline flex items-center gap-0.5 shrink-0">
                  All <ChevronRight size={12} />
                </Link>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-none" style={{ scrollbarWidth: 'none' }}>
              {categories.map((cat) =>
                isAuthenticated ? (
                  <Link
                    key={cat.id}
                    to={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="shrink-0 px-4 py-2 rounded-full border border-border text-sm font-medium text-charcoal hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
                  >
                    {cat.name}
                  </Link>
                ) : (
                  <Link
                    key={cat.id}
                    to="/register"
                    className="shrink-0 px-4 py-2 rounded-full border border-border text-sm font-medium text-muted hover:border-charcoal hover:text-charcoal transition-all"
                  >
                    {cat.name}
                  </Link>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ── */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 scroll-mt-20">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 block">Simple process</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-4">How it works</h2>
          <p className="text-muted max-w-md mx-auto leading-relaxed text-sm md:text-base">
            Ordering is designed to be straightforward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {HOW_STEPS.map(({ step, title, desc }) => (
            <div key={step} className="bg-white rounded-2xl border border-border p-6 md:p-8 relative">
              <span className="font-display text-5xl md:text-6xl font-black text-border leading-none block mb-5">
                {step}
              </span>
              <h3 className="font-semibold text-charcoal text-lg mb-2">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── About / Features ── */}
      <section id="about" className="bg-charcoal text-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 block">Our story</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-5 leading-tight">{content.aboutTitle}</h2>
              <p className="text-white/60 leading-relaxed text-base md:text-lg">{content.aboutText}</p>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 mt-8 bg-accent hover:bg-accent-dark text-white font-semibold px-6 py-4 rounded-2xl transition-all text-[15px]"
                >
                  Get started <ArrowRight size={16} />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white/5 hover:bg-white/8 rounded-2xl p-5 border border-white/8 transition-colors">
                  <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center mb-3">
                    <Icon size={18} className="text-accent" />
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
                  <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 scroll-mt-20">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 block">Testimonials</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-3">Customer reviews</h2>
          <p className="text-muted max-w-sm mx-auto text-sm">What shoppers have shared about their experience.</p>
        </div>

        {reviewsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-5 animate-skeleton-pulse h-32" />
            ))}
          </div>
        )}

        {!reviewsLoading && reviews.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-border border-dashed">
            <Star size={28} className="text-border mx-auto mb-3" />
            <p className="text-muted text-sm">No reviews yet — be the first after you shop with us.</p>
          </div>
        )}

        {!reviewsLoading && reviews.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {reviews.slice(0, 6).map((r) => (
              <article
                key={r.id}
                className="bg-white rounded-2xl border border-border p-5 shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-charcoal rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {r.user?.name?.[0]?.toUpperCase() ?? 'C'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{r.user?.name ?? 'Customer'}</p>
                      <p className="text-[11px] text-muted">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5" aria-label={`${r.rating} out of 5`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-border fill-border'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-charcoal text-sm leading-relaxed line-clamp-3">{r.message}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-charcoal p-10 md:p-16 text-white text-center">
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 70% 40%, #C8956C, transparent 60%)' }} />
          <div className="relative">
            <span className="text-accent text-xs font-semibold uppercase tracking-widest mb-4 block">Ready?</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Ready when you are
            </h2>
            <p className="text-white/55 text-base mb-8 max-w-sm mx-auto leading-relaxed">
              Sign in to browse and order. We'll follow up after you place your order.
            </p>
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-4 rounded-2xl transition-all hover:shadow-xl hover:shadow-accent/25 text-[15px]"
                >
                  Create free account <ArrowRight size={17} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white font-medium px-8 py-4 rounded-2xl transition-all text-[15px]"
                >
                  Sign in
                </Link>
              </div>
            ) : (
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-4 rounded-2xl transition-all text-[15px]"
              >
                Browse categories <ArrowRight size={17} />
              </Link>
            )}
          </div>
        </div>
      </section>

      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  )
}
