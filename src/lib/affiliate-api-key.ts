import crypto from "crypto";
import { NextRequest } from "next/server";
import {
  consumeAffiliateKeyRateLimit,
  getClientIpAddress,
} from "@/lib/affiliate-key-rate-limit";
import {
  recordAffiliateApiKeyEvent,
} from "@/lib/affiliate-key-security";
import { prisma } from "@/lib/prisma";

function hashKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

function readRawApiKey(request: NextRequest): string | null {
  const headerKey = request.headers.get("x-customeratlas-key")?.trim();
  if (headerKey) {
    return headerKey;
  }

  const authHeader = request.headers.get("authorization")?.trim() ?? "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    return token || null;
  }

  return null;
}

export async function resolveAffiliateByApiKey(request: NextRequest): Promise<
  | {
      ok: true;
      affiliate: {
        id: number;
        merchantUserId: number;
        status: string;
        commissionRate: unknown;
      };
      keyId: number;
    }
  | {
      ok: false;
      status: number;
      error: string;
    }
> {
  const rawKey = readRawApiKey(request);
  if (!rawKey) {
    await recordAffiliateApiKeyEvent({
      eventType: "auth.missing_key",
      request,
    });
    return { ok: false, status: 401, error: "Missing API key." };
  }

  const keyHash = hashKey(rawKey);
  const now = new Date();

  const keyRecord = await prisma.affiliateApiKey.findFirst({
    where: {
      keyHash,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      affiliate: { status: "active" },
    },
    select: {
      id: true,
      affiliate: {
        select: {
          id: true,
          merchantUserId: true,
          status: true,
          commissionRate: true,
        },
      },
    },
  });

  if (!keyRecord) {
    await recordAffiliateApiKeyEvent({
      eventType: "auth.invalid_key",
      request,
    });
    return { ok: false, status: 401, error: "Invalid or expired API key." };
  }

  const rateLimitResult = consumeAffiliateKeyRateLimit({
    apiKeyId: keyRecord.id,
    ipAddress: getClientIpAddress(request),
  });

  if (!rateLimitResult.ok) {
    await recordAffiliateApiKeyEvent({
      affiliateId: keyRecord.affiliate.id,
      apiKeyId: keyRecord.id,
      eventType: "auth.rate_limited",
      request,
      details: {
        retryAfterSeconds: rateLimitResult.retryAfterSeconds,
      },
    });

    return { ok: false, status: 429, error: "Rate limit exceeded for this API key." };
  }

  await prisma.affiliateApiKey.update({
    where: { id: keyRecord.id },
    data: { lastUsedAt: now },
  });

  await recordAffiliateApiKeyEvent({
    affiliateId: keyRecord.affiliate.id,
    apiKeyId: keyRecord.id,
    eventType: "auth.success",
    request,
  });

  return {
    ok: true,
    keyId: keyRecord.id,
    affiliate: keyRecord.affiliate,
  };
}
