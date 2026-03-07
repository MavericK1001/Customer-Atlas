-- CreateTable
CREATE TABLE "AppInstall" (
    "id" SERIAL NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppInstall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "shopifyCustomerId" TEXT NOT NULL,
    "email" TEXT,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(12,2) NOT NULL,
    "averageOrderValue" DECIMAL(12,2) NOT NULL,
    "predictedLtv" DECIMAL(12,2) NOT NULL,
    "lastOrderDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "shopifyOrderId" TEXT NOT NULL,
    "customerId" INTEGER,
    "orderValue" DECIMAL(12,2) NOT NULL,
    "products" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Segment" (
    "id" SERIAL NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "segmentName" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "customerCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SegmentMembership" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "segmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SegmentMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" SERIAL NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "insightType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "potentialRevenue" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppInstall_shopDomain_key" ON "AppInstall"("shopDomain");

-- CreateIndex
CREATE INDEX "Customer_shopDomain_idx" ON "Customer"("shopDomain");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_shopDomain_shopifyCustomerId_key" ON "Customer"("shopDomain", "shopifyCustomerId");

-- CreateIndex
CREATE INDEX "Order_shopDomain_idx" ON "Order"("shopDomain");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_shopDomain_shopifyOrderId_key" ON "Order"("shopDomain", "shopifyOrderId");

-- CreateIndex
CREATE INDEX "Segment_shopDomain_idx" ON "Segment"("shopDomain");

-- CreateIndex
CREATE UNIQUE INDEX "Segment_shopDomain_segmentName_key" ON "Segment"("shopDomain", "segmentName");

-- CreateIndex
CREATE INDEX "SegmentMembership_segmentId_idx" ON "SegmentMembership"("segmentId");

-- CreateIndex
CREATE UNIQUE INDEX "SegmentMembership_customerId_segmentId_key" ON "SegmentMembership"("customerId", "segmentId");

-- CreateIndex
CREATE INDEX "Insight_shopDomain_idx" ON "Insight"("shopDomain");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SegmentMembership" ADD CONSTRAINT "SegmentMembership_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SegmentMembership" ADD CONSTRAINT "SegmentMembership_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
