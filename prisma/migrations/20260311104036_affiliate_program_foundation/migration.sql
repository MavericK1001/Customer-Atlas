-- AlterTable
ALTER TABLE "MerchantUser" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'merchant';

-- CreateTable
CREATE TABLE "AffiliateApplication" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "companyName" TEXT,
    "websiteUrl" TEXT,
    "audienceNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewerNotes" TEXT,
    "merchantUserId" INTEGER,
    "reviewedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "AffiliateApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateProfile" (
    "id" SERIAL NOT NULL,
    "merchantUserId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "commissionRate" DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateReferralLink" (
    "id" SERIAL NOT NULL,
    "affiliateId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "AffiliateReferralLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateReferral" (
    "id" SERIAL NOT NULL,
    "affiliateId" INTEGER NOT NULL,
    "referralLinkId" INTEGER,
    "appInstallId" INTEGER NOT NULL,
    "referredShopDomain" TEXT NOT NULL,
    "commissionRate" DECIMAL(5,2) NOT NULL,
    "commissionAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT NOT NULL DEFAULT 'install-ref',
    "attributedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateReferral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateApiKey" (
    "id" SERIAL NOT NULL,
    "affiliateId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliatePayout" (
    "id" SERIAL NOT NULL,
    "affiliateId" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'calculated',
    "notes" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliatePayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AffiliateApplication_email_idx" ON "AffiliateApplication"("email");

-- CreateIndex
CREATE INDEX "AffiliateApplication_status_idx" ON "AffiliateApplication"("status");

-- CreateIndex
CREATE INDEX "AffiliateApplication_merchantUserId_idx" ON "AffiliateApplication"("merchantUserId");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateProfile_merchantUserId_key" ON "AffiliateProfile"("merchantUserId");

-- CreateIndex
CREATE INDEX "AffiliateProfile_status_idx" ON "AffiliateProfile"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateReferralLink_code_key" ON "AffiliateReferralLink"("code");

-- CreateIndex
CREATE INDEX "AffiliateReferralLink_affiliateId_idx" ON "AffiliateReferralLink"("affiliateId");

-- CreateIndex
CREATE INDEX "AffiliateReferralLink_affiliateId_isActive_idx" ON "AffiliateReferralLink"("affiliateId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateReferral_appInstallId_key" ON "AffiliateReferral"("appInstallId");

-- CreateIndex
CREATE INDEX "AffiliateReferral_affiliateId_idx" ON "AffiliateReferral"("affiliateId");

-- CreateIndex
CREATE INDEX "AffiliateReferral_referredShopDomain_idx" ON "AffiliateReferral"("referredShopDomain");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateReferral_affiliateId_referredShopDomain_key" ON "AffiliateReferral"("affiliateId", "referredShopDomain");

-- CreateIndex
CREATE INDEX "AffiliateApiKey_affiliateId_idx" ON "AffiliateApiKey"("affiliateId");

-- CreateIndex
CREATE INDEX "AffiliateApiKey_affiliateId_revokedAt_idx" ON "AffiliateApiKey"("affiliateId", "revokedAt");

-- CreateIndex
CREATE INDEX "AffiliatePayout_affiliateId_idx" ON "AffiliatePayout"("affiliateId");

-- CreateIndex
CREATE INDEX "AffiliatePayout_affiliateId_status_idx" ON "AffiliatePayout"("affiliateId", "status");

-- AddForeignKey
ALTER TABLE "AffiliateApplication" ADD CONSTRAINT "AffiliateApplication_merchantUserId_fkey" FOREIGN KEY ("merchantUserId") REFERENCES "MerchantUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateApplication" ADD CONSTRAINT "AffiliateApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "MerchantUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateProfile" ADD CONSTRAINT "AffiliateProfile_merchantUserId_fkey" FOREIGN KEY ("merchantUserId") REFERENCES "MerchantUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateReferralLink" ADD CONSTRAINT "AffiliateReferralLink_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "AffiliateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateReferral" ADD CONSTRAINT "AffiliateReferral_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "AffiliateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateReferral" ADD CONSTRAINT "AffiliateReferral_referralLinkId_fkey" FOREIGN KEY ("referralLinkId") REFERENCES "AffiliateReferralLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateReferral" ADD CONSTRAINT "AffiliateReferral_appInstallId_fkey" FOREIGN KEY ("appInstallId") REFERENCES "AppInstall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateApiKey" ADD CONSTRAINT "AffiliateApiKey_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "AffiliateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliatePayout" ADD CONSTRAINT "AffiliatePayout_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "AffiliateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
