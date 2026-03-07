import { NextRequest, NextResponse } from "next/server";
import { APP_SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { readAppSessionToken } from "@/lib/auth-session";
import { reconcileInstallBilling } from "@/lib/billing-reconcile";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { normalizeShopDomain } from "@/lib/shop";

function hasValidCronSecret(request: NextRequest): boolean {
  const configured = env.BILLING_RECONCILE_SECRET;
  const provided = request.headers.get("x-billing-reconcile-secret");

  if (!configured || configured.length === 0) {
    return false;
  }

  return provided === configured;
}

async function reconcileSingleShop(shopDomain: string): Promise<NextResponse> {
  const install = await prisma.appInstall.findUnique({
    where: { shopDomain },
    select: {
      shopDomain: true,
      accessToken: true,
    },
  });

  if (!install) {
    return NextResponse.json({ error: "Shop is not installed." }, { status: 404 });
  }

  const result = await reconcileInstallBilling(install);

  return NextResponse.json({
    ok: true,
    reconciledCount: 1,
    results: [result],
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const isCronCall = hasValidCronSecret(request);

  if (isCronCall) {
    const shop = normalizeShopDomain(request.nextUrl.searchParams.get("shop"));

    if (shop) {
      return reconcileSingleShop(shop);
    }

    const installs = await prisma.appInstall.findMany({
      select: {
        shopDomain: true,
        accessToken: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const settled = await Promise.allSettled(
      installs.map((install) => reconcileInstallBilling(install)),
    );

    const results = settled
      .filter(
        (entry): entry is PromiseFulfilledResult<Awaited<ReturnType<typeof reconcileInstallBilling>>> =>
          entry.status === "fulfilled",
      )
      .map((entry) => entry.value);

    const failures = settled
      .map((entry, index) => ({ entry, install: installs[index] }))
      .filter(
        (item): item is {
          entry: PromiseRejectedResult;
          install: (typeof installs)[number];
        } => item.entry.status === "rejected",
      )
      .map((item) => ({
        shopDomain: item.install.shopDomain,
        error:
          item.entry.reason instanceof Error
            ? item.entry.reason.message
            : "Unknown reconcile failure",
      }));

    return NextResponse.json({
      ok: true,
      reconciledCount: results.length,
      failedCount: failures.length,
      results,
      failures,
    });
  }

  const session = readAppSessionToken(request.cookies.get(APP_SESSION_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized. Provide session cookie or valid reconcile secret." },
      { status: 401 },
    );
  }

  return reconcileSingleShop(session.shopDomain);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return POST(request);
}
