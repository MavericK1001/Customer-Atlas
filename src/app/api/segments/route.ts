import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canUseFeature, getShopPlan } from "@/lib/plan";
import { resolveShopDomain } from "@/lib/shop-context";
import { buildCustomerWhereClause, parseSegmentRules } from "@/lib/segment-rules";

const SYSTEM_SEGMENT_NAMES = new Set([
  "VIP Customers",
  "Churn Risk",
  "One-Time Buyers",
]);

export async function GET(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { shopDomain } = resolved;

  const segments = await prisma.segment.findMany({
    where: { shopDomain },
    orderBy: { segmentName: "asc" },
  });

  return NextResponse.json({
    segments: segments.map(
      (segment: {
        id: number;
        segmentName: string;
        rules: unknown;
        customerCount: number;
      }) => ({
      id: segment.id,
      segmentName: segment.segmentName,
      rules: segment.rules,
      customerCount: segment.customerCount,
      }),
    ),
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { shopDomain } = resolved;

  const shopPlan = await getShopPlan(shopDomain);
  if (
    !canUseFeature({
      feature: "custom_segment_crud",
      planTier: shopPlan.planTier,
      billingStatus: shopPlan.billingStatus,
    })
  ) {
    return NextResponse.json(
      { error: "Upgrade to Pro to create custom segments." },
      { status: 402 },
    );
  }

  const body = (await request.json()) as {
    segmentName?: string;
    rules?: unknown;
  };

  const segmentName = body.segmentName?.trim();
  if (!segmentName || segmentName.length < 2 || segmentName.length > 80) {
    return NextResponse.json(
      { error: "segmentName must be between 2 and 80 characters." },
      { status: 400 },
    );
  }

  if (SYSTEM_SEGMENT_NAMES.has(segmentName)) {
    return NextResponse.json(
      { error: "This segment name is reserved for a system-generated segment." },
      { status: 400 },
    );
  }

  const parsed = parseSegmentRules(body.rules);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const whereClause = buildCustomerWhereClause({
    shopDomain,
    rules: parsed.rules,
  });
  const matchCount = await prisma.customer.count({ where: whereClause });

  try {
    const segment = await prisma.segment.create({
      data: {
        shopDomain,
        segmentName,
        rules: parsed.rules,
        customerCount: matchCount,
      },
    });

    return NextResponse.json({
      ok: true,
      segment: {
        id: segment.id,
        segmentName: segment.segmentName,
        rules: segment.rules,
        customerCount: segment.customerCount,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Segment with this name already exists for this shop." },
      { status: 409 },
    );
  }
}
