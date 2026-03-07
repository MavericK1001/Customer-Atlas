import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePlanTier } from "@/lib/plan";
import { createProSubscription } from "@/lib/shopify-billing";
import { resolveShopDomain } from "@/lib/shop-context";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const install = await prisma.appInstall.findUnique({
    where: { shopDomain: resolved.shopDomain },
    select: {
      shopDomain: true,
      planTier: true,
      billingStatus: true,
      trialEndsAt: true,
      shopifySubscriptionId: true,
    },
  });

  if (!install) {
    return NextResponse.json({ error: "Shop is not installed." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    billing: {
      shopDomain: install.shopDomain,
      planTier: normalizePlanTier(install.planTier),
      billingStatus: install.billingStatus,
      trialEndsAt: install.trialEndsAt,
      shopifySubscriptionId: install.shopifySubscriptionId,
    },
  });
}

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
      planTier: true,
      billingStatus: true,
    },
  });

  if (!install) {
    return NextResponse.json({ error: "Shop is not installed." }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    planTier?: "free" | "pro";
  };

  if (!body.planTier || (body.planTier !== "free" && body.planTier !== "pro")) {
    return NextResponse.json(
      { error: "planTier must be either 'free' or 'pro'." },
      { status: 400 },
    );
  }

  if (body.planTier === "pro") {
    const billingStart = await createProSubscription({
      shop: install.shopDomain,
      accessToken: install.accessToken,
    });

    await prisma.appInstall.update({
      where: { shopDomain: install.shopDomain },
      data: {
        billingStatus: "pending",
        shopifySubscriptionId: billingStart.subscriptionId,
      },
    });

    return NextResponse.json({
      ok: true,
      planTier: "free",
      billingStatus: "pending",
      confirmationUrl: billingStart.confirmationUrl,
    });
  }

  await prisma.appInstall.update({
    where: { shopDomain: install.shopDomain },
    data: {
      planTier: "free",
      billingStatus: "active",
      shopifySubscriptionId: null,
      trialEndsAt: null,
    },
  });

  return NextResponse.json({
    ok: true,
    planTier: "free",
    billingStatus: "active",
  });
}
