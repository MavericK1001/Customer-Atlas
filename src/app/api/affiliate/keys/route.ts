import { NextRequest, NextResponse } from "next/server";
import { getAccountUserFromRequest } from "@/lib/account-user";
import { recordAffiliateApiKeyEvent } from "@/lib/affiliate-key-security";
import { canUseFeature, getShopPlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import { createAffiliateApiKey } from "@/lib/services/affiliate-keys";
import { resolveShopDomain } from "@/lib/shop-context";

const MAX_ACTIVE_KEYS_PER_AFFILIATE = 5;

async function getAffiliateContext(request: NextRequest): Promise<
  | {
      ok: true;
      affiliateId: number;
    }
  | {
      ok: false;
      response: NextResponse;
    }
> {
  const resolved = await resolveShopDomain(request);
  if (!resolved.ok) {
    return {
      ok: false,
      response: NextResponse.json({ error: resolved.error }, { status: resolved.status }),
    };
  }

  const plan = await getShopPlan(resolved.shopDomain);
  if (
    !canUseFeature({
      feature: "affiliate_api_keys",
      planTier: plan.planTier,
      billingStatus: plan.billingStatus,
    })
  ) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Upgrade to Pro to manage affiliate keys." },
        { status: 402 },
      ),
    };
  }

  const accountUser = await getAccountUserFromRequest(request);
  if (!accountUser) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }

  const profile = await prisma.affiliateProfile.findUnique({
    where: { merchantUserId: accountUser.id },
    select: { id: true, status: true },
  });

  if (!profile || profile.status !== "active") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Affiliate profile not active yet." },
        { status: 403 },
      ),
    };
  }

  return { ok: true, affiliateId: profile.id };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const ctx = await getAffiliateContext(request);
  if (!ctx.ok) {
    return ctx.response;
  }

  const keys = await prisma.affiliateApiKey.findMany({
    where: {
      affiliateId: ctx.affiliateId,
      revokedAt: null,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
      expiresAt: true,
      lastUsedAt: true,
    },
  });

  return NextResponse.json({ ok: true, keys });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ctx = await getAffiliateContext(request);
  if (!ctx.ok) {
    return ctx.response;
  }

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    expiresInDays?: number | null;
  };

  const keyName = (body.name ?? "New API Key").trim();
  if (keyName.length < 2) {
    return NextResponse.json({ error: "Key name is too short." }, { status: 400 });
  }

  const activeKeyCount = await prisma.affiliateApiKey.count({
    where: {
      affiliateId: ctx.affiliateId,
      revokedAt: null,
    },
  });

  if (activeKeyCount >= MAX_ACTIVE_KEYS_PER_AFFILIATE) {
    return NextResponse.json(
      {
        error: `You can have up to ${MAX_ACTIVE_KEYS_PER_AFFILIATE} active keys. Revoke one before creating a new key.`,
      },
      { status: 409 },
    );
  }

  let expiresAt: Date | null = null;
  if (typeof body.expiresInDays === "number") {
    if (!Number.isFinite(body.expiresInDays) || body.expiresInDays < 1) {
      return NextResponse.json(
        { error: "expiresInDays must be a positive number." },
        { status: 400 },
      );
    }

    if (body.expiresInDays > 365) {
      return NextResponse.json(
        { error: "expiresInDays cannot exceed 365 days." },
        { status: 400 },
      );
    }

    const nowMs = Date.now();
    expiresAt = new Date(nowMs + body.expiresInDays * 24 * 60 * 60 * 1000);
  }

  const created = await createAffiliateApiKey({
    affiliateId: ctx.affiliateId,
    name: keyName,
    expiresAt,
  });

  await recordAffiliateApiKeyEvent({
    affiliateId: ctx.affiliateId,
    apiKeyId: created.id,
    eventType: "key.created",
    request,
    details: {
      keyName,
      expiresAt: expiresAt?.toISOString() ?? null,
    },
  });

  return NextResponse.json({
    ok: true,
    key: {
      id: created.id,
      keyPrefix: created.keyPrefix,
      plainTextKey: created.plainTextKey,
      expiresAt,
    },
  });
}
