import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, ArrowRight, Trash2 } from 'lucide-react'
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center animate-fade-in">
        <div className="w-20 h-20 bg-white rounded-3xl border border-border flex items-center justify-center mx-auto mb-5">
          <ShoppingCart size={32} className="text-muted" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-charcoal mb-3">Your cart is empty</h2>
        <p className="text-muted mb-8">Add some products to get started.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-charcoal text-white px-6 py-3 rounded-xl font-medium hover:bg-accent transition-colors"
        >
          Browse Products <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <Seo title="Your cart" description="Review items and place your order." />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-charcoal">Your Cart</h1>
          <p className="text-muted text-sm mt-1">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="flex items-center gap-2 text-sm text-muted hover:text-red-500 transition-colors"
        >
          <Trash2 size={14} /> Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border px-6">
          {items.map((item) => (
            <CartItemRow key={item.product.id} item={item} />
          ))}
        </div>

        <div>
          <div className="bg-white rounded-2xl border border-border p-6 sticky top-24">
            <h3 className="font-semibold text-charcoal mb-5">Order Summary</h3>

            <div className="space-y-3 mb-5 pb-5 border-b border-border">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-muted line-clamp-1 max-w-[60%]">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="text-charcoal font-medium">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold text-charcoal">Total</span>
              <span className="font-display text-2xl font-bold text-charcoal">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setOrderOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-charcoal text-white font-medium rounded-xl hover:bg-accent transition-colors mb-3"
            >
              Place Order
            </button>

            <Link
              to="/products"
              className="block text-center text-sm text-muted hover:text-charcoal transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <PlaceOrderModal
        isOpen={orderOpen}
        onClose={() => setOrderOpen(false)}
        items={items}
        onSuccess={clearCart}
      />
    </div>
  )
}
