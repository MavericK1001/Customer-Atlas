ALTER TABLE "AppInstall"
ADD COLUMN "planTier" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN "billingStatus" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN "shopifySubscriptionId" TEXT,
ADD COLUMN "trialEndsAt" TIMESTAMP(3);
