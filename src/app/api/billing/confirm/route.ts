import { NextRequest, NextResponse } from "next/server";
import { requiredEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getActiveSubscriptions } from "@/lib/shopify-billing";
import { normalizeShopDomain } from "@/lib/shop";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const shop = normalizeShopDomain(request.nextUrl.searchParams.get("shop"));
  if (!shop) {
    return NextResponse.json({ error: "Valid shop query parameter is required." }, { status: 400 });
  }

  const install = await prisma.appInstall.findUnique({
    where: { shopDomain: shop },
    select: {
      accessToken: true,
      shopDomain: true,
    },
  });

  if (!install) {
    return NextResponse.json({ error: "Shop is not installed." }, { status: 404 });
  }

  const subscriptions = await getActiveSubscriptions({
    shop,
    accessToken: install.accessToken,
  });

  if (subscriptions.length === 0) {
    await prisma.appInstall.update({
      where: { shopDomain: shop },
      data: {
        planTier: "free",
        billingStatus: "inactive",
        shopifySubscriptionId: null,
      },
    });

    const settingsUrl = new URL("/settings", requiredEnv("SHOPIFY_APP_URL"));
    settingsUrl.searchParams.set("shop", shop);
    settingsUrl.searchParams.set("billing", "not-active");
    return NextResponse.redirect(settingsUrl.toString());
  }

  const active = subscriptions[0];

  await prisma.appInstall.update({
    where: { shopDomain: shop },
    data: {
      planTier: "pro",
      billingStatus: active.status.toLowerCase(),
      shopifySubscriptionId: active.id,
    },
  });

  const settingsUrl = new URL("/settings", requiredEnv("SHOPIFY_APP_URL"));
  settingsUrl.searchParams.set("shop", shop);
  settingsUrl.searchParams.set("billing", "upgraded");
  return NextResponse.redirect(settingsUrl.toString());
}
