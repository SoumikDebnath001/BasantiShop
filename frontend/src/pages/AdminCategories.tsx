import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { FolderPlus } from 'lucide-react'
import { categoryService } from '../services/categoryService'
import type { CategoryDTO } from '../types'
import { useToast } from '../context/ToastContext'
import { FormInput } from '../components/FormInput'
import { getApiErrorMessage } from '../utils/apiError'

type FormValues = { name: string }

export default function AdminCategories() {
  const { showToast } = useToast()
  const [list, setList] = useState<CategoryDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { name: '' } })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await categoryService.list()
      setList(rows)
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to load categories'), 'error')
      setList([])
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void load()
  }, [load])

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true)
    try {
      const row = await categoryService.create(data.name.trim())
      showToast(`Category “${row.name}” created`, 'success')
      reset({ name: '' })
      await load()
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not create category'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-8 animate-fade-in max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-charcoal mb-1">Categories</h1>
      <p className="text-muted text-sm mb-8">Create categories for the storefront and product catalog.</p>

      <div className="bg-white rounded-2xl border border-border p-6 mb-8 shadow-sm">
        <h2 className="font-semibold text-charcoal text-sm mb-4 flex items-center gap-2">
          <FolderPlus size={16} className="text-accent" />
          New category
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1 min-w-0">
            <FormInput
              label="Name"
              placeholder="e.g. Groceries"
              required
              error={errors.name?.message}
              {...register('name', { required: 'Name is required', maxLength: { value: 120, message: 'Too long' } })}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-charcoal text-white text-sm font-medium rounded-xl hover:bg-accent transition-colors disabled:opacity-60 shrink-0 h-[42px] sm:mb-0"
          >
            {submitting ? 'Saving…' : 'Add category'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-charcoal text-sm">Existing categories</h2>
          {loading && <span className="text-xs text-muted">Loading…</span>}
        </div>
        <ul className="divide-y divide-border">
          {!loading && list.length === 0 && (
            <li className="px-6 py-10 text-center text-muted text-sm">No categories yet.</li>
          )}
          {list.map((c) => (
            <li key={c.id} className="px-6 py-4 hover:bg-cream/50 transition-colors">
              <p className="font-medium text-charcoal truncate">{c.name}</p>
              <p className="text-xs text-muted mt-0.5">
                Added {new Date(c.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
