import { prisma } from "@/lib/prisma";

export type PlanTier = "free" | "pro";

export function normalizePlanTier(input: string | null | undefined): PlanTier {
  return input === "pro" ? "pro" : "free";
}

export async function getShopPlan(shopDomain: string): Promise<{
  planTier: PlanTier;
  billingStatus: string;
}> {
  const install = await prisma.appInstall.findUnique({
    where: { shopDomain },
    select: {
      planTier: true,
      billingStatus: true,
    },
  });

  if (!install) {
    return {
      planTier: "free",
      billingStatus: "inactive",
    };
  }

  return {
    planTier: normalizePlanTier(install.planTier),
    billingStatus: install.billingStatus ?? "inactive",
  };
}

export function canUseFeature(input: {
  feature:
    | "custom_segment_crud"
    | "automation_rules"
    | "assistant"
    | "customer_timeline"
    | "affiliate_portal"
    | "affiliate_api_keys"
    | "affiliate_admin_review";
  planTier: PlanTier;
  billingStatus: string;
}): boolean {
  if (input.feature === "custom_segment_crud") {
    return (
      input.planTier === "pro" &&
      (input.billingStatus === "active" || input.billingStatus === "trialing")
    );
  }

  if (input.feature === "automation_rules" || input.feature === "assistant") {
    return (
      input.planTier === "pro" &&
      (input.billingStatus === "active" || input.billingStatus === "trialing")
    );
  }

  if (input.feature === "customer_timeline") {
    return true;
  }

  if (
    input.feature === "affiliate_portal" ||
    input.feature === "affiliate_api_keys"
  ) {
    return (
      input.planTier === "pro" &&
      (input.billingStatus === "active" || input.billingStatus === "trialing")
    );
  }

  if (input.feature === "affiliate_admin_review") {
    return true;
  }

  return false;
}
