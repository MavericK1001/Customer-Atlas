import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncShopData } from "@/lib/sync";
import { resolveShopDomain } from "@/lib/shop-context";

type SyncHealthRecord = {
  lastSyncAt: Date | null;
  lastSyncStatus: string | null;
  lastSyncError: string | null;
  updatedAt: Date;
};

type FreshnessBucket = "fresh" | "aging" | "stale" | "unknown";

function getFreshnessBucket(lastSyncAt: Date | null): FreshnessBucket {
  if (!lastSyncAt) {
    return "unknown";
  }

  const ageMinutes = (Date.now() - lastSyncAt.getTime()) / (1000 * 60);

  if (ageMinutes <= 60) {
    return "fresh";
  }

  if (ageMinutes <= 24 * 60) {
    return "aging";
  }

  return "stale";
}

function getHealthRecommendation(input: {
  freshness: FreshnessBucket;
  lastSyncStatus: string | null;
  lastSyncError: string | null;
}): { headline: string; action: string } {
  if (input.lastSyncStatus === "failed") {
    return {
      headline: "Last sync failed",
      action: input.lastSyncError
        ? "Check the error details below, then run Sync now again."
        : "Run Sync now again and confirm Shopify scopes are still valid.",
    };
  }

  if (input.freshness === "stale") {
    return {
      headline: "Data is stale",
      action: "Run Sync now to refresh customer and order metrics.",
    };
  }

  if (input.freshness === "aging") {
    return {
      headline: "Data is getting old",
      action: "Schedule a sync soon to keep recommendations accurate.",
    };
  }

  if (input.freshness === "unknown") {
    return {
      headline: "Sync has not run yet",
      action: "Run your first sync to populate analytics and segments.",
    };
  }

  return {
    headline: "Sync health looks good",
    action: "No action needed right now.",
  };
}

function formatSyncHealth(install: {
  lastSyncAt: Date | null;
  lastSyncStatus: string | null;
  lastSyncError: string | null;
  updatedAt: Date;
}) {
  const freshness = getFreshnessBucket(install.lastSyncAt);
  const recommendation = getHealthRecommendation({
    freshness,
    lastSyncStatus: install.lastSyncStatus,
    lastSyncError: install.lastSyncError,
  });

  return {
    lastSyncAt: install.lastSyncAt,
    lastSyncStatus: install.lastSyncStatus,
    lastSyncError: install.lastSyncError,
    updatedAt: install.updatedAt,
    freshness,
    consecutiveFailures: install.lastSyncStatus === "failed" ? 1 : 0,
    recommendation,
  };
}

async function getSyncHealthRecord(shop: string): Promise<SyncHealthRecord | null> {
  return prisma.appInstall.findUnique({
    where: { shopDomain: shop },
    select: {
      lastSyncAt: true,
      lastSyncStatus: true,
      lastSyncError: true,
      updatedAt: true,
    },
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const shop = resolved.shopDomain;

  const install = await prisma.appInstall.findUnique({
    where: { shopDomain: shop },
    select: {
      shopDomain: true,
    },
  });

  if (!install) {
    return NextResponse.json({ error: "Shop is not installed." }, { status: 404 });
  }

  const syncHealthRecord = await getSyncHealthRecord(shop);

  if (!syncHealthRecord) {
    return NextResponse.json({ error: "Sync health is unavailable." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    shopDomain: install.shopDomain,
    syncHealth: formatSyncHealth(syncHealthRecord),
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const shop = resolved.shopDomain;
  const startedAt = Date.now();

  const install = await prisma.appInstall.findUnique({
    where: { shopDomain: shop },
  });

  if (!install) {
    return NextResponse.json({ error: "Shop is not installed." }, { status: 404 });
  }

  await prisma.appInstall.update({
    where: { shopDomain: shop },
    data: {
      lastSyncStatus: "running",
      lastSyncError: null,
    },
  });

  try {
    console.info(`[sync:route] started shop=${shop}`);
    const result = await syncShopData({
      shop,
      accessToken: install.accessToken,
    });

    await prisma.appInstall.update({
      where: { shopDomain: shop },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
        lastSyncError: null,
      },
    });

    const syncHealthRecord = await getSyncHealthRecord(shop);

    if (!syncHealthRecord) {
      return NextResponse.json({ error: "Sync health is unavailable." }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "Sync completed.",
      result,
      syncHealth: formatSyncHealth(syncHealthRecord),
    });
  } catch (error) {
    console.warn(
      `[sync:route] failed shop=${shop} durationMs=${Date.now() - startedAt} error=${(error as Error).message}`,
    );
    await prisma.appInstall.update({
      where: { shopDomain: shop },
      data: {
        lastSyncStatus: "failed",
        lastSyncError: (error as Error).message,
      },
    });

    return NextResponse.json(
      {
        error: "Sync failed",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  } finally {
    console.info(`[sync:route] finished shop=${shop} durationMs=${Date.now() - startedAt}`);
  }
}
