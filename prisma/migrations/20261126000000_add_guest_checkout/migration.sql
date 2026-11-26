-- Keep existing account orders and allow new orders without an account.
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "Order" ADD COLUMN "guestAccessHash" TEXT;
