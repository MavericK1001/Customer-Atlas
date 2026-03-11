import { NextRequest, NextResponse } from "next/server";
import { getAccountUserFromRequest } from "@/lib/account-user";
import { canUseFeature, getShopPlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import { resolveShopDomain } from "@/lib/shop-context";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const shopDomain = resolved.shopDomain;
  const plan = await getShopPlan(shopDomain);

  if (
    !canUseFeature({
      feature: "affiliate_portal",
      planTier: plan.planTier,
      billingStatus: plan.billingStatus,
    })
  ) {
    return NextResponse.json(
      { error: "Upgrade to Pro to access the affiliate portal." },
      { status: 402 },
    );
  }

  const accountUser = await getAccountUserFromRequest(request);
  if (!accountUser) {
    return NextResponse.json({ error: "Sign in to access affiliate portal." }, { status: 401 });
  }

  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { merchantUserId: accountUser.id },
    select: {
      id: true,
      status: true,
      commissionRate: true,
      approvedAt: true,
      links: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          code: true,
          label: true,
          isDefault: true,
          createdAt: true,
        },
      },
      apiKeys: {
        where: { revokedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          keyPrefix: true,
          createdAt: true,
          expiresAt: true,
          lastUsedAt: true,
        },
      },
      referrals: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          referredShopDomain: true,
          commissionAmount: true,
          status: true,
          attributedAt: true,
        },
      },
      payouts: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          amount: true,
          status: true,
          periodStart: true,
          periodEnd: true,
          paidAt: true,
        },
      },
    },
  });

  if (!affiliate) {
    return NextResponse.json(
      {
        ok: true,
        hasAffiliateProfile: false,
      },
      { status: 200 },
    );
  }

  return NextResponse.json({
    ok: true,
    hasAffiliateProfile: true,
    affiliate: {
      ...affiliate,
      commissionRate: Number(affiliate.commissionRate),
      referrals: affiliate.referrals.map((referral) => ({
        ...referral,
        commissionAmount: Number(referral.commissionAmount),
      })),
      payouts: affiliate.payouts.map((payout) => ({
        ...payout,
        amount: Number(payout.amount),
      })),
    },
    installBaseUrl: `${request.nextUrl.origin}/install`,
  });
}
