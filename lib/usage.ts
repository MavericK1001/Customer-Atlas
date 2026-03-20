import { getSupabaseAdmin } from "@/lib/supabase";

export interface PlanInfo {
  planId: string;
  planName: string;
  analysesPerMonth: number; // -1 = unlimited
  priceCents: number;
}

export interface UsageInfo {
  plan: PlanInfo;
  usedThisMonth: number;
  remaining: number; // -1 = unlimited
  limitReached: boolean;
}

/**
 * Get a user's current plan. Falls back to "free" if no row exists.
 */
export async function getUserPlan(userId: string): Promise<PlanInfo> {
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from("user_plans")
    .select("plan_id, plans(id, name, analyses_per_month, price_cents)")
    .eq("user_id", userId)
    .single();

  if (data?.plans) {
    const plan = data.plans as unknown as {
      id: string;
      name: string;
      analyses_per_month: number;
      price_cents: number;
    };
    return {
      planId: plan.id,
      planName: plan.name,
      analysesPerMonth: plan.analyses_per_month,
      priceCents: plan.price_cents,
    };
  }

  // Fallback: no plan row yet — treat as free
  return {
    planId: "free",
    planName: "Free",
    analysesPerMonth: 3,
    priceCents: 0,
  };
}

/**
 * Count how many analyses a user has run in the current calendar month.
 */
export async function getMonthlyUsageCount(userId: string): Promise<number> {
  const supabase = getSupabaseAdmin();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count, error } = await supabase
    .from("usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", "analysis")
    .gte("created_at", startOfMonth);

  if (error) {
    // If table doesn't exist yet, return 0 gracefully
    return 0;
  }

  return count ?? 0;
}

/**
 * Full usage info for a user: plan + monthly usage + remaining + limit status.
 */
export async function getUserUsage(userId: string): Promise<UsageInfo> {
  const [plan, usedThisMonth] = await Promise.all([
    getUserPlan(userId),
    getMonthlyUsageCount(userId),
  ]);

  const isUnlimited = plan.analysesPerMonth === -1;

  return {
    plan,
    usedThisMonth,
    remaining: isUnlimited ? -1 : Math.max(0, plan.analysesPerMonth - usedThisMonth),
    limitReached: !isUnlimited && usedThisMonth >= plan.analysesPerMonth,
  };
}

/**
 * Log a usage event (called after a successful analysis).
 */
export async function logUsage(
  userId: string,
  action: string = "analysis",
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const supabase = getSupabaseAdmin();

  await supabase.from("usage_logs").insert({
    user_id: userId,
    action,
    metadata,
  });
}

/**
 * Check if a user can run an analysis. Throws if limit is reached.
 */
export async function assertCanAnalyze(userId: string): Promise<UsageInfo> {
  const usage = await getUserUsage(userId);

  if (usage.limitReached) {
    const err = new Error(
      `Monthly limit reached (${usage.plan.analysesPerMonth} analyses on the ${usage.plan.planName} plan). Upgrade for more.`,
    );
    (err as any).status = 429;
    throw err;
  }

  return usage;
}
