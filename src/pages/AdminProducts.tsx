import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Pencil, Trash2, Search, Package } from 'lucide-react'
import { productService } from '../services/productService'
import { useToast } from '../context/ToastContext'
import { Product } from '../types'
import { formatPrice } from '../utils/format'
import Modal from '../components/Modal'
import { getApiErrorMessage } from '../utils/apiError'

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="10">No image</text></svg>'

export default function AdminProducts() {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [list, setList] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await productService.getProductsAdmin({ limit: 100 })
      setList(res.data)
      setTotal(res.total)
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to load products'), 'error')
      setList([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(
    () =>
      list.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())
      ),
    [list, search]
  )

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await productService.deleteProduct(deleteTarget.id)
      showToast(`"${deleteTarget.name}" deleted`, 'success')
      setDeleteTarget(null)
      load()
    } catch {
      showToast('Failed to delete product', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-charcoal">Products</h1>
          <p className="text-muted text-sm mt-0.5">{total} total products</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-charcoal text-white text-sm font-medium rounded-xl hover:bg-accent transition-colors"
        >
          <PlusCircle size={16} />
          Add Product
        </Link>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all bg-white"
        />
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted text-sm">Loading products…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={28} className="text-muted mx-auto mb-2" />
            <p className="text-charcoal font-medium">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Product</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Category</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Cost</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Sell</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Stock</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || FALLBACK_IMAGE}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-charcoal line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted line-clamp-1">{product.shortDescription}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium bg-cream border border-border text-muted px-2.5 py-1 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-muted">{formatPrice(product.originalPrice ?? 0)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-charcoal">
                        {formatPrice(product.sellingPrice ?? product.price)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-medium ${product.stock > 5 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:border-accent/30 hover:bg-cream text-charcoal transition-all"
                        >
                          <Pencil size={12} /> Edit
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-red-200 rounded-lg hover:bg-red-50 text-red-500 transition-all"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product" size="sm">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 size={20} className="text-red-500" />
          </div>
          <p className="text-charcoal font-medium mb-1">Are you sure?</p>
          <p className="text-muted text-sm mb-6">
            This will permanently delete <strong>"{deleteTarget?.name}"</strong>. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
