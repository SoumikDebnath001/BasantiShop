import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Send } from 'lucide-react'
import Modal from './Modal'
import { FormInput, FormTextarea } from './FormInput'
import { contactService } from '../services/contactService'
import { useToast } from '../context/ToastContext'
import { ContactPayload } from '../types'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  productName?: string
  productId?: string
}

export default function ContactModal({ isOpen, onClose, productName, productId }: ContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactPayload>({
    defaultValues: { productName: productName || '' },
  })

  const onSubmit = async (data: ContactPayload) => {
    setIsSubmitting(true)
    try {
      await contactService.sendContact({ ...data, productId })
      showToast('Message sent! The seller will contact you shortly.', 'success')
      reset()
      onClose()
    } catch {
      showToast('Failed to send message. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contact Seller" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {productName && (
          <div className="bg-cream rounded-xl p-3 text-sm text-muted">
            Enquiring about: <span className="font-medium text-charcoal">{productName}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Your Name"
            placeholder="Jane Cooper"
            required
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />
          <FormInput
            label="Phone"
            placeholder="+1 555 0100"
            required
            error={errors.phone?.message}
            {...register('phone', { required: 'Phone is required' })}
          />
        </div>

        <FormInput
          label="Email"
          type="email"
          placeholder="jane@example.com"
          required
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
          })}
        />

        <FormTextarea
          label="Message"
          placeholder="I'm interested in this product and would like to know more about…"
          required
          rows={4}
          error={errors.message?.message}
          {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Please write at least 10 characters' } })}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-charcoal text-white font-medium rounded-xl hover:bg-accent transition-colors disabled:opacity-60"
        >
          <Send size={16} />
          {isSubmitting ? 'Sending…' : 'Send Message'}
        </button>
      </form>
    </Modal>
  )
}
