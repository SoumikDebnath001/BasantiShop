# BasantiShop — Full Codebase Context

> Generated 2026-05-08. Use this file to orient a new Claude session without re-reading the repo.

---

## 1. Project Overview

**BasantiShop (Luxe)** is a production-ready full-stack e-commerce platform built to demonstrate enterprise-level capabilities:

- Order negotiation (admin sets `finalTotalAmount` ≤ listed price)
- Profit / loss analytics from confirmed & delivered orders
- Comprehensive admin audit trail
- Multi-image product handling via Cloudinary
- PDF invoice generation
- Dual review system (per-product ratings + shop-wide reviews)
- Contact management with admin response workflow

---

## 2. Monorepo Structure

```
BasantiShop/
├── Backend/                   # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── server.ts          # Entry point — Express app, middleware, routes
│   │   ├── config/
│   │   │   ├── env.ts         # Zod-validated env vars
│   │   │   ├── prisma.ts      # Singleton Prisma client
│   │   │   ├── cloudinary.ts  # Cloudinary SDK init
│   │   │   └── invoice.ts     # PDFKit helpers
│   │   ├── controllers/       # 11 files — request/response orchestration
│   │   ├── services/          # 12 files — business logic, Prisma queries
│   │   ├── routes/            # 11 files — Express routers
│   │   ├── middlewares/       # auth, optionalAuth, requireAdmin, errorHandler, rateLimit, notFound
│   │   ├── validators/        # 8 Zod schema files
│   │   └── utils/             # jwt.ts, password.ts, slug.ts
│   ├── prisma/
│   │   ├── schema.prisma      # Single source of truth for DB models
│   │   └── migrations/        # Prisma migration history
│   ├── Dockerfile             # Multi-stage build (builder → runtime)
│   └── package.json
│
├── frontend/                  # React 18 + Vite + TypeScript SPA
│   ├── src/
│   │   ├── main.tsx           # React entry — wraps in AuthProvider, CartProvider, ToastProvider, Router
│   │   ├── config/
│   │   │   ├── api.ts         # Axios instance (base URL, JWT interceptor, 401 handler)
│   │   │   └── brand.ts       # Brand constants (colors, name)
│   │   ├── context/           # AuthContext, CartContext, ToastContext
│   │   ├── hooks/             # useProducts, useInfiniteProducts
│   │   ├── layouts/           # MainLayout (Navbar+Footer), AdminLayout (sidebar)
│   │   ├── pages/             # 19 page components (customer + admin)
│   │   ├── components/        # 18 reusable UI components
│   │   ├── services/          # 12 API service modules (one per domain)
│   │   └── utils/             # auth, format, productUrl, apiError helpers
│   ├── Dockerfile             # Multi-stage: Vite build → Nginx serve
│   └── package.json
│
├── docker-compose.yml         # Production: postgres + backend + frontend (Nginx)
├── .env.example               # All required env vars documented
├── .github/workflows/
│   └── ci-cd.yml              # Build → push Docker images → SSH deploy on push to main
└── README.md
```

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js 20 |
| Backend framework | Express 5.1.0 |
| Backend language | TypeScript 6.0.2 |
| ORM | Prisma 7.6.0 |
| Database | PostgreSQL 16 |
| Auth | JWT (jsonwebtoken 9.0.2, 7-day expiry) |
| Password hashing | bcryptjs 3.0.2 |
| Validation | Zod 4.1.5 |
| Security | Helmet 8.1.0, CORS 2.8.5, express-rate-limit 8.3.2 |
| File uploads | Multer 2.0.2 + Cloudinary SDK 2.7.0 |
| PDF generation | pdfkit 0.15.2 |
| Logging | Morgan 1.10.0 |
| Frontend framework | React 18.2.0 |
| Frontend build | Vite 5.1.6 |
| Frontend language | TypeScript 5.2.2 |
| Styling | Tailwind CSS 3.4.1 |
| Routing | React Router DOM 6.22.3 |
| HTTP client | axios 1.6.7 |
| Forms | React Hook Form 7.51.0 |
| Icons | lucide-react 0.344.0 |
| Container | Docker (multi-stage) |
| Web server | Nginx (alpine) |
| CI/CD | GitHub Actions |

---

## 4. Database Schema (Prisma)

**File:** `Backend/prisma/schema.prisma`

### Enums
```
UserRole:    ADMIN | CUSTOMER
OrderStatus: PENDING | CONFIRMED | DELIVERED | RETURNED | CANCELLED
```

### Models

**User** — `id, name, email, phone, passwordHash, role (UserRole), createdAt`

**Product** — `id, name, slug (unique), description, originalPrice (Decimal 10,2), sellingPrice (Decimal 10,2), category, stock, images (ProductImage[]), ratings (ProductRating[]), createdAt`

