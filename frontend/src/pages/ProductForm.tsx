import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save, X, ImagePlus } from 'lucide-react'
import { FormInput, FormTextarea } from '../components/FormInput'
import { productService } from '../services/productService'
import { uploadProductImages } from '../services/uploadService'
import { categoryService } from '../services/categoryService'
import { useToast } from '../context/ToastContext'
import { ProductFormData } from '../types'

type PendingImage = { file: File; preview: string }

export default function ProductForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id && id !== 'new'
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [committedUrls, setCommittedUrls] = useState<string[]>([])
  const [pending, setPending] = useState<PendingImage[]>([])
  const pendingRef = useRef(pending)
  pendingRef.current = pending

  const [categoryNames, setCategoryNames] = useState<string[]>([])
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      shortDescription: '',
      originalPrice: 0,
      sellingPrice: 0,
      category: '',
      stock: 0,
      images: [],
    },
  })

  useEffect(() => {
    return () => {
      pendingRef.current.forEach((p) => URL.revokeObjectURL(p.preview))
    }
  }, [])

  useEffect(() => {
    if (!isEdit) {
      reset({
        name: '',
        description: '',
        shortDescription: '',
        originalPrice: 0,
        sellingPrice: 0,
        category: '',
        stock: 0,
        images: [],
      })
      setCommittedUrls([])
      setPending([])
    }
  }, [isEdit, reset])

  useEffect(() => {
    let cancelled = false
    categoryService
      .list()
      .then((rows) => {
        if (!cancelled) setCategoryNames(rows.map((r) => r.name))
      })
      .catch(() => {
        if (!cancelled) {
          setCategoriesError('Could not load categories')
          setCategoryNames([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (isEdit && id) {
      productService.getProductAdmin(id).then((p) => {
        reset({
          name: p.name,
          description: p.description,
          shortDescription: p.shortDescription,
          originalPrice: p.originalPrice ?? p.price,
          sellingPrice: p.sellingPrice ?? p.price,
          category: p.category,
          stock: p.stock,
          images: p.images,
        })
        setCommittedUrls(p.images)
        setPending([])
      })
    }
  }, [id, isEdit, reset])

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files
    if (!list?.length) return
    const next: PendingImage[] = Array.from(list).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setPending((prev) => [...prev, ...next])
    e.target.value = ''
  }

  const removeCommitted = (url: string) => setCommittedUrls((prev) => prev.filter((u) => u !== url))

  const removePending = (preview: string) => {
    setPending((prev) => {
      const row = prev.find((p) => p.preview === preview)
      if (row) URL.revokeObjectURL(row.preview)
      return prev.filter((p) => p.preview !== preview)
    })
  }

  const onSubmit = async (data: ProductFormData) => {
    if (committedUrls.length + pending.length === 0) {
      showToast('Please add at least one image', 'warning')
      return
    }
    setIsSubmitting(true)
    try {
      let imageUrls = [...committedUrls]
      if (pending.length) {
        const uploaded = await uploadProductImages(pending.map((p) => p.file))
        pending.forEach((p) => URL.revokeObjectURL(p.preview))
        setPending([])
        imageUrls = [...imageUrls, ...uploaded]
      }
      const payload = { ...data, images: imageUrls }
      if (isEdit && id) {
        await productService.updateProduct(id, payload)
        showToast('Product updated!', 'success')
      } else {
        await productService.createProduct(payload)
        showToast('Product created!', 'success')
      }
      navigate('/admin/products')
    } catch {
      showToast('Failed to save product or upload images. Check Cloudinary and try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasAnyImage = committedUrls.length + pending.length > 0

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={() => navigate('/admin/products')}
          className="p-2 rounded-xl hover:bg-gray-100 text-muted hover:text-charcoal transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-semibold text-charcoal">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h1>
          <p className="text-muted text-sm">{isEdit ? 'Update product details' : 'Create a new product listing'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4 shadow-sm">
          <h3 className="font-semibold text-charcoal text-sm">Basic Information</h3>
          <FormInput
            label="Product Name"
            placeholder="e.g., Premium Leather Watch"
            required
            error={errors.name?.message}
            {...register('name', { required: 'Product name is required' })}
          />
          <FormInput
            label="Short Description"
            placeholder="Brief one-line description"
            {...register('shortDescription')}
          />
          <FormTextarea
            label="Full Description"
            placeholder="Detailed product description…"
            required
            rows={4}
            error={errors.description?.message}
            {...register('description', { required: 'Description is required' })}
          />
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 space-y-4 shadow-sm">
          <h3 className="font-semibold text-charcoal text-sm">Pricing & Inventory</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Buy price (cost)"
              type="number"
              step="0.01"
              placeholder="0.00"
              required
              error={errors.originalPrice?.message}
              {...register('originalPrice', {
                required: 'Buy price is required',
                valueAsNumber: true,
                min: { value: 0.01, message: 'Must be positive' },
              })}
            />
            <FormInput
              label="Selling price"
              type="number"
              step="0.01"
              placeholder="0.00"
              required
              error={errors.sellingPrice?.message}
              {...register('sellingPrice', {
                required: 'Selling price is required',
                valueAsNumber: true,
                min: { value: 0.01, message: 'Must be positive' },
              })}
            />
            <FormInput
              label="Stock"
              type="number"
              placeholder="0"
              required
              error={errors.stock?.message}
              {...register('stock', {
                required: 'Stock is required',
                valueAsNumber: true,
                min: { value: 0, message: 'Stock cannot be negative' },
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              Category <span className="text-red-400">*</span>
            </label>
            {categoriesError && <p className="text-xs text-amber-700 mb-2">{categoriesError}</p>}
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full px-4 py-3 border border-border rounded-xl text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all bg-white"
            >
              <option value="">Select category</option>
              {categoryNames.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {categoryNames.length === 0 && !categoriesError && (
              <p className="text-xs text-muted mt-2">Add categories under Admin → Categories first.</p>
            )}
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-charcoal text-sm mb-2">Product images</h3>
          <p className="text-xs text-muted mb-4">
            Images are stored locally until you submit the form, then uploaded to Cloudinary once.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={onFilesSelected}
          />
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-charcoal text-white text-sm font-medium rounded-xl hover:bg-accent transition-colors"
            >
              <ImagePlus size={16} />
              Add images
            </button>
            <span className="self-center text-xs text-muted">JPEG, PNG, WebP, GIF</span>
          </div>
          {hasAnyImage && (
            <div className="grid grid-cols-3 gap-3">
              {committedUrls.map((url) => (
                <div key={url} className="relative group aspect-square">
                  <img src={url} alt="" className="w-full h-full object-cover rounded-xl bg-gray-100 border border-border" />
                  <button
                    type="button"
                    onClick={() => removeCommitted(url)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {pending.map((row) => (
                <div key={row.preview} className="relative group aspect-square">
                  <img src={row.preview} alt="" className="w-full h-full object-cover rounded-xl bg-gray-100 border border-dashed border-accent/40" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-medium uppercase tracking-wide bg-charcoal/80 text-white px-2 py-0.5 rounded">
                    New
                  </span>
                  <button
                    type="button"
                    onClick={() => removePending(row.preview)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {!hasAnyImage && <p className="text-sm text-muted">No images yet. Add at least one before saving.</p>}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium text-charcoal hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-charcoal text-white text-sm font-medium rounded-xl hover:bg-accent transition-colors disabled:opacity-60"
          >
            <Save size={15} />
            {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </form>
    </div>
  )
}
