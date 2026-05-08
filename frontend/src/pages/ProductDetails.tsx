import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, MessageCircle, ArrowLeft, Package, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useProduct } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatPrice } from '../utils/format'
import ContactModal from '../components/ContactModal'
import { TextSkeleton } from '../components/LoadingSkeleton'
import Seo from '../components/Seo'
import { productService } from '../services/productService'
import { getApiErrorMessage } from '../utils/apiError'

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>()
  const { product, isLoading, error, refetch } = useProduct(id!)
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [selectedImg, setSelectedImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [contactOpen, setContactOpen] = useState(false)
  const [ratingBusy, setRatingBusy] = useState(false)
  const [myRatingValue, setMyRatingValue] = useState(0)

  useEffect(() => {
    setMyRatingValue(product?.myRating ?? 0)
  }, [product?.id, product?.myRating])

  const handleAddToCart = () => {
    if (!product) return
    if (!isAuthenticated) {
      showToast('Please sign in to add items to your cart.', 'info')
      navigate('/login', { state: { from: { pathname: `/products/${product.slug || product.id}` } } })
      return
    }
    addItem(product, qty)
    showToast(`${product.name} added to cart`, 'success')
  }

  const submitRating = async (value: number) => {
    if (!product || !isAuthenticated) {
      showToast('Sign in to rate products.', 'info')
      navigate('/login', { state: { from: { pathname: `/products/${product?.slug || product?.id}` } } })
      return
    }
    const previous = myRatingValue
    setMyRatingValue(value)
    setRatingBusy(true)
    try {
      await productService.rateProduct(product.id, value)
      await refetch()
      showToast('Rating saved', 'success')
    } catch (err) {
      setMyRatingValue(previous)
      showToast(getApiErrorMessage(err, 'Could not save rating'), 'error')
    } finally {
      setRatingBusy(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <div className="aspect-square bg-gray-100 rounded-2xl animate-skeleton-pulse" />
          <div className="space-y-4 pt-2">
            <TextSkeleton className="h-3 w-24" />
            <TextSkeleton className="h-8 w-3/4" />
            <TextSkeleton className="h-4 w-full" />
            <TextSkeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Seo title="Product not found" description="The product you are looking for is not available." />
        <h2 className="font-display text-2xl font-bold text-charcoal mb-3">Product not found</h2>
        <p className="text-muted mb-6 text-sm">{error || "This product doesn't exist."}</p>
        <Link to="/categories" className="inline-flex items-center gap-2 bg-charcoal text-white px-5 py-3.5 rounded-2xl text-sm font-semibold hover:bg-accent transition-colors">
          <ArrowLeft size={15} /> Browse categories
        </Link>
      </div>
    )
  }

  const avg = product.averageRating ?? 0
  const count = product.ratingCount ?? 0
  const fullStars = Math.round(avg)
  const desc = product.shortDescription?.slice(0, 155) || product.description.replace(/<[^>]+>/g, '').slice(0, 155)

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-10 animate-fade-in pb-28 md:pb-10">
        <Seo title={product.name} description={desc} />

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted mb-5 flex-wrap" aria-label="Breadcrumb">
          <Link to="/categories" className="hover:text-charcoal transition-colors flex items-center gap-1">
            <ArrowLeft size={12} /> Shop
          </Link>
          <span>/</span>
          <Link
            to={`/products?category=${encodeURIComponent(product.category)}`}
            className="hover:text-charcoal transition-colors max-w-[8rem] truncate"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-charcoal truncate max-w-[10rem] font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {/* ── Image gallery ── */}
          <div>
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-border">
              <img
                src={product.images[selectedImg]}
                alt={`${product.name} — photo ${selectedImg + 1}`}
                className="w-full h-full object-cover"
              />
              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => setSelectedImg((i) => Math.max(0, i - 1))}
                    disabled={selectedImg === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center shadow-card hover:bg-white transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => setSelectedImg((i) => Math.min(product.images.length - 1, i + 1))}
                    disabled={selectedImg === product.images.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center shadow-card hover:bg-white transition-colors disabled:opacity-30"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
              {/* Image count pill */}
              {product.images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-charcoal/70 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  {selectedImg + 1}/{product.images.length}
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2.5 mt-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Show image ${i + 1}`}
                    onClick={() => setSelectedImg(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${selectedImg === i ? 'border-accent' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info ── */}
          <div className="flex flex-col">
            <span className="inline-block text-[11px] font-semibold bg-cream border border-border text-muted px-3 py-1 rounded-full mb-3 uppercase tracking-wide self-start">
              {product.category}
            </span>

            <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal leading-tight mb-3">
              {product.name}
            </h1>

            {/* Average rating */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="flex" aria-label={`Average rating ${avg} out of 5`}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < fullStars ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
                  />
                ))}
              </div>
              <span className="text-sm text-muted">
                {avg.toFixed(1)} <span className="text-xs">({count} rating{count !== 1 ? 's' : ''})</span>
              </span>
            </div>

            {/* Your rating */}
            {isAuthenticated && (
              <div className="mb-4 p-3.5 bg-cream rounded-xl border border-border">
                <p className="text-xs font-medium text-muted mb-2">Rate this product</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      disabled={ratingBusy}
                      aria-label={`Rate ${v} stars`}
                      onClick={() => submitRating(v)}
                      className="p-0.5 rounded disabled:opacity-50"
                    >
                      <Star
                        size={22}
                        className={myRatingValue >= v ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200 hover:text-amber-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <p className="font-display text-3xl font-bold text-charcoal mb-4">
              {formatPrice(product.price)}
            </p>

            {/* Description */}
            <p className="text-muted leading-relaxed text-sm md:text-base mb-5">{product.description}</p>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <Package size={14} className={product.stock > 0 ? 'text-emerald-500' : 'text-red-400'} />
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Desktop: qty + add to cart */}
            {product.stock > 0 && (
              <div className="hidden md:flex gap-3 items-center">
                <div className="flex items-center gap-2 bg-cream border border-border rounded-2xl px-2 py-2">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white text-charcoal font-medium transition-colors text-lg"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold text-charcoal">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white text-charcoal font-medium transition-colors text-lg"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-charcoal text-white font-semibold rounded-2xl hover:bg-accent transition-colors text-[15px]"
                >
                  <ShoppingCart size={18} />
                  Add to cart
                </button>
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="p-4 border border-border rounded-2xl text-muted hover:border-accent/30 hover:bg-accent/5 hover:text-accent transition-all"
                  title="Contact seller"
                  aria-label="Contact seller"
                >
                  <MessageCircle size={18} />
                </button>
              </div>
            )}

            {/* Desktop: out of stock */}
            {product.stock === 0 && (
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="hidden md:flex items-center justify-center gap-2 py-4 border border-border rounded-2xl text-charcoal hover:border-accent/30 hover:bg-accent/5 transition-all font-semibold text-[15px]"
              >
                <MessageCircle size={18} />
                Ask about availability
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky bottom bar (mobile only) ── */}
      <div className="md:hidden fixed bottom-16 inset-x-0 z-30 bg-white border-t border-border px-4 py-3">
        {product.stock > 0 ? (
          <div className="flex items-center gap-3">
            {/* Qty stepper */}
            <div className="flex items-center gap-1.5 bg-cream border border-border rounded-xl px-1.5 py-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-charcoal font-medium"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-bold text-charcoal">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-charcoal font-medium"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-charcoal text-white font-semibold rounded-2xl hover:bg-accent transition-colors text-sm"
            >
              <ShoppingCart size={16} />
              Add to cart — {formatPrice(product.price * qty)}
            </button>

            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="p-3.5 border border-border rounded-2xl text-muted hover:text-accent hover:border-accent/30 transition-all shrink-0"
              aria-label="Contact seller"
            >
              <MessageCircle size={18} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 border border-border rounded-2xl text-charcoal font-semibold text-sm"
          >
            <MessageCircle size={16} />
            Ask about availability
          </button>
        )}
      </div>

      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        productName={product.name}
        productId={product.id}
      />
    </>
  )
}
