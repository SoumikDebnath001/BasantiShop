import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CartItem, Product } from '../types'
import { useAuth } from './AuthContext'

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, qty?: number) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const cartKeyForUser = (userId: string) => `basanti_variety_store_cart_${userId}`

const CartContext = createContext<CartContextType | null>(null)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const uid = user?.id
    if (!uid) {
      setItems([])
      return
    }
    try {
      const raw = localStorage.getItem(cartKeyForUser(uid))
      setItems(raw ? JSON.parse(raw) : [])
    } catch {
      setItems([])
    }
  }, [user?.id])

  useEffect(() => {
    const uid = user?.id
    if (!uid) return
    localStorage.setItem(cartKeyForUser(uid), JSON.stringify(items))
  }, [items, user?.id])

  const addItem = (product: Product, qty = 1) => {
    if (!user?.id) return
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) }
            : i
        )
      }
      return [...prev, { product, quantity: qty }]
    })
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId))
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
    )
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
