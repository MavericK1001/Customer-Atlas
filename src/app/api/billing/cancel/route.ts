import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cancelSubscription } from "@/lib/shopify-billing";
import { resolveShopDomain } from "@/lib/shop-context";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const install = await prisma.appInstall.findUnique({
    where: { shopDomain: resolved.shopDomain },
    select: {
      shopDomain: true,
      accessToken: true,
      shopifySubscriptionId: true,
    },
  });

  if (!install) {
    return NextResponse.json({ error: "Shop is not installed." }, { status: 404 });
  }

  if (install.shopifySubscriptionId) {
    await cancelSubscription({
      shop: install.shopDomain,
      accessToken: install.accessToken,
      subscriptionId: install.shopifySubscriptionId,
    });
  }

  await prisma.appInstall.update({
    where: { shopDomain: install.shopDomain },
    data: {
      planTier: "free",
      billingStatus: "canceled",
      shopifySubscriptionId: null,
      trialEndsAt: null,
    },
  });

  return NextResponse.json({
    ok: true,
    planTier: "free",
    billingStatus: "canceled",
  });
}
