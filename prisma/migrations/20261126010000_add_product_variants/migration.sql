ALTER TABLE "Product" ADD COLUMN "hasVariants" BOOLEAN NOT NULL DEFAULT false;
CREATE TABLE "ProductColor" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "name" TEXT NOT NULL,
  "swatch" TEXT NOT NULL DEFAULT '#000000',
  "images" TEXT[] NOT NULL
);
CREATE INDEX "ProductColor_productId_idx" ON "ProductColor"("productId");
CREATE TABLE "ProductVariant" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "colorId" TEXT REFERENCES "ProductColor"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "size" TEXT NOT NULL DEFAULT '',
  "optionKey" TEXT NOT NULL,
  "sku" TEXT NOT NULL UNIQUE,
  "price" MONEY,
  "inventory" INTEGER NOT NULL DEFAULT 0 CHECK ("inventory" >= 0),
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "ProductVariant_price_positive" CHECK ("price" IS NULL OR "price" > 0::money)
);
CREATE UNIQUE INDEX "ProductVariant_productId_optionKey_key" ON "ProductVariant"("productId", "optionKey");
CREATE INDEX "ProductVariant_productId_active_idx" ON "ProductVariant"("productId", "active");
ALTER TABLE "OrderItem" ADD COLUMN "variantId" TEXT REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 ADD COLUMN "color" TEXT, ADD COLUMN "size" TEXT, ADD COLUMN "sku" TEXT;
