import { NextRequest, NextResponse } from "next/server";
import { getAccountUserFromRequest } from "@/lib/account-user";
import { canUseFeature, getShopPlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import { resolveShopDomain } from "@/lib/shop-context";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const plan = await getShopPlan(resolved.shopDomain);
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
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const profile = await prisma.affiliateProfile.findUnique({
    where: { merchantUserId: accountUser.id },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Affiliate profile not found." }, { status: 404 });
  }

  const { id } = await context.params;
  const linkId = Number.parseInt(id, 10);
  if (!Number.isFinite(linkId)) {
    return NextResponse.json({ error: "Invalid link id." }, { status: 400 });
  }

  const updated = await prisma.affiliateReferralLink.updateMany({
    where: {
      id: linkId,
      affiliateId: profile.id,
      isDefault: false,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  if (updated.count === 0) {
    return NextResponse.json(
      { error: "Link not found or cannot remove default link." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
