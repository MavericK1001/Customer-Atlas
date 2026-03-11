import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/serializers/number";

type AutomationSuggestion = {
  id: string;
  ruleName: string;
  summary: string;
  action: string;
  estimatedImpact: number;
};

export async function evaluateAutomationForShop(
  shopDomain: string,
): Promise<AutomationSuggestion[]> {
  const [segments, insights] = await Promise.all([
    prisma.segment.findMany({
      where: { shopDomain },
      select: {
        segmentName: true,
        customerCount: true,
      },
    }),
    prisma.insight.findMany({
      where: { shopDomain, archivedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        insightType: true,
        message: true,
        potentialRevenue: true,
      },
    }),
  ]);

  const suggestions: AutomationSuggestion[] = [];

  const churnRisk = segments.find((segment) => segment.segmentName === "Churn Risk");
  if (churnRisk && churnRisk.customerCount > 0) {
    suggestions.push({
      id: "rule-churn-winback",
      ruleName: "Churn Winback",
      summary: `Trigger a winback flow when a customer enters Churn Risk (${churnRisk.customerCount} currently).`,
      action: "Send a retention email with discount code after 90 days inactivity.",
      estimatedImpact: Number((churnRisk.customerCount * 12.5).toFixed(2)),
    });
  }

  const oneTime = segments.find(
    (segment) => segment.segmentName === "One-Time Buyers",
  );
  if (oneTime && oneTime.customerCount > 0) {
    suggestions.push({
      id: "rule-second-order",
      ruleName: "Second Order Nudge",
      summary: `Follow up with one-time buyers (${oneTime.customerCount} currently).`,
      action: "Send replenishment reminder 14 days after first purchase.",
      estimatedImpact: Number((oneTime.customerCount * 7.5).toFixed(2)),
    });
  }

  for (const insight of insights) {
    suggestions.push({
      id: `insight-${insight.id}`,
      ruleName: `Insight: ${insight.insightType}`,
      summary: insight.message,
      action: "Create an automated campaign tied to this insight condition.",
      estimatedImpact: toNumber(insight.potentialRevenue),
    });
  }

  return suggestions
    .sort((a, b) => b.estimatedImpact - a.estimatedImpact)
    .slice(0, 10);
}
