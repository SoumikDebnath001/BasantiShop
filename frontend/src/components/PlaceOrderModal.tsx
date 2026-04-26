import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Package } from 'lucide-react'
import Modal from './Modal'
import { FormInput } from './FormInput'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import type { CartItem } from '../types'
import { orderService } from '../services/orderService'
import { formatPrice } from '../utils/format'
import { getApiErrorMessage } from '../utils/apiError'

interface PlaceOrderModalProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onSuccess: () => void
}

type FormValues = { phoneNumber: string }

export default function PlaceOrderModal({ isOpen, onClose, items, onSuccess }: PlaceOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()
  const { user } = useAuth()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { phoneNumber: user?.phone || '' },
  })

  useEffect(() => {
    if (isOpen) reset({ phoneNumber: user?.phone || '' })
  }, [isOpen, user?.phone, reset])

  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0)

  const onSubmit = async (data: FormValues) => {
    if (!items.length) return
    setIsSubmitting(true)
    try {
      await orderService.create({
        phoneNumber: data.phoneNumber.trim(),
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      })
      showToast('Thank you for your order! We will contact you shortly.', 'success')
      reset()
      onSuccess()
      onClose()
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not place order.'), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Place order" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-cream rounded-xl p-3 text-sm text-muted">
          <span className="font-medium text-charcoal">{items.length}</span> line
          {items.length !== 1 ? 's' : ''} · Total{' '}
          <span className="font-medium text-charcoal">{formatPrice(total)}</span>
        </div>

        <ul className="max-h-36 overflow-y-auto space-y-2 text-sm border border-border rounded-xl p-3">
          {items.map((i) => (
            <li key={i.product.id} className="flex justify-between gap-2 text-charcoal">
              <span className="line-clamp-1">
                <Package size={12} className="inline mr-1 text-muted align-middle" />
                {i.product.name} × {i.quantity}
              </span>
              <span className="shrink-0 text-muted">{formatPrice(i.product.price * i.quantity)}</span>
            </li>
          ))}
        </ul>

        <FormInput
          label="Phone number"
          placeholder="+1 555 0100"
          required
          error={errors.phoneNumber?.message}
          {...register('phoneNumber', {
            required: 'Phone is required',
            minLength: { value: 5, message: 'Enter a valid phone number' },
          })}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-charcoal text-white font-medium rounded-xl hover:bg-accent transition-colors disabled:opacity-60"
        >
          {isSubmitting ? 'Submitting…' : 'Submit order'}
        </button>
      </form>
    </Modal>
  )
}
