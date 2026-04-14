# Backend

Express + Prisma (PostgreSQL) API for the ecommerce frontend.

## Setup

From `Backend/`:

```bash
npm install
```

Create/update `.env`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@127.0.0.1:5432/DB_NAME"
JWT_SECRET="change-me"
PORT=8000
CORS_ORIGIN="http://localhost:5173"

# Optional (only needed for image uploads)
# CLOUDINARY_CLOUD_NAME="..."
# CLOUDINARY_API_KEY="..."
# CLOUDINARY_API_SECRET="..."
```

Run migrations + generate client:

```bash
npx prisma migrate dev
```

Start dev server:

```bash
npm run dev
```

The frontend is configured to call `http://localhost:8000/api`.

## Scripts

- `npm run dev`: run dev server (watch)
- `npm run build`: compile to `dist/`
- `npm start`: run compiled server
- `npm run prisma:migrate`: run migrations (dev)
- `npm run prisma:studio`: open Prisma Studio

## API

All routes are under `/api`.

### Auth

#### `POST /api/auth/register`

Request:

```json
{ "name": "Jane Cooper", "email": "jane@example.com", "password": "password123", "phone": "+1 555 0100" }
```

Response:

```json
{ "token": "…", "user": { "id": "…", "name": "…", "email": "…", "role": "customer", "phone": "+1 555 0100", "createdAt": "…" } }
```

#### `POST /api/auth/login`

Request:

```json
{ "email": "jane@example.com", "password": "password123" }
```

Response: same shape as register.

#### `GET /api/auth/me` (protected)

Header:

`Authorization: Bearer <token>`

Response:

```json
{ "id": "…", "name": "…", "email": "…", "role": "customer", "phone": "+1 555 0100", "createdAt": "…" }
```

### Products

#### `GET /api/products`

Query params (all optional):
- `search`
- `category`
- `minPrice`
- `maxPrice`
- `sortBy` (`newest` | `price-asc` | `price-desc` | `name`)
- `page` (default 1)
- `limit` (default 8)

Response:

```json
{ "data": [/* Product[] */], "total": 0, "page": 1, "limit": 8, "totalPages": 0 }
```

#### `GET /api/products/:id`

`id` may be a **cuid** or a **slug**.

Public product (selling price only as `price`):

```json
{
  "id": "…",
  "slug": "watch-…",
  "name": "…",
  "description": "…",
  "price": 299.99,
  "category": "Electronics",
  "stock": 15,
  "images": ["https://…"],
  "shortDescription": "…",
  "createdAt": "…",
  "averageRating": 4.2,
  "ratingCount": 12,
  "myRating": 5
}
```

`myRating` is present only when the request includes a valid customer/admin JWT.

#### `GET /api/products/admin` (admin)

Admin catalog list with **cost + sell** prices (`originalPrice`, `sellingPrice`, `price` mirrors sell).

#### `GET /api/products/admin/:id` (admin)

Single product for edit (admin fields).

#### `POST /api/products/:id/ratings` (customer)

Body: `{ "rating": 1–5 }`. Upserts the caller’s rating; response is the public product object.

#### `POST /api/products` (protected, admin)

Header:

`Authorization: Bearer <token>`

Request:

```json
{
  "name": "…",
  "description": "…",
  "originalPrice": 40,
  "sellingPrice": 99.99,
  "category": "Electronics",
  "stock": 3,
  "images": ["https://res.cloudinary.com/…"],
  "shortDescription": "…"
}
```

`images` must be **HTTPS** URLs (typically from `POST /api/uploads/images`).

Response: Product

#### `PUT /api/products/:id` (protected, admin)

Header:

`Authorization: Bearer <token>`

Request: partial product fields (same keys as create)

Response: Product

#### `DELETE /api/products/:id` (protected, admin)

Response: `204 No Content`

### User (authenticated customer)

#### `PATCH /api/user/profile`

Header: `Authorization: Bearer <token>`

Request:

```json
{ "name": "Jane Cooper", "phone": "+1 555 0100" }
```

Response: `User` (same shape as `/auth/me`).

#### `GET /api/user/contacts`

Header: `Authorization: Bearer <token>`

Response:

```json
{
  "data": [
    {
      "id": "…",
      "productName": "General enquiry",
      "productId": null,
      "createdAt": "…",
      "preview": "Message preview…"
    }
  ]
}
```

### Orders

#### `POST /api/orders` (customer)

Header: `Authorization: Bearer <token>`

Request:

```json
{
  "phoneNumber": "+1 555 0100",
  "items": [{ "productId": "…", "quantity": 2 }]
}
```

Response: `201` — order includes `totalAmount` (listed cart total), `finalTotalAmount` (null until negotiated), `displayTotal`, `status`, `items[]` with per-line `price` (sell snapshot) and `costPerUnit` (buy snapshot for P&amp;L).

Stock is validated at creation; inventory is **decremented when the order is confirmed** by an admin.

#### `GET /api/orders/my` (customer)

Returns an array of the caller’s orders (same shape as above).

#### `GET /api/orders` (admin)

Returns all orders, newest first.

#### `PATCH /api/orders/:id` (admin)

Body is a **discriminated union** on `status`:

| `status` | Extra fields | From → to |
|----------|----------------|-----------|
| `CONFIRMED` | `finalTotalAmount` (number, ≤ listed `totalAmount`) | `PENDING` → `CONFIRMED`, decrements stock |
| `PENDING` | — | `CONFIRMED` → `PENDING`, restocks, clears `finalTotalAmount` |
| `DELIVERED` | — | `CONFIRMED` → `DELIVERED` |
| `RETURNED` | — | `DELIVERED` → `RETURNED`, restocks |
| `CANCELLED` | — | `DELIVERED` → `CANCELLED`, restocks |

#### `DELETE /api/orders/:id` (admin)

Deletes a **PENDING** order only.

### Contact

#### `POST /api/contact`

Request:

```json
{ "name": "…", "phone": "…", "email": "…", "message": "…", "productName": "…", "productId": "…" }
```

Response: `204 No Content`

When the request includes a valid `Authorization` header, the message is linked to that user for **Contact History** in the dashboard.

### Uploads (optional, requires Cloudinary)

#### `POST /api/uploads/images` (protected, admin)

Multipart form-data:
- field name: `images` (up to 10 files)

Response:

```json
{ "urls": ["https://…"] }
```

### Analytics (admin)

#### `GET /api/analytics/profit-loss`

Returns `{ "summary": { "totalSales", "totalProfit", "totalLoss", "orderCount" }, "orders": [ … ] }` for orders in **`CONFIRMED`** or **`DELIVERED`** with a set `finalTotalAmount`. Per-order **profit** = `finalTotal` − sum(`costPerUnit` × `quantity`).

### Shop reviews

#### `GET /api/shop/summary`

Public aggregate: `{ "averageRating", "reviewCount" }`.

#### `POST /api/shop/reviews` (customer)

Body: `{ "rating": 1–5, "message": "…" }`.

#### `GET /api/shop/reviews` (admin)

All shop reviews with user info.

### Admin activity log

#### `GET /api/admin/logs?limit=100`

Admin-only JSON array of `{ id, adminId, action, details, createdAt, admin }`. Actions include product CRUD, order lifecycle changes, `ADMIN_LOGIN`, etc.

