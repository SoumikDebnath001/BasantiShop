// ============================================================
// BACKEND CONFIGURATION
// Set VITE_API_BASE_URL in .env (e.g. http://localhost:8000/api)
// ============================================================
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',

  // Products
  PRODUCTS: '/products',
  PRODUCTS_ADMIN: '/products/admin',
  PRODUCT: (id: string) => `/products/${id}`,
  PRODUCT_ADMIN: (id: string) => `/products/admin/${id}`,
  PRODUCT_RATE: (id: string) => `/products/${id}/ratings`,

  // Uploads (admin)
  UPLOAD_IMAGES: '/uploads/images',

  // Contact
  CONTACT: '/contact',

  // User
  PROFILE: '/user/profile',
  CONTACTS: '/user/contacts',

  // Orders
  ORDERS: '/orders',
  MY_ORDERS: '/orders/my',
  ORDER: (id: string) => `/orders/${id}`,

  // Analytics (admin)
  ANALYTICS_PROFIT: '/analytics/profit-loss',

  // Shop reviews
  SHOP_SUMMARY: '/shop/summary',
  SHOP_REVIEWS: '/shop/reviews',

  // Admin
  ADMIN_LOGS: '/admin/logs',
} as const
