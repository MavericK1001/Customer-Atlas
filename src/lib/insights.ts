import { prisma } from "@/lib/prisma";

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toString" in value) {
    return Number((value as { toString(): string }).toString());
  }
  return 0;
}

export async function generateInsights(shopDomain: string): Promise<void> {
  const [churnSegment, orders, archivedInsights] = await Promise.all([
    prisma.segment.findUnique({
      where: {
        shopDomain_segmentName: {
          shopDomain,
          segmentName: "Churn Risk",
        },
      },
    }),
    prisma.order.findMany({
      where: { shopDomain },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.insight.findMany({
      where: { shopDomain, archivedAt: { not: null } },
      select: {
        insightType: true,
        message: true,
      },
    }),
  ]);

  const avgOrderValueResult = await prisma.order.aggregate({
    where: { shopDomain },
    _avg: { orderValue: true },
  });

  const avgOrderValue = toNumber(avgOrderValueResult._avg.orderValue ?? 0);
  const churnRiskCustomers = churnSegment?.customerCount ?? 0;

  const productCounts = new Map<string, number>();
  for (const order of orders) {
    const products = Array.isArray(order.products) ? order.products : [];
    for (const product of products) {
      if (typeof product === "string" && product.length > 0) {
        productCounts.set(product, (productCounts.get(product) ?? 0) + 1);
      }
    }
  }

  const topProducts = [...productCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([name]) => name);

  const insights = [
    {
      insightType: "retention",
      message: "Re-engage customers who haven't purchased in 90 days",
      potentialRevenue: Number((churnRiskCustomers * avgOrderValue * 0.2).toFixed(2)),
    },
    {
      insightType: "bundles",
      message:
        topProducts.length >= 2
          ? `Create a bundle for products frequently bought together: ${topProducts.join(" + ")}`
          : "Create bundle for products frequently bought together",
      potentialRevenue: Number((avgOrderValue * 0.15 * Math.max(orders.length, 1)).toFixed(2)),
    },
  ];

  const archivedSignatures = new Set(
    archivedInsights.map(
      (insight: { insightType: string; message: string }) =>
        `${insight.insightType}::${insight.message}`,
    ),
  );

  const activeInsights = insights.filter(
    (insight) => !archivedSignatures.has(`${insight.insightType}::${insight.message}`),
  );

  await prisma.insight.deleteMany({ where: { shopDomain, archivedAt: null } });

  if (activeInsights.length === 0) {
    return;
  }

  await prisma.insight.createMany({
    data: activeInsights.map((insight) => ({
      shopDomain,
      insightType: insight.insightType,
      message: insight.message,
      potentialRevenue: insight.potentialRevenue,
    })),
  });
}
