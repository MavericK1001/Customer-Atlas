-- AlterTable
ALTER TABLE "AppInstall" ADD COLUMN     "lastSyncAt" TIMESTAMP(3),
ADD COLUMN     "lastSyncError" TEXT,
ADD COLUMN     "lastSyncStatus" TEXT;