**ProductImage** — `id, productId, url, position` — `@@unique([productId, position])`

**ProductRating** — `id, userId, productId, rating (1-5)` — `@@unique([userId, productId])`

**Order** — `id, userId, phoneNumber, totalAmount (Decimal 12,2), finalTotalAmount (Decimal 12,2?), status (OrderStatus), items (OrderItem[]), invoiceUrl?, createdAt`

**OrderItem** — `id, orderId, productId?, name (snapshot), price (snapshot Decimal 10,2), costPerUnit (Decimal 10,2), quantity`

**ShopReview** — `id, userId, rating (1-5), message, createdAt` — `@@index([createdAt])`

**AdminLog** — `id, adminId, action (String), details (Json), createdAt` — `@@index([adminId, createdAt])`

**Category** — `id, name (unique)`

**ContactMessage** — `id, name, phone, email, message, response?, productId?, userId?, createdAt`

### Key Cascade Rules
- `Order → User`: onDelete: Cascade
- `OrderItem → Order`: onDelete: Cascade; `→ Product`: onDelete: SetNull
- `ProductRating → User, Product`: onDelete: Cascade
- `ShopReview, AdminLog, ContactMessage → User`: onDelete: Cascade
- `ContactMessage → Product`: onDelete: SetNull

---

## 5. All API Endpoints

Base path: `/api`

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | None | Register (name, email, password, phone) |
| POST | `/login` | None | Login → token + user |
| GET | `/me` | Required | Fetch current user |

### Products — `/api/products`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Required | List with filters (search, category, minPrice, maxPrice, sort, page, limit) |
| GET | `/admin` | Admin | Admin list (includes cost prices) |
| GET | `/admin/:id` | Admin | Single product for editing |
| GET | `/:id` | Required | Get by id or slug |
| POST | `/` | Admin | Create product |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Delete product |
| POST | `/:id/ratings` | Customer | Upsert rating (1-5) |

### Categories — `/api/categories`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | None | List all categories |
| POST | `/` | Admin | Create category |

### Search — `/api/search`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Required | Autocomplete search (products + categories) |

### Uploads — `/api/uploads`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/images` | Admin | Upload up to 10 images (multipart, max 10MB each) → Cloudinary |

### Contact — `/api/contact`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | Optional | Submit contact message |
| GET | `/admin/messages` | Admin | List all messages |
| GET | `/history/:userId` | Required | User's contact history |
| PATCH | `/messages/:id/response` | Admin | Add admin response |

### User — `/api/user`
| Method | Path | Auth | Description |
|---|---|---|---|
| PATCH | `/profile` | Required | Update name/phone |
| GET | `/contacts` | Required | List user's contact messages |

### Orders — `/api/orders`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | Customer | Create order (phoneNumber, items[]) |
| GET | `/` | Admin | List all orders |
| GET | `/my` | Customer | User's orders |
| GET | `/me/overview` | Customer | Count by status (pending, confirmed, delivered) |
| GET | `/history` | Customer | Delivered orders (last year) |
| GET | `/user/:userId` | Required | Orders for specific user |
| GET | `/:id/invoice` | Customer | Download PDF invoice (DELIVERED only) |
| PATCH | `/:id` or `/:id/status` | Admin | Update order status (see Order Lifecycle) |
| DELETE | `/:id` | Admin | Delete PENDING order only |

### Shop Reviews — `/api/shop`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/summary` | None | Average rating + count |
| GET | `/reviews/public` | None | Public reviews list |
| POST | `/reviews` | Customer | Create review (rating, message) |
| GET | `/reviews` | Admin | All reviews with user info |

### Analytics — `/api/analytics`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/profit-loss` | Admin | P&L summary for CONFIRMED/DELIVERED orders |

### Admin — `/api/admin`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/logs` | Admin | Admin activity audit trail |

### Health
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | Returns `{ ok: true }` |

---

## 6. Order Lifecycle & Business Logic

### State Machine
```
PENDING  →  CONFIRMED  →  DELIVERED
   ↑             |
   └─────────────┘  (revert: restores stock)
   
PENDING / CONFIRMED  →  RETURNED | CANCELLED  (restores stock)
PENDING only  →  DELETE
```

### Rules
- **Create**: status = PENDING; stock NOT decremented yet
- **CONFIRMED**: admin provides `finalTotalAmount` (must be ≤ `totalAmount`); stock decremented
- **PENDING (revert)**: clears `finalTotalAmount`; stock restored
- **DELIVERED**: invoice PDF generated and URL stored
- **RETURNED / CANCELLED**: stock restored
- **DELETE**: only allowed on PENDING orders

