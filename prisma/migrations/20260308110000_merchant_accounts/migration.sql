CREATE TABLE "MerchantUser" (
  "id" SERIAL NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MerchantUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MerchantUser_email_key" ON "MerchantUser"("email");

ALTER TABLE "AppInstall"
ADD COLUMN "merchantUserId" INTEGER;

CREATE INDEX "AppInstall_merchantUserId_idx" ON "AppInstall"("merchantUserId");

ALTER TABLE "AppInstall"
ADD CONSTRAINT "AppInstall_merchantUserId_fkey"
FOREIGN KEY ("merchantUserId") REFERENCES "MerchantUser"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
