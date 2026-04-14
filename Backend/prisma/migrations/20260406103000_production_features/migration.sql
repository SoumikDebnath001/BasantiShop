-- Extend OrderStatus enum
ALTER TYPE "OrderStatus" ADD VALUE 'DELIVERED';
ALTER TYPE "OrderStatus" ADD VALUE 'RETURNED';
ALTER TYPE "OrderStatus" ADD VALUE 'CANCELLED';

-- Product: pricing + slug (migrate from price)
ALTER TABLE "Product" ADD COLUMN "originalPrice" DECIMAL(10,2);
ALTER TABLE "Product" ADD COLUMN "sellingPrice" DECIMAL(10,2);
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;

UPDATE "Product" SET "originalPrice" = "price", "sellingPrice" = "price";

UPDATE "Product" SET "slug" = LOWER(REGEXP_REPLACE(TRIM(BOTH '-' FROM REGEXP_REPLACE("name", '[^a-zA-Z0-9]+', '-', 'g')), '^$', 'item', 'g')) || '-' || SUBSTRING("id" FROM 1 FOR 8)
WHERE "slug" IS NULL;

ALTER TABLE "Product" ALTER COLUMN "originalPrice" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "sellingPrice" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "slug" SET NOT NULL;

ALTER TABLE "Product" DROP COLUMN "price";

CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- Order: negotiated total
ALTER TABLE "Order" ADD COLUMN "finalTotalAmount" DECIMAL(12,2);

UPDATE "Order" SET "finalTotalAmount" = "totalAmount" WHERE "status" = 'CONFIRMED';

-- OrderItem: cost snapshot
ALTER TABLE "OrderItem" ADD COLUMN "costPerUnit" DECIMAL(10,2) NOT NULL DEFAULT 0;

UPDATE "OrderItem" oi
SET "costPerUnit" = COALESCE(
  (SELECT p."originalPrice" FROM "Product" p WHERE p.id = oi."productId"),
  0
);

-- ProductRating
CREATE TABLE "ProductRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductRating_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductRating_userId_productId_key" ON "ProductRating"("userId", "productId");
CREATE INDEX "ProductRating_productId_idx" ON "ProductRating"("productId");

ALTER TABLE "ProductRating" ADD CONSTRAINT "ProductRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductRating" ADD CONSTRAINT "ProductRating_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ShopReview
CREATE TABLE "ShopReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopReview_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ShopReview_createdAt_idx" ON "ShopReview"("createdAt");

ALTER TABLE "ShopReview" ADD CONSTRAINT "ShopReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AdminLog
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminLog_adminId_createdAt_idx" ON "AdminLog"("adminId", "createdAt");

ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
