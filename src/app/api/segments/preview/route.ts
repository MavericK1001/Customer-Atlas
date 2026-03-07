import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveShopDomain } from "@/lib/shop-context";
import { buildCustomerWhereClause, parseSegmentRules } from "@/lib/segment-rules";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { shopDomain } = resolved;

  const body = (await request.json()) as {
    rules?: unknown;
  };

  const parsed = parseSegmentRules(body.rules);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const whereClause = buildCustomerWhereClause({
    shopDomain,
    rules: parsed.rules,
  });

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
    appliedRules: parsed.rules,
  });
}
