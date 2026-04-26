import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save, X, Upload } from 'lucide-react'
import { FormInput, FormTextarea } from '../components/FormInput'
import { productService } from '../services/productService'
import { uploadProductImages } from '../services/uploadService'
import { useToast } from '../context/ToastContext'
import { ProductFormData } from '../types'
import { CATEGORIES } from '../utils/mockData'

export default function ProductForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id && id !== 'new'
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>()

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
        setImages(p.images)
      })
    }
  }, [id, isEdit, reset])

  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files
    if (!list?.length) return
    setUploading(true)
    try {
      const urls = await uploadProductImages(Array.from(list))
      setImages((prev) => {
        const next = [...prev]
        for (const u of urls) {
          if (!next.includes(u)) next.push(u)
        }
        return next
      })
      showToast(urls.length === 1 ? 'Image uploaded' : `${urls.length} images uploaded`, 'success')
    } catch {
      showToast('Image upload failed. Check Cloudinary configuration on the server.', 'error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (url: string) => setImages((prev) => prev.filter((i) => i !== url))

  const onSubmit = async (data: ProductFormData) => {
    if (images.length === 0) {
      showToast('Please add at least one image', 'warning')
      return
    }
    setIsSubmitting(true)
    try {
      const payload = { ...data, images }
      if (isEdit && id) {
        await productService.updateProduct(id, payload)
        showToast('Product updated!', 'success')
      } else {
        await productService.createProduct(payload)
        showToast('Product created!', 'success')
      }
      navigate('/admin/products')
    } catch {
      showToast('Failed to save product', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

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
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
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

        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
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
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full px-4 py-3 border border-border rounded-xl text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all bg-white"
            >
              <option value="">Select category</option>
              {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-charcoal text-sm mb-4">Product Images</h3>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={onFilesSelected}
          />
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-charcoal text-white text-sm font-medium rounded-xl hover:bg-accent transition-colors disabled:opacity-60"
            >
              <Upload size={16} />
              {uploading ? 'Uploading…' : 'Upload images'}
            </button>
            <span className="self-center text-xs text-muted">JPEG, PNG, WebP — stored on Cloudinary</span>
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((url) => (
                <div key={url} className="relative group aspect-square">
                  <img src={url} alt="" className="w-full h-full object-cover rounded-xl bg-gray-100" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {images.length === 0 && (
            <p className="text-sm text-muted">No images yet. Upload at least one image.</p>
          )}
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
            {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