### Financial Model
- `Product.originalPrice` = cost to business (admin-only field)
- `Product.sellingPrice` = listed price to customers
- `OrderItem.price` = snapshot of `sellingPrice` at order time
- `OrderItem.costPerUnit` = snapshot of `originalPrice` at order time
- `Order.finalTotalAmount` = negotiated amount set by admin
- **Profit per order** = `finalTotalAmount − Σ(costPerUnit × quantity)`

---

## 7. Authentication & Authorization

- JWT stored client-side, sent via `Authorization: Bearer <token>` header
- Axios request interceptor automatically attaches token from `localStorage`
- Axios response interceptor: on 401 → clear token + redirect to `/login`
- **Middleware chain** (Backend):
  - `auth` — verify JWT, attach `req.user`
  - `optionalAuth` — attach user if token present, else continue
  - `requireAdmin` — ensure `req.user.role === 'ADMIN'`
- Two roles: `ADMIN`, `CUSTOMER`
- Frontend route guard: `<ProtectedRoute requireAdmin />` wraps all `/admin/*` routes

---

## 8. Frontend Architecture

### State Management
- **AuthContext**: `user, token, login, register, logout, updateUser, isAuthenticated, isAdmin`
- **CartContext**: `items[], addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice`
- **ToastContext**: `showToast(message, type)` with auto-dismiss

### Axios Instance (`frontend/src/config/api.ts`)
- Base URL: `VITE_API_BASE_URL + '/api'` (defaults to `http://localhost:8000/api`)
- Interceptors: attach JWT, handle 401

### Routing
- All customer routes: `/`, `/products`, `/products/:id`, `/categories`, `/cart`, `/contact`, `/dashboard`, `/login`, `/register`
- Admin routes: `/admin/*` — wrapped in `ProtectedRoute` requiring admin role
- 404: catches unmatched routes

### Key Pages
| Page | Path | Role |
|---|---|---|
| Home | `/` | Public |
| Products | `/products` | Auth |
| ProductDetails | `/products/:id` | Auth |
| Categories | `/categories` | Auth |
| Cart | `/cart` | Customer |
| Contact | `/contact` | Any |
| Dashboard | `/dashboard` | Customer |
| Login | `/login` | Guest |
| Register | `/register` | Guest |
| AdminDashboard | `/admin` | Admin |
| AdminProducts | `/admin/products` | Admin |
| ProductForm | `/admin/products/new`, `/admin/products/:id/edit` | Admin |
| AdminCategories | `/admin/categories` | Admin |
| AdminOrders | `/admin/orders` | Admin |
| AdminAnalytics | `/admin/analytics` | Admin |
| AdminShopReviews | `/admin/reviews` | Admin |
| AdminContactMessages | `/admin/contacts` | Admin |
| AdminLogs | `/admin/logs` | Admin |

---

## 9. Environment Variables

