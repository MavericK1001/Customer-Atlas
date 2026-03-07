-- AlterTable
ALTER TABLE "Insight" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Insight_shopDomain_archivedAt_idx" ON "Insight"("shopDomain", "archivedAt");
