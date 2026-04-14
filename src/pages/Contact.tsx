import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Send, MapPin, Mail, Phone } from 'lucide-react'
import { FormInput, FormTextarea } from '../components/FormInput'
import { contactService } from '../services/contactService'
import { useToast } from '../context/ToastContext'
import { ContactPayload } from '../types'

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactPayload>()

  const onSubmit = async (data: ContactPayload) => {
    setIsSubmitting(true)
    try {
      await contactService.sendContact(data)
      showToast('Message sent successfully!', 'success')
      reset()
    } catch {
      showToast('Failed to send. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="font-display text-4xl font-bold text-charcoal mb-3">Get in Touch</h1>
        <p className="text-muted">Have a question or want to enquire about a product? We'd love to hear from you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Info */}
        <div className="space-y-5">
          {[
            { icon: MapPin, title: 'Address', detail: '123 Market Street, San Francisco, CA 94102' },
            { icon: Mail, title: 'Email', detail: 'hello@luxe.com' },
            { icon: Phone, title: 'Phone', detail: '+1 (555) 123-4567' },
          ].map(({ icon: Icon, title, detail }) => (
            <div key={title} className="flex gap-4 bg-white rounded-2xl p-5 border border-border">
              <div className="w-10 h-10 bg-cream rounded-xl flex items-center justify-center shrink-0">
                <Icon size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">{title}</p>
                <p className="text-sm text-charcoal">{detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Name"
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
            <FormInput
              label="Subject / Product"
              placeholder="Enquiry about..."
              {...register('productName')}
            />
            <FormTextarea
              label="Message"
              placeholder="How can we help you?"
              rows={5}
              required
              error={errors.message?.message}
              {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Please be more descriptive' } })}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-charcoal text-white font-medium rounded-xl hover:bg-accent transition-colors disabled:opacity-60"
            >
              <Send size={16} />
              {isSubmitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
