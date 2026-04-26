import { Package } from 'lucide-react'
import { Product } from '../types'
import ProductCard from './ProductCard'
import { ProductGridSkeleton } from './LoadingSkeleton'

interface ProductGridProps {
  products: Product[]
  isLoading: boolean
  emptyMessage?: string
}

export default function ProductGrid({ products, isLoading, emptyMessage }: ProductGridProps) {
  if (isLoading) return <ProductGridSkeleton />

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <Package size={28} className="text-muted" />
        </div>
        <h3 className="font-display text-xl font-semibold text-charcoal mb-2">No products found</h3>
        <p className="text-muted text-sm max-w-xs">
          {emptyMessage || "Try adjusting your filters or search term to find what you're looking for."}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
