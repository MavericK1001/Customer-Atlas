import { NextRequest, NextResponse } from "next/server";
import { canUseFeature, getShopPlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import { resolveShopDomain } from "@/lib/shop-context";

type TimelineEvent = {
  id: string;
  type: "order" | "segment-membership";
  happenedAt: Date;
  title: string;
  details: string;
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { shopDomain } = resolved;
  const plan = await getShopPlan(shopDomain);

  if (
    !canUseFeature({
      feature: "customer_timeline",
      planTier: plan.planTier,
      billingStatus: plan.billingStatus,
    })
  ) {
    return NextResponse.json(
      { error: "Timeline is not available for this plan." },
      { status: 402 },
    );
  }

  const { id } = await context.params;
  const customerId = Number.parseInt(id, 10);

  if (!Number.isFinite(customerId)) {
    return NextResponse.json({ error: "Invalid customer id." }, { status: 400 });
  }

  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      shopDomain,
    },
    select: {
      id: true,
      email: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          orderValue: true,
          createdAt: true,
          shopifyOrderId: true,
        },
      },
      segmentMemberships: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          createdAt: true,
          segment: {
            select: {
              segmentName: true,
            },
          },
        },
      },
    },
  });

  if (!customer) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }

  const events: TimelineEvent[] = [
    ...customer.orders.map((order) => ({
      id: `order-${order.id}`,
      type: "order" as const,
      happenedAt: order.createdAt,
      title: "Order placed",
      details: `Order #${order.shopifyOrderId} worth $${order.orderValue.toString()}`,
    })),
    ...customer.segmentMemberships.map((membership) => ({
      id: `segment-${membership.id}`,
      type: "segment-membership" as const,
      happenedAt: membership.createdAt,
      title: "Entered segment",
      details: membership.segment.segmentName,
    })),
  ].sort((a, b) => b.happenedAt.getTime() - a.happenedAt.getTime());

  return NextResponse.json({
    ok: true,
    customer: {
      id: customer.id,
      email: customer.email,
    },
    timeline: events,
  });
}
