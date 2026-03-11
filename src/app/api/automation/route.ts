import { NextRequest, NextResponse } from "next/server";
import { evaluateAutomationForShop } from "@/lib/services/automation";
import { canUseFeature, getShopPlan } from "@/lib/plan";
import { resolveShopDomain } from "@/lib/shop-context";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { shopDomain } = resolved;
  const plan = await getShopPlan(shopDomain);

  if (
    !canUseFeature({
      feature: "automation_rules",
      planTier: plan.planTier,
      billingStatus: plan.billingStatus,
    })
  ) {
    return NextResponse.json(
      { error: "Upgrade to Pro to access automation rules." },
      { status: 402 },
    );
  }

  const suggestions = await evaluateAutomationForShop(shopDomain);

  return NextResponse.json({
    ok: true,
    shopDomain,
    suggestions,
  });
}
