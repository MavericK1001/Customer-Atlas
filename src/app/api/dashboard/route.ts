import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveShopDomain } from "@/lib/shop-context";

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toString" in value) {
    return Number((value as { toString(): string }).toString());
  }
  return 0;
}

type PriorityCard = {
  id: number;
  title: string;
  reason: string;
  confidence: number;
  potentialRevenue: number;
  priorityScore: number;
  ctaLabel: string;
  ctaPath: string;
};

function getInsightUrgencyMultiplier(insightType: string): number {
  if (insightType === "retention") {
    return 1.35;
  }

  if (insightType === "bundles") {
    return 1.1;
  }

  return 1;
}

function buildPriorityCard(input: {
  insight: {
    id: number;
    insightType: string;
    message: string;
    potentialRevenue: unknown;
  };
}): PriorityCard {
  const potentialRevenue = toNumber(input.insight.potentialRevenue);
  const urgencyMultiplier = getInsightUrgencyMultiplier(input.insight.insightType);
  const priorityScore = Number((potentialRevenue * urgencyMultiplier).toFixed(2));

  if (input.insight.insightType === "retention") {
    return {
      id: input.insight.id,
      title: "Launch a churn win-back campaign",
      reason: input.insight.message,
      confidence: 78,
      potentialRevenue,
      priorityScore,
      ctaLabel: "Review at-risk customers",
      ctaPath: "/customers",
    };
  }

  if (input.insight.insightType === "bundles") {
    return {
      id: input.insight.id,
      title: "Create a high-affinity product bundle",
      reason: input.insight.message,
      confidence: 71,
      potentialRevenue,
      priorityScore,
      ctaLabel: "View insight details",
      ctaPath: "/insights",
    };
  }

  return {
    id: input.insight.id,
    title: "Review growth opportunity",
    reason: input.insight.message,
    confidence: 65,
    potentialRevenue,
    priorityScore,
    ctaLabel: "Open insights",
    ctaPath: "/insights",
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { shopDomain } = resolved;

  const [customers, orders, insights] = await Promise.all([
    prisma.customer.findMany({ where: { shopDomain } }),
    prisma.order.findMany({ where: { shopDomain } }),
    prisma.insight.findMany({
      where: { shopDomain, archivedAt: null },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalCustomers = customers.length;
  const repeatCustomers = customers.filter((c: { totalOrders: number }) => c.totalOrders > 1).length;
  const repeatPurchaseRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

  const avgOrderValue =
    orders.length > 0
      ? orders.reduce((acc: number, order: { orderValue: unknown }) => acc + toNumber(order.orderValue), 0) /
        orders.length
      : 0;

  const predictedLtv =
    customers.length > 0
      ? customers.reduce(
          (acc: number, customer: { predictedLtv: unknown }) => acc + toNumber(customer.predictedLtv),
          0,
        ) / customers.length
      : 0;

  const todayPriorities = insights
    .map((insight) => buildPriorityCard({ insight }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 3);

  return NextResponse.json({
    customerOverview: {
      totalCustomers,
      repeatPurchaseRate: Number(repeatPurchaseRate.toFixed(2)),
      averageOrderValue: Number(avgOrderValue.toFixed(2)),
      predictedLtv: Number(predictedLtv.toFixed(2)),
    },
    todayPriorities,
    revenueInsights: insights.map((insight: { id: number; insightType: string; message: string; potentialRevenue: unknown; createdAt: Date }) => ({
      id: insight.id,
      type: insight.insightType,
      message: insight.message,
      potentialRevenue: toNumber(insight.potentialRevenue),
      createdAt: insight.createdAt,
    })),
  });
}
