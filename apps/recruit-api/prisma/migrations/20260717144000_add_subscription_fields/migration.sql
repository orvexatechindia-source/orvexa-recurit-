-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "offer_letter" TEXT,
ADD COLUMN     "offer_status" TEXT,
ADD COLUMN     "signed_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "billing_provider" TEXT,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'US',
ADD COLUMN     "grace_period_days" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "subscription_expiry" TIMESTAMP(3),
ADD COLUMN     "subscription_id" TEXT,
ADD COLUMN     "subscription_plan" TEXT NOT NULL DEFAULT 'FREE',
ADD COLUMN     "subscription_status" TEXT NOT NULL DEFAULT 'ACTIVE';
