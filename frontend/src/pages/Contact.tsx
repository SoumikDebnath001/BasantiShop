import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Send, MapPin, Mail, Phone } from 'lucide-react'
import { FormInput, FormTextarea } from '../components/FormInput'
import { contactService } from '../services/contactService'
import { useToast } from '../context/ToastContext'
import { ContactPayload } from '../types'
import Seo from '../components/Seo'

const INFO = [
  { icon: MapPin, label: 'Jyotinagar, Siliguri, WB' },
  { icon: Mail, label: 'basantistore7@gmail.com' },
  { icon: Phone, label: '+91 89675 50790' },
]

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactPayload>()

  const onSubmit = async (data: ContactPayload) => {
    setIsSubmitting(true)
    try {
      await contactService.sendContact(data)
      showToast('Message sent!', 'success')
      reset()
    } catch {
      showToast('Failed to send. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-7 md:py-12 animate-fade-in">
      <Seo title="Contact us" description="Get in touch with Basanti Variety Store." />

      <div className="mb-5">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-1">Get in touch</h1>
        <p className="text-muted text-sm">Questions or product enquiries? We'd love to help.</p>
      </div>

      {/* Compact info strip */}
      <div className="flex flex-col gap-2 mb-5">
        {INFO.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3 text-sm text-charcoal">
            <div className="w-8 h-8 bg-cream border border-border rounded-xl flex items-center justify-center shrink-0">
              <Icon size={14} className="text-accent" />
            </div>
            <span className="text-sm text-muted">{label}</span>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-border p-4 md:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Name"
              placeholder="Full name"
              required
              error={errors.name?.message}
              {...register('name', { required: 'Required' })}
            />
            <FormInput
              label="Phone"
              placeholder="+91 98765…"
              required
              error={errors.phone?.message}
              {...register('phone', { required: 'Required' })}
            />
          </div>
          <FormInput
            label="Email"
            type="email"
            placeholder="email@gmail.com"
            required
            error={errors.email?.message}
            {...register('email', {
              required: 'Required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
            })}
          />
          <FormInput
            label="Subject (optional)"
            placeholder="Enquiry about…"
            {...register('productName')}
          />
          <FormTextarea
            label="Message"
            placeholder="How can we help?"
            rows={3}
            required
            error={errors.message?.message}
            {...register('message', { required: 'Required', minLength: { value: 10, message: 'Too short' } })}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-charcoal text-white font-semibold rounded-2xl hover:bg-accent transition-colors disabled:opacity-60 text-[15px]"
          >
            <Send size={15} />
            {isSubmitting ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  )
}
