import type { Product } from '../types'

/** Public product URL (slug-based when available). */
export function productPath(product: Pick<Product, 'id' | 'slug'>): string {
  return `/products/${product.slug || product.id}`
}
