import { NextRequest, NextResponse } from "next/server";
import { canUseFeature, getShopPlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/serializers/number";
import { resolveShopDomain } from "@/lib/shop-context";

function buildAssistantReply(input: {
  prompt: string;
  totalCustomers: number;
  avgLtv: number;
  topInsights: Array<{ message: string; potentialRevenue: number }>;
}): string {
  const insightSummary =
    input.topInsights.length > 0
      ? input.topInsights
          .map(
            (insight, index) =>
              `${index + 1}. ${insight.message} (est. $${insight.potentialRevenue.toFixed(2)})`,
          )
          .join(" ")
      : "No active insights are available yet.";

  return [
    `Prompt received: ${input.prompt}`,
    `Current store snapshot: ${input.totalCustomers} customers with average predicted LTV of $${input.avgLtv.toFixed(2)}.`,
    `Top recommended actions: ${insightSummary}`,
    "Suggested next step: prioritize one retention action and one upsell action this week, then measure conversion uplift.",
  ].join(" ");
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { shopDomain } = resolved;
  const plan = await getShopPlan(shopDomain);

  if (
    !canUseFeature({
      feature: "assistant",
      planTier: plan.planTier,
      billingStatus: plan.billingStatus,
    })
  ) {
    return NextResponse.json(
      { error: "Upgrade to Pro to use the assistant." },
      { status: 402 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    prompt?: string;
  };

  const prompt = (body.prompt ?? "").trim();
  if (prompt.length < 3) {
    return NextResponse.json(
      { error: "Prompt must be at least 3 characters." },
      { status: 400 },
    );
  }

  const [customers, insights] = await Promise.all([
    prisma.customer.findMany({
      where: { shopDomain },
      select: { predictedLtv: true },
    }),
    prisma.insight.findMany({
      where: { shopDomain, archivedAt: null },
      orderBy: { potentialRevenue: "desc" },
      take: 3,
      select: {
        message: true,
        potentialRevenue: true,
      },
    }),
  ]);

  const avgLtv =
    customers.length > 0
      ? customers.reduce((acc, customer) => acc + toNumber(customer.predictedLtv), 0) /
        customers.length
      : 0;

  const reply = buildAssistantReply({
    prompt,
    totalCustomers: customers.length,
    avgLtv,
    topInsights: insights.map((insight) => ({
      message: insight.message,
      potentialRevenue: toNumber(insight.potentialRevenue),
    })),
  });

  return NextResponse.json({
    ok: true,
    shopDomain,
    response: reply,
  });
}
