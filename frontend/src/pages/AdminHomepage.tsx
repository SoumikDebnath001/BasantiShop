import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Home, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { homepageService } from '../services/homepageService'
import { useToast } from '../context/ToastContext'
import { getApiErrorMessage } from '../utils/apiError'
import type { HomepageContent } from '../types'

type FormData = {
  heroHeadline: string
  heroSubtext: string
  heroCta: string
  announcementBanner: string
  announcementEnabled: boolean
  aboutTitle: string
  aboutText: string
}

export default function AdminHomepage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, watch, formState: { isDirty, errors } } = useForm<FormData>()
  const announcementEnabled = watch('announcementEnabled')

  useEffect(() => {
    homepageService
      .get()
      .then((content: HomepageContent) => {
        reset({
          heroHeadline: content.heroHeadline,
          heroSubtext: content.heroSubtext,
          heroCta: content.heroCta,
          announcementBanner: content.announcementBanner ?? '',
          announcementEnabled: content.announcementEnabled,
          aboutTitle: content.aboutTitle,
          aboutText: content.aboutText,
        })
      })
      .catch(() => showToast('Failed to load homepage settings', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      await homepageService.update({
        ...data,
        announcementBanner: data.announcementBanner.trim() || null,
      })
      showToast('Homepage updated successfully!', 'success')
      reset(data)
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to save changes.'), 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-4">
        <div className="h-8 bg-border rounded-xl w-1/3" />
        <div className="h-4 bg-border rounded w-1/2" />
        <div className="h-32 bg-border rounded-xl" />
      </div>
    )
  }

  const Field = ({
    label,
    name,
    type = 'text',
    rows,
    hint,
    required: req,
    maxLength,
  }: {
    label: string
    name: keyof FormData
    type?: string
    rows?: number
    hint?: string
    required?: boolean
    maxLength?: number
  }) => (
    <div>
      <label className="block text-sm font-medium text-charcoal mb-1.5">
        {label} {req && <span className="text-red-400">*</span>}
      </label>
      {rows ? (
        <textarea
          {...register(name, { required: req ? `${label} is required` : false })}
          rows={rows}
          maxLength={maxLength}
          className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-charcoal transition-colors resize-none
            ${errors[name] ? 'border-red-400 bg-red-50' : 'border-border'}`}
        />
      ) : (
        <input
          type={type}
          {...register(name, { required: req ? `${label} is required` : false })}
          maxLength={maxLength}
          className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-charcoal transition-colors
            ${errors[name] ? 'border-red-400 bg-red-50' : 'border-border'}`}
        />
      )}
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]?.message}</p>}
    </div>
  )

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Home size={20} className="text-accent" />
            <h1 className="text-2xl font-bold text-charcoal">Homepage Editor</h1>
          </div>
          <p className="text-muted text-sm">Control what customers see on the home page.</p>
        </div>
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-2 text-sm text-muted hover:text-charcoal border border-border px-3 py-2 rounded-xl transition-colors"
        >
          <Eye size={14} />
          Preview
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Hero section */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-charcoal flex items-center gap-2">
            <span className="w-6 h-6 bg-charcoal text-white rounded-lg flex items-center justify-center text-xs font-bold">1</span>
            Hero Section
          </h2>
          <Field
            label="Headline"
            name="heroHeadline"
            required
            maxLength={200}
            hint='Use a comma to split into two lines. E.g. "Quality variety, thoughtfully stocked."'
          />
          <Field
            label="Subtitle / description"
            name="heroSubtext"
            rows={3}
            maxLength={500}
            hint="Shown below the headline. 1–2 sentences."
          />
          <Field
            label="CTA button text"
            name="heroCta"
            required
            maxLength={80}
            hint='e.g. "Shop Now" or "Browse Collection"'
          />
        </div>

        {/* Announcement */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-charcoal flex items-center gap-2">
            <span className="w-6 h-6 bg-charcoal text-white rounded-lg flex items-center justify-center text-xs font-bold">2</span>
            Announcement Banner
          </h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('announcementEnabled')}
              className="w-4 h-4 accent-accent rounded"
            />
            <span className="text-sm font-medium text-charcoal">Show announcement banner at top of page</span>
          </label>
          {announcementEnabled && (
            <Field
              label="Banner text"
              name="announcementBanner"
              maxLength={300}
              hint='e.g. "Free delivery on orders above ₹500 this week!"'
            />
          )}
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-charcoal flex items-center gap-2">
            <span className="w-6 h-6 bg-charcoal text-white rounded-lg flex items-center justify-center text-xs font-bold">3</span>
            About Section
          </h2>
          <Field label="Section title" name="aboutTitle" required maxLength={120} />
          <Field label="About text" name="aboutText" rows={4} maxLength={1000} hint="Describe your store, values, and what makes you unique." />
        </div>

        {/* Save */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted">{isDirty ? 'You have unsaved changes.' : 'All changes saved.'}</p>
          <button
            type="submit"
            disabled={saving || !isDirty}
            className="flex items-center gap-2 px-6 py-3 bg-charcoal text-white font-medium rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
