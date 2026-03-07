import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveShopDomain } from "@/lib/shop-context";

type SegmentPreviewRules = {
  minTotalSpent?: number;
  minOrders?: number;
  inactiveDays?: number;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { shopDomain } = resolved;

  const body = (await request.json()) as {
    rules?: SegmentPreviewRules;
  };

  const rules = body.rules ?? {};

  const minTotalSpent =
    typeof rules.minTotalSpent === "number" && Number.isFinite(rules.minTotalSpent)
      ? rules.minTotalSpent
      : undefined;
  const minOrders =
    typeof rules.minOrders === "number" && Number.isFinite(rules.minOrders)
      ? Math.max(0, Math.floor(rules.minOrders))
      : undefined;
  const inactiveDays =
    typeof rules.inactiveDays === "number" && Number.isFinite(rules.inactiveDays)
      ? Math.max(0, Math.floor(rules.inactiveDays))
      : undefined;

  const lastOrderBefore =
    typeof inactiveDays === "number"
      ? new Date(Date.now() - inactiveDays * 24 * 60 * 60 * 1000)
      : undefined;

  const whereClause = {
    shopDomain,
    ...(typeof minTotalSpent === "number" ? { totalSpent: { gte: minTotalSpent } } : {}),
    ...(typeof minOrders === "number" ? { totalOrders: { gte: minOrders } } : {}),
    ...(lastOrderBefore ? { lastOrderDate: { lt: lastOrderBefore } } : {}),
  };

  const [count, sampleCustomers] = await Promise.all([
    prisma.customer.count({ where: whereClause }),
    prisma.customer.findMany({
      where: whereClause,
      orderBy: { totalSpent: "desc" },
      take: 5,
      select: {
        id: true,
        email: true,
        totalOrders: true,
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    matchCount: count,
    sampleCustomers,
    appliedRules: {
      minTotalSpent,
      minOrders,
      inactiveDays,
    },
  });
}
