-- CreateTable
CREATE TABLE "AffiliateApiKeyEvent" (
    "id" SERIAL NOT NULL,
    "affiliateId" INTEGER,
    "apiKeyId" INTEGER,
    "eventType" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateApiKeyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AffiliateApiKeyEvent_affiliateId_createdAt_idx" ON "AffiliateApiKeyEvent"("affiliateId", "createdAt");

-- CreateIndex
CREATE INDEX "AffiliateApiKeyEvent_apiKeyId_createdAt_idx" ON "AffiliateApiKeyEvent"("apiKeyId", "createdAt");

-- CreateIndex
CREATE INDEX "AffiliateApiKeyEvent_eventType_createdAt_idx" ON "AffiliateApiKeyEvent"("eventType", "createdAt");

-- AddForeignKey
ALTER TABLE "AffiliateApiKeyEvent" ADD CONSTRAINT "AffiliateApiKeyEvent_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "AffiliateProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateApiKeyEvent" ADD CONSTRAINT "AffiliateApiKeyEvent_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "AffiliateApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
