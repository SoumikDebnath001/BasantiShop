import { ShoppingCart, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Product } from '../types'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatPrice } from '../utils/format'
import { productPath } from '../utils/productUrl'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      showToast('Please sign in to add items to your cart.', 'info')
      return
    }
    addItem(product)
    showToast(`${product.name} added to cart`, 'success')
  }

  const avg = product.averageRating ?? 0
  const hasRating = (product.ratingCount ?? 0) > 0
  const isOutOfStock = product.stock === 0

  return (
    <Link
      to={productPath(product)}
      className="group bg-white rounded-2xl overflow-hidden border border-border hover:border-accent/30 hover:shadow-card-hover transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-border">
            <ShoppingCart size={32} />
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-semibold text-muted bg-white px-3 py-1.5 rounded-full border border-border">
              Out of stock
            </span>
          </div>
        )}

        {/* Category chip */}
        <div className="absolute top-2.5 left-2.5">
          <span className="text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-muted px-2 py-1 rounded-full border border-border/60 uppercase tracking-wide">
            {product.category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col flex-1">
        <h3 className="font-semibold text-charcoal text-sm leading-snug line-clamp-2 mb-1">
          {product.name}
        </h3>

        {/* Rating */}
        {hasRating && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs text-muted font-medium">
              {avg.toFixed(1)} <span className="font-normal">({product.ratingCount})</span>
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/60">
          <span className="font-display text-base font-bold text-charcoal">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex items-center gap-1.5 px-3 py-2 bg-charcoal text-white text-xs font-semibold rounded-xl hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart size={13} />
            Add
          </button>
        </div>
      </div>
    </Link>
  )
}
