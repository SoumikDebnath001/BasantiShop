import { ShoppingCart, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Product } from '../types'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatPrice, truncate } from '../utils/format'
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

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300">
      <Link to={productPath(product)} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-sm font-medium text-muted bg-white px-3 py-1 rounded-full border border-border">
                Out of stock
              </span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="text-xs font-medium bg-white/90 backdrop-blur-sm text-muted px-2.5 py-1 rounded-full border border-border">
              {product.category}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-5">
        <Link to={productPath(product)}>
          <h3 className="font-semibold text-charcoal text-[15px] leading-snug hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-muted text-sm mt-1.5 leading-relaxed">
          {truncate(product.shortDescription || product.description, 72)}
        </p>

        <div className="flex items-center justify-between mt-4">
          <span className="font-display text-lg font-semibold text-charcoal">
            {formatPrice(product.price)}
          </span>
          <div className="flex gap-2">
            <Link
              to={productPath(product)}
              className="p-2 rounded-xl border border-border hover:border-accent/30 hover:bg-accent/5 text-muted hover:text-accent transition-all"
              title="View details"
            >
              <Eye size={16} />
            </Link>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex items-center gap-1.5 px-3 py-2 bg-charcoal text-white text-xs font-medium rounded-xl hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={14} />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
