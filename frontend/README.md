# E‑commerce Store — Full Stack

Production-oriented storefront with a **React (Vite) SPA**, **Express REST API**, and **PostgreSQL** via Prisma. The UI is unchanged from the original design; integration work connects real APIs, authentication, and persisted data.

---

## 1. Project overview

- **Customers**: browse products (search, filters, sort, pagination), view details, **cart (signed-in only, per-user in `localStorage`)**, **place order** (pending until admin confirms), contact seller / contact form, account dashboard (profile, contact history, order list).
- **Admins**: JWT-protected admin area for product CRUD (buy/sell pricing), **Cloudinary image uploads**, full **order lifecycle** with **negotiated totals**, **profit/loss analytics**, **shop review inbox**, and **activity logging**.
- **Backend**: REST API under `/api`, JWT auth, Zod validation, rate limiting, Helmet, CORS.

---

## 2. Tech stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, TypeScript, Vite 5, TailwindCSS, React Router 6, React Hook Form, Axios |
| Backend  | Node.js 20+, Express 5, Prisma 7, PostgreSQL, Zod, bcrypt, JWT, Helmet, express-rate-limit |
| Database | PostgreSQL |

---

## 3. Setup instructions

### Prerequisites

- Node.js 20+
- PostgreSQL instance and a database URL

### Backend (`Backend/`)

```bash
cd Backend
cp .env.example .env   # or create .env — see Backend/README.md
# Set DATABASE_URL, JWT_SECRET, PORT=8000, CORS_ORIGIN=http://localhost:5173
npm install
npx prisma migrate dev
npm run dev
```

API base URL: `http://localhost:8000/api`

### Frontend (project root)

```bash
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:8000/api
npm install
npm run dev
```

Open `http://localhost:5173`.

### Admin user

1. Register a normal account via `/register`.
2. Promote to admin in the database, e.g.:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

(Or use Prisma Studio: `cd Backend && npx prisma studio`.)

---

## 4. Environment variables

### Frontend (`.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Full API prefix, e.g. `http://localhost:8000/api` |

### Backend (`Backend/.env`)

See **`Backend/README.md`** for `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`, and optional Cloudinary keys.

---

## 5. API documentation

All routes are prefixed with **`/api`**. Full tables (methods, bodies, responses) are in **`Backend/README.md`**.

Summary:

| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/register`, `/auth/login` | No |
| GET | `/auth/me` | Bearer JWT |
| PATCH | `/user/profile` | Bearer JWT |
| GET | `/user/contacts` | Bearer JWT |
| GET | `/products`, `/products/:id` (id or **slug**) | No (optional JWT adds `myRating` on products) |
| GET | `/products/admin`, `/products/admin/:id` | Admin JWT |
| POST | `/products/:id/ratings` | Customer JWT — product rating |
| POST, PUT, DELETE | `/products`, `/products/:id` | Admin JWT |
| POST | `/contact` | Optional JWT (links message to user if present) |
| POST | `/orders` | Customer JWT — create order (`PENDING`) |
| GET | `/orders/my` | Customer JWT — own orders |
| GET | `/orders` | Admin JWT — all orders |
| PATCH | `/orders/:id` | Admin JWT — lifecycle / negotiation (see below) |
| DELETE | `/orders/:id` | Admin JWT — delete **PENDING** order |
| GET | `/analytics/profit-loss` | Admin JWT |
| GET | `/shop/summary` | No |
| POST | `/shop/reviews` | Customer JWT — shop review (not product) |
| GET | `/shop/reviews` | Admin JWT — all shop reviews |
| GET | `/admin/logs` | Admin JWT — activity log |
| POST | `/uploads/images` | Admin JWT + Cloudinary env |

### Order lifecycle & negotiation

Statuses: **`PENDING`** → **`CONFIRMED`** → **`DELIVERED`** → **`RETURNED`** or **`CANCELLED`** (from delivered). **Unconfirm** moves **`CONFIRMED` → `PENDING`** and restocks.

1. Customer places an order (`PENDING`); line items snapshot **selling** `price` and **cost** `costPerUnit` for later P&amp;L.
2. Admin **confirms** with a **final total** ≤ listed cart total (negotiated). Stock is decremented on confirm.
3. Admin can **unconfirm** (restock), **mark delivered**, then **returned** or **cancelled** (both restock delivered inventory).
4. Admin can **delete** pending orders (`DELETE /orders/:id`).

**Profit/loss** (confirmed + delivered orders):  
`profit = finalTotalAmount − Σ(costPerUnit × quantity)` (aggregated in `GET /api/analytics/profit-loss`).

### Image upload flow

1. Admin selects files in the product form; frontend `POST /api/uploads/images` (multipart `images[]`).
2. Backend uploads to **Cloudinary**, returns **HTTPS** URLs.
3. Product create/update stores those URLs; Zod enforces HTTPS image URLs.

### Admin activity log

Persisted actions (e.g. `CREATE_PRODUCT`, `CONFIRM_ORDER`, `ADMIN_LOGIN`) with JSON `details` — `GET /api/admin/logs`.

### SEO (frontend)

- Default `<meta name="description">` in `index.html`; route-level titles/descriptions via a small `Seo` helper.
- Product URLs use **slugs** where available (`/products/:slug`); legacy cart entries still resolve by **id**.
- Richer **alt** text and **sr-only** headings on the product page for structure/accessibility.

---

## 6. Features (verified integration)

| Feature | Status |
|---------|--------|
| Register / login / JWT | Real API; token stored in `localStorage`; session refreshed via `GET /auth/me` on load |
| Role-based routes (admin vs customer) | Frontend `ProtectedRoute` + backend role checks |
| Product listing with filters | Real `GET /products` |
| Product detail & admin CRUD | Real endpoints |
| Cart | Per-user `localStorage`; only while signed in; `/cart` is protected; navbar cart hidden for guests |
| Place order | `POST /orders` from cart; clears cart on success |
| Admin orders | `/admin/orders` — **Unconfirmed / Confirmed / Delivered**; confirm with negotiated total; unconfirm, deliver, return, cancel, delete pending |
| Profit & loss | `/admin/analytics` + dashboard widgets from `GET /analytics/profit-loss` |
| Shop reviews | Dashboard **Review the shop**; admin `/admin/shop-reviews` |
| Activity log | `/admin/logs` |
| Product ratings | Product detail — stars + `POST /products/:id/ratings` |
| Cloudinary uploads | Admin product form file upload → `/uploads/images` |
| Contact forms | `POST /contact`; optional auth attaches user for history |
| Dashboard profile, contacts & orders | `PATCH /user/profile`, `GET /user/contacts`, `GET /orders/my` |
| Health check | `GET /health` |

---

## 7. Folder structure

```
├── src/                 # React SPA (pages, components, services, contexts)
├── Backend/
│   ├── prisma/          # Schema & migrations
│   └── src/             # Express app, routes, services, middlewares, validators
├── .env.example         # Frontend env template
└── README.md            # This file
```

---

## 8. Security measures

- **Backend**: Password hashing (bcrypt), JWT signed with `JWT_SECRET`, Zod validation on inputs, HTML stripped from free-text fields where applicable, parameterized queries via Prisma (SQL injection mitigation), Helmet security headers, CORS allowlist via `CORS_ORIGIN`, rate limiting on `/api` and stricter limits on `/api/auth`, `trust proxy` for correct IP behind reverse proxies.
- **Frontend**: `Authorization: Bearer` on authenticated requests; 401 clears session except on login/register failures; API errors surfaced via `error` field from backend.
- **JWT storage**: Tokens are kept in **`localStorage`** (typical for SPAs). For maximum token protection against XSS, prefer **httpOnly cookies** + CSRF strategy in a future hardening pass; always use **HTTPS** in production and a strong `JWT_SECRET`.

---

## 9. Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| Root | `npm run dev` | Vite dev server |
| Root | `npm run build` | Production build |
| Backend | `npm run dev` | API with watch |
| Backend | `npm run build` / `npm start` | Compile & run |

---

## 10. License

Private / client project — use per your agreement.
