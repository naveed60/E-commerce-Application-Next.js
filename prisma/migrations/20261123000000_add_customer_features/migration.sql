CREATE TABLE "Coupon" (
  "id" TEXT NOT NULL, "code" TEXT NOT NULL, "percentOff" INTEGER NOT NULL,
  "minimumMinor" INTEGER NOT NULL DEFAULT 0, "startsAt" TIMESTAMP(3), "expiresAt" TIMESTAMP(3),
  "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Coupon_percentOff_check" CHECK ("percentOff" BETWEEN 1 AND 99),
  CONSTRAINT "Coupon_minimumMinor_check" CHECK ("minimumMinor" >= 0)
);
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
ALTER TABLE "Order" ADD COLUMN "couponId" TEXT, ADD COLUMN "discountMinor" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE TABLE "ProductReview" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "productId" TEXT NOT NULL, "orderId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL, "comment" TEXT NOT NULL, "visible" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProductReview_rating_check" CHECK ("rating" BETWEEN 1 AND 5),
  CONSTRAINT "ProductReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ProductReview_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ProductReview_userId_productId_orderId_key" ON "ProductReview"("userId", "productId", "orderId");
CREATE INDEX "ProductReview_productId_visible_idx" ON "ProductReview"("productId", "visible");
CREATE TABLE "RefundRequest" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "orderId" TEXT NOT NULL, "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "RefundRequest_status_check" CHECK ("status" IN ('PENDING', 'REVIEWED', 'CLOSED')),
  CONSTRAINT "RefundRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "RefundRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "RefundRequest_orderId_userId_idx" ON "RefundRequest"("orderId", "userId");
