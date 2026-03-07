import { NextRequest, NextResponse } from "next/server";
import { requiredEnv } from "@/lib/env";
import { reconcileInstallBilling } from "@/lib/billing-reconcile";
import { prisma } from "@/lib/prisma";
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

  const reconciled = await reconcileInstallBilling({
    shopDomain: install.shopDomain,
    accessToken: install.accessToken,
  });

  if (reconciled.planTier !== "pro") {

    const settingsUrl = new URL("/settings", requiredEnv("SHOPIFY_APP_URL"));
    settingsUrl.searchParams.set("shop", shop);
    settingsUrl.searchParams.set("billing", "not-active");
    return NextResponse.redirect(settingsUrl.toString());
  }

  const settingsUrl = new URL("/settings", requiredEnv("SHOPIFY_APP_URL"));
  settingsUrl.searchParams.set("shop", shop);
  settingsUrl.searchParams.set("billing", "upgraded");
  return NextResponse.redirect(settingsUrl.toString());
}
