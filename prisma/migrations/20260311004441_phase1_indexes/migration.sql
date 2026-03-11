-- CreateIndex
CREATE INDEX "AppInstall_shopDomain_billingStatus_idx" ON "AppInstall"("shopDomain", "billingStatus");

-- CreateIndex
CREATE INDEX "Order_shopDomain_createdAt_idx" ON "Order"("shopDomain", "createdAt");
