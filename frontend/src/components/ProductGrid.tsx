import { Package, Loader2 } from 'lucide-react'
import { Product } from '../types'
import ProductCard from './ProductCard'
import { ProductGridSkeleton } from './LoadingSkeleton'

interface ProductGridProps {
  products: Product[]
  isLoading: boolean
  loadingMore?: boolean
  emptyMessage?: string
}

export default function ProductGrid({ products, isLoading, loadingMore, emptyMessage }: ProductGridProps) {
  if (isLoading) return <ProductGridSkeleton />

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-white rounded-2xl border border-border flex items-center justify-center mb-4 shadow-sm">
          <Package size={28} className="text-muted" />
        </div>
        <h3 className="font-display text-xl font-semibold text-charcoal mb-2">No products found</h3>
        <p className="text-muted text-sm max-w-xs leading-relaxed">
          {emptyMessage || "Try adjusting your filters or search term to find what you're looking for."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:gap-6 animate-fade-in">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {loadingMore && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="animate-spin text-accent" size={24} aria-label="Loading more" />
          <ProductGridSkeleton count={2} />
        </div>
      )}
    </div>
  )
}