### Root `.env` (Docker Compose)
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<secret>
POSTGRES_DB=basanti_shop
JWT_SECRET=<long-random-string>
CORS_ORIGIN=http://localhost
CLOUDINARY_CLOUD_NAME=          # optional
CLOUDINARY_API_KEY=             # optional
CLOUDINARY_API_SECRET=          # optional
VITE_API_BASE_URL=http://localhost:8000
DOCKER_USERNAME=<registry-username>
```

### Backend (`Backend/src/config/env.ts`) — Zod-validated
| Variable | Required | Default | Notes |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | Min recommended 32 chars |
| `PORT` | No | `8000` | HTTP server port |
| `CORS_ORIGIN` | No | — | Comma-separated allowed origins |
| `CLOUDINARY_CLOUD_NAME` | No | — | Feature-gated upload |
| `CLOUDINARY_API_KEY` | No | — | |
| `CLOUDINARY_API_SECRET` | No | — | |
| `NODE_ENV` | No | `development` | |

### Frontend (Vite build arg)
| Variable | Default | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Baked into bundle at build time |

---

## 10. CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

**Trigger:** Push to `main`

**Steps:**
1. `actions/checkout@v4`
2. Docker login (`docker/login-action@v3`)
3. Build + push backend image → `{DOCKER_USERNAME}/basanti-shop-backend:{sha}` + `:latest`
4. Build + push frontend image (with `VITE_API_BASE_URL` build arg) → `{DOCKER_USERNAME}/basanti-shop-frontend:{sha}` + `:latest`
5. SSH into VPS (`appleboy/ssh-action@v1.0.3`) → `docker compose pull && docker compose up -d --force-recreate && docker image prune -f`

**Required GitHub Secrets:**
- `DOCKER_USERNAME`, `DOCKER_TOKEN`
- `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`
- `VITE_API_BASE_URL`

---

## 11. Docker Setup

### Backend Dockerfile (Multi-stage)
- **Builder**: `node:20-alpine` — installs deps, runs `prisma generate`, `npm run build` → `dist/`
- **Runtime**: `node:20-alpine` — copies `dist/` + `prisma/`, exposes `8000`
- **CMD**: runs Prisma migrations then starts server

### Frontend Dockerfile (Multi-stage)
- **Builder**: `node:20-alpine` — `ARG VITE_API_BASE_URL`, installs deps, `npm run build` → `dist/`
- **Runtime**: `nginx:alpine` — copies `dist/` to `/usr/share/nginx/html`, custom `nginx.conf`

### Nginx Config (Frontend)
- SPA fallback: all routes → `index.html`
- API proxy: `/api/*` → `http://backend:8000/api/*`
- Static asset cache: `1 year, immutable`

### Docker Compose (Production)
| Service | Image | Port | Notes |
|---|---|---|---|
| `postgres` | `postgres:16-alpine` | 5432 | Persistent `postgres_data` volume, health check |
| `backend` | Custom build | 8000 | Depends on postgres (healthy) |
| `frontend` | Custom build | 3000→80 | Nginx, depends on backend |

---

## 12. Caching Strategy

| Endpoint Type | Cache-Control |
|---|---|
| Public product list | `public, max-age=30` |
| Auth product endpoints | `private, no-store` |
| Admin endpoints | `private, no-store` |
| Analytics | `private, max-age=10` |
| Nginx static assets | `1 year, immutable` |

---

## 13. Validators (Zod Schemas)

**File:** `Backend/src/validators/`

| File | Validates |
|---|---|
| `auth.validator.ts` | register (name, email, password ≥8 chars, phone), login |
| `product.validator.ts` | create, update, listQuery (filters), rating (int 1–5) |
| `order.validator.ts` | create (phoneNumber, items[]), patch (discriminated union by status) |
| `contact.validator.ts` | create (name, email, phone, message, optional productId) |
| `search.validator.ts` | query string |
| `shopReview.validator.ts` | rating (1–5), message |
| `user.validator.ts` | profile update (name, phone) |
| `category.validator.ts` | create (unique name) |

---

## 14. Key File Paths (Quick Reference)

| Purpose | Path |
|---|---|
| Backend entry | `Backend/src/server.ts` |
| Frontend entry | `frontend/src/main.tsx` |
| Prisma schema | `Backend/prisma/schema.prisma` |
| Env validation | `Backend/src/config/env.ts` |
| Prisma client | `Backend/src/config/prisma.ts` |
| Cloudinary config | `Backend/src/config/cloudinary.ts` |
| Invoice PDF | `Backend/src/config/invoice.ts` |
| JWT utils | `Backend/src/utils/jwt.ts` |
| Axios instance | `frontend/src/config/api.ts` |
| Auth context | `frontend/src/context/AuthContext.tsx` |
| Cart context | `frontend/src/context/CartContext.tsx` |
| Toast context | `frontend/src/context/ToastContext.tsx` |
| Protected route | `frontend/src/components/ProtectedRoute.tsx` |
| CI/CD workflow | `.github/workflows/ci-cd.yml` |
| Docker Compose | `docker-compose.yml` |
| Env template | `.env.example` |

---

## 15. Development Scripts

**Backend** (`cd Backend && ...`):
```bash
npm run dev          # tsx watch (hot reload)
npm run build        # tsc → dist/
npm start            # node dist/server.js
npm run prisma:migrate   # prisma migrate dev
npm run prisma:studio    # Prisma Studio GUI
```

**Frontend** (`cd frontend && ...`):
```bash
npm run dev          # Vite dev server
npm run build        # Vite production build
npm run preview      # Preview production build
```

---

## 16. Notable Design Decisions

1. **No mock DB in tests** — Integration tests use real PostgreSQL (see feedback memory if set).
2. **Cloudinary is optional** — Image upload feature gated; app runs without Cloudinary keys.
3. **Stock managed at CONFIRM not CREATE** — Orders can be placed even if stock fluctuates; stock locked when admin confirms.
4. **Snapshots in OrderItem** — `name`, `price`, `costPerUnit` are copied from Product at order time so P&L is accurate even after product edits.
5. **finalTotalAmount negotiation** — Admin can discount during confirmation; must not exceed original `totalAmount`.
6. **Discriminated union for order PATCH** — Each status transition has its own Zod schema (e.g., CONFIRMED requires `finalTotalAmount`, others don't).
7. **Admin logs everything** — All CRUD + status changes written to `AdminLog` for auditability.
8. **JWT in localStorage** — Simpler for this project; swap to httpOnly cookies for higher security.
9. **ENV validated at startup** — `config/env.ts` throws on missing required vars before server binds.
10. **Decimal for money** — All currency fields use `@db.Decimal` to avoid floating-point errors.
