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
    <div className="flex gap-4 py-5 border-b border-border last:border-0 animate-fade-in">
      <Link to={productPath(product)} className="shrink-0">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-20 h-20 object-cover rounded-xl bg-gray-50"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <Link
            to={productPath(product)}
            className="font-medium text-charcoal text-sm hover:text-accent transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          <button
            onClick={() => removeItem(product.id)}
            className="shrink-0 text-muted hover:text-red-500 transition-colors"
            title="Remove"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <p className="text-xs text-muted mt-0.5">{product.category}</p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-1 py-1">
            <button
              onClick={() => updateQty(product.id, quantity - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-charcoal transition-colors"
            >
              <Minus size={13} />
            </button>
            <span className="w-6 text-center text-sm font-medium text-charcoal">{quantity}</span>
            <button
              onClick={() => updateQty(product.id, quantity + 1)}
              disabled={quantity >= product.stock}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-charcoal transition-colors disabled:opacity-40"
            >
              <Plus size={13} />
            </button>
          </div>
          <span className="font-display font-semibold text-charcoal">
            {formatPrice(product.price * quantity)}
          </span>
        </div>
      </div>
    </div>
  )
}
