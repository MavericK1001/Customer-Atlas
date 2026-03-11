import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export type CreatedAffiliateKey = {
  id: number;
  plainTextKey: string;
  keyPrefix: string;
};

function randomToken(size = 24): string {
  return crypto.randomBytes(size).toString("hex");
}

function hashKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export async function createAffiliateApiKey(input: {
  affiliateId: number;
  name: string;
  expiresAt?: Date | null;
}): Promise<CreatedAffiliateKey> {
  const token = `ca_aff_${randomToken(20)}`;
  const keyPrefix = token.slice(0, 12);

  const created = await prisma.affiliateApiKey.create({
    data: {
      affiliateId: input.affiliateId,
      name: input.name,
      keyPrefix,
      keyHash: hashKey(token),
      expiresAt: input.expiresAt ?? null,
    },
    select: {
      id: true,
      keyPrefix: true,
    },
  });

  return {
    id: created.id,
    keyPrefix: created.keyPrefix,
    plainTextKey: token,
  };
}

export async function revokeAffiliateApiKey(input: {
  keyId: number;
  affiliateId: number;
}): Promise<boolean> {
  const updated = await prisma.affiliateApiKey.updateMany({
    where: {
      id: input.keyId,
      affiliateId: input.affiliateId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  return updated.count > 0;
}
