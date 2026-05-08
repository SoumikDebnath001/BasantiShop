import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Package, CreditCard, Banknote, ShieldCheck } from 'lucide-react'
import Modal from './Modal'
import { FormInput } from './FormInput'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { useRazorpay } from '../hooks/useRazorpay'
import { orderService } from '../services/orderService'
import { paymentService } from '../services/paymentService'
import { formatPrice } from '../utils/format'
import { getApiErrorMessage } from '../utils/apiError'
import { SHOP_NAME } from '../constants/brand'
import type { CartItem } from '../types'

interface PlaceOrderModalProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onSuccess: () => void
}

type PaymentMethod = 'COD' | 'ONLINE'
type FormValues = { phoneNumber: string }

export default function PlaceOrderModal({ isOpen, onClose, items, onSuccess }: PlaceOrderModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()
  const { user } = useAuth()
  const { openCheckout } = useRazorpay()
  const navigate = useNavigate()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { phoneNumber: user?.phone || '' },
  })

  useEffect(() => {
    if (isOpen) {
      reset({ phoneNumber: user?.phone || '' })
      setPaymentMethod('ONLINE')
    }
  }, [isOpen, user?.phone, reset])

  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0)

  // ── COD order ──────────────────────────────────────────────────
  const handleCodOrder = async (data: FormValues) => {
    if (!items.length) return
    setIsSubmitting(true)
    try {
      await orderService.create({
        phoneNumber: data.phoneNumber.trim(),
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      })
      showToast('Order placed! We will contact you to confirm.', 'success')
      reset()
      onSuccess()
      onClose()
      navigate('/dashboard')
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not place order.'), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Online payment ──────────────────────────────────────────────
  const handleOnlineOrder = async (data: FormValues) => {
    if (!items.length) return
    setIsSubmitting(true)
    try {
      // 1. Create Razorpay order on backend
      const rzpData = await paymentService.createOrder({
        phoneNumber: data.phoneNumber.trim(),
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      })

      setIsSubmitting(false)

      // 2. Open Razorpay checkout
      await openCheckout(
        {
          key: rzpData.keyId,
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: SHOP_NAME,
          description: `Order #${rzpData.orderId.slice(-8).toUpperCase()}`,
          order_id: rzpData.razorpayOrderId,
          prefill: {
            name: user?.name ?? '',
            email: user?.email ?? '',
            contact: data.phoneNumber.trim(),
          },
          theme: { color: '#C8956C' },
          handler: async (response) => {
            // 3. Verify signature on backend
            setIsSubmitting(true)
            try {
              await paymentService.verifyPayment({
                orderId: rzpData.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
              showToast('Payment successful! Your order is confirmed.', 'success')
              onSuccess()
              onClose()
              navigate('/dashboard')
            } catch (err) {
              showToast(getApiErrorMessage(err, 'Payment verification failed. Contact support.'), 'error')
            } finally {
              setIsSubmitting(false)
            }
          },
        },
        () => {
          showToast('Payment cancelled.', 'info')
        }
      )
    } catch (err) {
      setIsSubmitting(false)
      showToast(getApiErrorMessage(err, 'Could not initiate payment.'), 'error')
    }
  }

  const onSubmit = (data: FormValues) => {
    if (paymentMethod === 'COD') return handleCodOrder(data)
    return handleOnlineOrder(data)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Place order" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Order summary */}
        <div className="bg-cream rounded-xl p-3.5">
          <div className="flex items-center justify-between text-sm font-medium text-charcoal mb-2">
            <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
            <span>{formatPrice(total)}</span>
          </div>
          <ul className="max-h-32 overflow-y-auto space-y-1.5 text-xs text-muted border-t border-border/60 pt-2">
            {items.map((i) => (
              <li key={i.product.id} className="flex justify-between gap-2">
                <span className="line-clamp-1 flex items-center gap-1">
                  <Package size={11} className="text-muted shrink-0" />
                  {i.product.name} × {i.quantity}
                </span>
                <span className="shrink-0">{formatPrice(i.product.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Phone */}
        <FormInput
          label="Phone number"
          placeholder="+91 98765 43210"
          required
          error={errors.phoneNumber?.message}
          {...register('phoneNumber', {
            required: 'Phone is required',
            minLength: { value: 5, message: 'Enter a valid phone number' },
          })}
        />

        {/* Payment method */}
        <div>
          <p className="text-sm font-medium text-charcoal mb-2.5">Payment method</p>
          <div className="grid grid-cols-2 gap-3">
            {/* Online payment */}
            <button
              type="button"
              onClick={() => setPaymentMethod('ONLINE')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium
                ${paymentMethod === 'ONLINE'
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'border-border text-muted hover:border-charcoal/30 hover:text-charcoal'
                }`}
            >
              <CreditCard size={20} />
              <span>Pay online</span>
              <span className="text-[10px] font-normal opacity-70">UPI · Card · Wallet</span>
            </button>

            {/* Cash on delivery */}
            <button
              type="button"
              onClick={() => setPaymentMethod('COD')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium
                ${paymentMethod === 'COD'
                  ? 'border-charcoal bg-charcoal/5 text-charcoal'
                  : 'border-border text-muted hover:border-charcoal/30 hover:text-charcoal'
                }`}
            >
              <Banknote size={20} />
              <span>Cash on delivery</span>
              <span className="text-[10px] font-normal opacity-70">Pay when you receive</span>
            </button>
          </div>
        </div>

        {/* Security badge for online */}
        {paymentMethod === 'ONLINE' && (
          <div className="flex items-center gap-2 text-xs text-muted bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
            <span>Secured by Razorpay · 256-bit SSL · All major cards, UPI & wallets accepted</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex items-center justify-center gap-2 py-3.5 font-semibold rounded-xl transition-all disabled:opacity-60
            ${paymentMethod === 'ONLINE'
              ? 'bg-accent hover:bg-accent-dark text-white'
              : 'bg-charcoal hover:bg-accent text-white'
            }`}
        >
          {isSubmitting
            ? 'Processing…'
            : paymentMethod === 'ONLINE'
              ? `Pay ${formatPrice(total)}`
              : 'Place order (COD)'
          }
        </button>
      </form>
    </Modal>
  )
}
