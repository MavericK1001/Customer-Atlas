export type SegmentPreviewRules = {
  minTotalSpent?: number;
  minOrders?: number;
  inactiveDays?: number;
};

type CustomerWhereClause = {
  shopDomain: string;
  totalSpent?: { gte: number };
  totalOrders?: { gte: number };
  lastOrderDate?: { lt: Date };
};

export function parseSegmentRules(input: unknown): {
  ok: true;
  rules: SegmentPreviewRules;
} | {
  ok: false;
  error: string;
} {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "rules object is required." };
  }

  const raw = input as Record<string, unknown>;

  function toFiniteNumber(value: unknown): number | undefined {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return undefined;
    }

    return value;
  }

  const minTotalSpentRaw = toFiniteNumber(raw.minTotalSpent);
  const minOrdersRaw = toFiniteNumber(raw.minOrders);
  const inactiveDaysRaw = toFiniteNumber(raw.inactiveDays);

  const rules: SegmentPreviewRules = {
    ...(typeof minTotalSpentRaw === "number" ? { minTotalSpent: minTotalSpentRaw } : {}),
    ...(typeof minOrdersRaw === "number" ? { minOrders: Math.max(0, Math.floor(minOrdersRaw)) } : {}),
    ...(typeof inactiveDaysRaw === "number" ? { inactiveDays: Math.max(0, Math.floor(inactiveDaysRaw)) } : {}),
  };

  return { ok: true, rules };
}

export function buildCustomerWhereClause(input: {
  shopDomain: string;
  rules: SegmentPreviewRules;
}): CustomerWhereClause {
  const lastOrderBefore =
    typeof input.rules.inactiveDays === "number"
      ? new Date(Date.now() - input.rules.inactiveDays * 24 * 60 * 60 * 1000)
      : undefined;

  return {
    shopDomain: input.shopDomain,
    ...(typeof input.rules.minTotalSpent === "number"
      ? { totalSpent: { gte: input.rules.minTotalSpent } }
      : {}),
    ...(typeof input.rules.minOrders === "number"
      ? { totalOrders: { gte: input.rules.minOrders } }
      : {}),
    ...(lastOrderBefore ? { lastOrderDate: { lt: lastOrderBefore } } : {}),
  };
}
