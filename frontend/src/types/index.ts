// ─── User & Auth ─────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'customer'
  phone?: string
  createdAt?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
}

// ─── Product ─────────────────────────────────────────────────
export interface Product {
  id: string
  /** SEO URL segment; older cached carts may omit */
  slug?: string
  name: string
  description: string
  price: number
  /** Admin-only from admin API */
  originalPrice?: number
  sellingPrice?: number
  category: string
  stock: number
  images: string[]
  shortDescription?: string
  createdAt?: string
  averageRating?: number
  ratingCount?: number
  myRating?: number | null
}

export interface ProductFormData {
  name: string
  description: string
  originalPrice: number
  sellingPrice: number
  category: string
  stock: number
  images: string[]
  shortDescription?: string
}

// ─── Cart ─────────────────────────────────────────────────────
export interface CartItem {
  product: Product
  quantity: number
}

// ─── Contact ─────────────────────────────────────────────────
export interface ContactPayload {
  name: string
  phone: string
  email: string
  message: string
  productName?: string
  productId?: string
}

export interface ContactHistoryItem {
  id: string
  productName: string
  productId: string | null
  message: string
  response: string | null
  createdAt: string
  preview: string
}

// ─── Orders ──────────────────────────────────────────────────
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'RETURNED' | 'CANCELLED'

export interface OrderLineItem {
  id: string
  productId: string | null
  name: string
  price: number
  quantity: number
  lineListedTotal?: number
  costPerUnit?: number
}

export interface Order {
  id: string
  userId: string
  phoneNumber: string
  totalAmount: number
  finalTotalAmount: number | null
  displayTotal: number
  status: OrderStatus
  deliveredAt: string | null
  invoiceUrl: string | null
  createdAt: string
  user: { id: string; name: string; email: string }
  items: OrderLineItem[]
}

export interface DashboardOverview {
  totalOrders: number
  pendingOrders: number
  confirmedOrders: number
  deliveredOrders: number
  recentActivity: {
    id: string
    status: OrderStatus
    createdAt: string
    displayTotal: number
    itemCount: number
  }[]
}

export interface CreateOrderPayload {
  phoneNumber: string
  items: { productId: string; quantity: number }[]
}

export type PatchOrderPayload =
  | { status: 'CONFIRMED'; finalTotalAmount: number }
  | { status: 'PENDING' }
  | { status: 'DELIVERED' }
  | { status: 'RETURNED' }
  | { status: 'CANCELLED' }

// ─── Analytics (admin) ─────────────────────────────────────
export interface ProfitLossSummary {
  totalSales: number
  totalProfit: number
  totalLoss: number
  orderCount: number
}

export interface ProfitLossOrderRow {
  id: string
  status: string
  customerName: string
  listedTotal: number
  finalTotal: number
  totalCost: number
  profit: number
  createdAt: string
}

export interface ProfitLossResponse {
  summary: ProfitLossSummary
  orders: ProfitLossOrderRow[]
}

// ─── Shop review ─────────────────────────────────────────────
export interface ShopReview {
  id: string
  userId: string
  rating: number
  message: string
  createdAt: string
  user: { id: string; name: string; email: string }
}

export interface ShopSummary {
  averageRating: number
  reviewCount: number
}

// ─── Admin log ───────────────────────────────────────────────
export interface AdminLogEntry {
  id: string
  adminId: string
  action: string
  details: unknown
  createdAt: string
  admin: { id: string; name: string; email: string }
}

// ─── API Responses ────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Filters ─────────────────────────────────────────────────
export interface ProductFilters {
  search: string
  /** Empty string = no category selected (do not load products). */
  category: string
  minPrice: number | ''
  maxPrice: number | ''
  sortBy: 'price-asc' | 'price-desc' | 'newest' | 'name'
}

export interface CategoryDTO {
  id: string
  name: string
  createdAt: string
}

export interface SearchSuggestions {
  categories: { id: string; name: string }[]
  products: { id: string; slug: string; name: string; category: string; image: string | null }[]
}

// ─── Toast ────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
}
