import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, ArrowRight, Trash2, Tag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import CartItemRow from '../components/CartItemRow'
import PlaceOrderModal from '../components/PlaceOrderModal'
import { formatPrice } from '../utils/format'
import Seo from '../components/Seo'

export default function Cart() {
  const { items, clearCart, totalPrice, totalItems } = useCart()
  const [orderOpen, setOrderOpen] = useState(false)

  if (!items.length) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <Seo title="Your cart" description="Your cart is empty." />
        <div className="w-20 h-20 bg-white rounded-3xl border border-border flex items-center justify-center mx-auto mb-5 shadow-card">
          <ShoppingCart size={30} className="text-muted" />
        </div>
        <h2 className="font-display text-2xl font-bold text-charcoal mb-2">Cart is empty</h2>
        <p className="text-muted text-sm mb-8">Browse products and add items to get started.</p>
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 bg-charcoal text-white px-6 py-4 rounded-2xl font-semibold hover:bg-accent transition-colors text-[15px]"
        >
          Browse categories <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <>
      <Seo title="Your cart" description="Review items and place your order." />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 md:py-10 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-charcoal">Your cart</h1>
            <p className="text-muted text-sm mt-0.5">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-red-500 transition-colors py-2 px-3 rounded-xl hover:bg-red-50"
          >
            <Trash2 size={14} />
            Clear
          </button>
        </div>

        {/* Item list */}
        <div className="bg-white rounded-2xl border border-border px-4 md:px-5 mb-4">
          {items.map((item) => (
            <CartItemRow key={item.product.id} item={item} />
          ))}
        </div>

        {/* Order summary card */}
        <div className="bg-white rounded-2xl border border-border p-5 mb-6">
          <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
            <Tag size={15} className="text-accent" />
            Order summary
          </h3>
          <div className="space-y-2 mb-4 pb-4 border-b border-border">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-muted line-clamp-1 max-w-[60%]">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="text-charcoal font-medium shrink-0">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-charcoal">Total</span>
            <span className="font-display text-2xl font-bold text-charcoal">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>

        {/* CTA — hidden on mobile because sticky bar covers it */}
        <div className="hidden md:block space-y-3">
          <button
            type="button"
            onClick={() => setOrderOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-charcoal text-white font-semibold rounded-2xl hover:bg-accent transition-colors text-[15px]"
          >
            Place Order
          </button>
          <Link
            to="/categories"
            className="block text-center text-sm text-muted hover:text-charcoal transition-colors py-2"
          >
            Continue shopping
          </Link>
        </div>
      </div>

      {/* ── Sticky bottom bar (mobile only) ── */}
      <div className="md:hidden fixed bottom-16 inset-x-0 z-30 bg-white border-t border-border px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted">Total</p>
          <p className="font-display text-xl font-bold text-charcoal">{formatPrice(totalPrice)}</p>
        </div>
        <button
          type="button"
          onClick={() => setOrderOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-charcoal text-white font-semibold rounded-2xl hover:bg-accent transition-colors text-sm shrink-0"
        >
          Place Order <ArrowRight size={15} />
        </button>
      </div>

      <PlaceOrderModal
        isOpen={orderOpen}
        onClose={() => setOrderOpen(false)}
        items={items}
        onSuccess={clearCart}
      />
    </>
  )
}
