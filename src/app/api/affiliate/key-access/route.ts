import { NextRequest, NextResponse } from "next/server";
import { resolveAffiliateByApiKey } from "@/lib/affiliate-api-key";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const keyAuth = await resolveAffiliateByApiKey(request);
  if (!keyAuth.ok) {
    const headers = new Headers();
    if (keyAuth.status === 429) {
      headers.set("Retry-After", "60");
    }

    return NextResponse.json(
      { error: keyAuth.error },
      { status: keyAuth.status, headers },
    );
  }

  const [links, referrals, payouts] = await Promise.all([
    prisma.affiliateReferralLink.findMany({
      where: {
        affiliateId: keyAuth.affiliate.id,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        code: true,
        label: true,
        isDefault: true,
      },
    }),
    prisma.affiliateReferral.findMany({
      where: { affiliateId: keyAuth.affiliate.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        referredShopDomain: true,
        commissionAmount: true,
        status: true,
        attributedAt: true,
      },
    }),
    prisma.affiliatePayout.findMany({
      where: { affiliateId: keyAuth.affiliate.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        amount: true,
        status: true,
        periodStart: true,
        periodEnd: true,
        paidAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    affiliate: {
      id: keyAuth.affiliate.id,
      status: keyAuth.affiliate.status,
      commissionRate: Number(keyAuth.affiliate.commissionRate),
    },
    keyId: keyAuth.keyId,
    links,
    referrals: referrals.map((referral) => ({
      ...referral,
      commissionAmount: Number(referral.commissionAmount),
    })),
    payouts: payouts.map((payout) => ({
      ...payout,
      amount: Number(payout.amount),
    })),
  });
}
