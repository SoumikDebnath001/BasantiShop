export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border animate-skeleton-pulse">
      <div className="aspect-[4/3] bg-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-100 rounded-full w-1/3" />
        <div className="h-5 bg-gray-100 rounded-full w-3/4" />
        <div className="h-4 bg-gray-100 rounded-full w-full" />
        <div className="h-4 bg-gray-100 rounded-full w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-gray-100 rounded-full w-1/4" />
          <div className="h-9 bg-gray-100 rounded-xl w-1/3" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function TextSkeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-full animate-skeleton-pulse ${className}`} />
}
