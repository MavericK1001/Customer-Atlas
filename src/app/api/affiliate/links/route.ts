import { NextRequest, NextResponse } from "next/server";
import { getAccountUserFromRequest } from "@/lib/account-user";
import { canUseFeature, getShopPlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import { createAffiliateLink } from "@/lib/services/affiliate-links";
import { resolveShopDomain } from "@/lib/shop-context";

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
      feature: "affiliate_portal",
      planTier: plan.planTier,
      billingStatus: plan.billingStatus,
    })
  ) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Upgrade to Pro to access the affiliate portal." },
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

  const links = await prisma.affiliateReferralLink.findMany({
    where: {
      affiliateId: ctx.affiliateId,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, links });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ctx = await getAffiliateContext(request);
  if (!ctx.ok) {
    return ctx.response;
  }

  const body = (await request.json().catch(() => ({}))) as {
    label?: string;
  };

  const created = await createAffiliateLink({
    affiliateId: ctx.affiliateId,
    label: body.label,
  });

  return NextResponse.json({ ok: true, link: created });
}
