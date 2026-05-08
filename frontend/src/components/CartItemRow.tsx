import { Minus, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CartItem } from '../types'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'
import { productPath } from '../utils/productUrl'

export default function CartItemRow({ item }: { item: CartItem }) {
  const { updateQty, removeItem } = useCart()
  const { product, quantity } = item

  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-0 animate-fade-in">
      {/* Thumbnail */}
      <Link to={productPath(product)} className="shrink-0">
        <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-gray-50 border border-border">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={productPath(product)}
              className="font-semibold text-charcoal text-sm leading-snug hover:text-accent transition-colors line-clamp-2"
            >
              {product.name}
            </Link>
            <p className="text-xs text-muted mt-0.5">{product.category}</p>
          </div>
          <button
            onClick={() => removeItem(product.id)}
            className="shrink-0 p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove"
            aria-label="Remove item"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Qty stepper */}
          <div className="flex items-center gap-1 bg-cream border border-border rounded-xl px-1 py-1">
            <button
              onClick={() => updateQty(product.id, quantity - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-charcoal transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={12} />
            </button>
            <span className="w-7 text-center text-sm font-semibold text-charcoal">{quantity}</span>
            <button
              onClick={() => updateQty(product.id, quantity + 1)}
              disabled={quantity >= product.stock}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-charcoal transition-colors disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus size={12} />
            </button>
          </div>

          <span className="font-display font-bold text-charcoal text-[15px]">
            {formatPrice(product.price * quantity)}
          </span>
        </div>
      </div>
    </div>
  )
}
