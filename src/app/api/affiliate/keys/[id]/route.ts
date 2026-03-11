import { NextRequest, NextResponse } from "next/server";
import { getAccountUserFromRequest } from "@/lib/account-user";
import { recordAffiliateApiKeyEvent } from "@/lib/affiliate-key-security";
import { canUseFeature, getShopPlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import { revokeAffiliateApiKey } from "@/lib/services/affiliate-keys";
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
      feature: "affiliate_api_keys",
      planTier: plan.planTier,
      billingStatus: plan.billingStatus,
    })
  ) {
    return NextResponse.json(
      { error: "Upgrade to Pro to manage affiliate keys." },
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
  const keyId = Number.parseInt(id, 10);
  if (!Number.isFinite(keyId)) {
    return NextResponse.json({ error: "Invalid key id." }, { status: 400 });
  }

  const revoked = await revokeAffiliateApiKey({
    keyId,
    affiliateId: profile.id,
  });

  if (!revoked) {
    await recordAffiliateApiKeyEvent({
      affiliateId: profile.id,
      apiKeyId: keyId,
      eventType: "key.revoke_failed",
      request,
    });

    return NextResponse.json({ error: "Key not found." }, { status: 404 });
  }

  await recordAffiliateApiKeyEvent({
    affiliateId: profile.id,
    apiKeyId: keyId,
    eventType: "key.revoked",
    request,
  });

  return NextResponse.json({ ok: true });
}
