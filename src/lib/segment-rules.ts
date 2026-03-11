import type { Prisma } from "@prisma/client";
import { z } from "zod";

export type SegmentPreviewRules = {
  minTotalSpent?: number;
  maxTotalSpent?: number;
  minOrders?: number;
  maxOrders?: number;
  inactiveDays?: number;
  hasEmail?: boolean;
};

const SegmentRulesSchema = z
  .object({
    minTotalSpent: z.number().finite().min(0).optional(),
    maxTotalSpent: z.number().finite().min(0).optional(),
    minOrders: z.number().finite().min(0).optional(),
    maxOrders: z.number().finite().min(0).optional(),
    inactiveDays: z.number().finite().min(0).optional(),
    hasEmail: z.boolean().optional(),
  })
  .superRefine((rules, ctx) => {
    if (
      typeof rules.minTotalSpent === "number" &&
      typeof rules.maxTotalSpent === "number" &&
      rules.minTotalSpent > rules.maxTotalSpent
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "minTotalSpent cannot be greater than maxTotalSpent.",
      });
    }

    if (
      typeof rules.minOrders === "number" &&
      typeof rules.maxOrders === "number" &&
      rules.minOrders > rules.maxOrders
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "minOrders cannot be greater than maxOrders.",
      });
    }
  });

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

  const parsed = SegmentRulesSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      ok: false,
      error: firstIssue?.message ?? "Invalid segment rules.",
    };
  }

  const raw = parsed.data;

  const rules: SegmentPreviewRules = {
    ...(typeof raw.minTotalSpent === "number"
      ? { minTotalSpent: raw.minTotalSpent }
      : {}),
    ...(typeof raw.maxTotalSpent === "number"
      ? { maxTotalSpent: raw.maxTotalSpent }
      : {}),
    ...(typeof raw.minOrders === "number"
      ? { minOrders: Math.floor(raw.minOrders) }
      : {}),
    ...(typeof raw.maxOrders === "number"
      ? { maxOrders: Math.floor(raw.maxOrders) }
      : {}),
    ...(typeof raw.inactiveDays === "number"
      ? { inactiveDays: Math.floor(raw.inactiveDays) }
      : {}),
    ...(typeof raw.hasEmail === "boolean" ? { hasEmail: raw.hasEmail } : {}),
  };

  return { ok: true, rules };
}

export function buildCustomerWhereClause(input: {
  shopDomain: string;
  rules: SegmentPreviewRules;
}): Prisma.CustomerWhereInput {
  const lastOrderBefore =
    typeof input.rules.inactiveDays === "number"
      ? new Date(Date.now() - input.rules.inactiveDays * 24 * 60 * 60 * 1000)
      : undefined;

  const totalSpentFilter =
    typeof input.rules.minTotalSpent === "number" ||
    typeof input.rules.maxTotalSpent === "number"
      ? {
          ...(typeof input.rules.minTotalSpent === "number"
            ? { gte: input.rules.minTotalSpent }
            : {}),
          ...(typeof input.rules.maxTotalSpent === "number"
            ? { lte: input.rules.maxTotalSpent }
            : {}),
        }
      : undefined;

  const totalOrdersFilter =
    typeof input.rules.minOrders === "number" ||
    typeof input.rules.maxOrders === "number"
      ? {
          ...(typeof input.rules.minOrders === "number"
            ? { gte: input.rules.minOrders }
            : {}),
          ...(typeof input.rules.maxOrders === "number"
            ? { lte: input.rules.maxOrders }
            : {}),
        }
      : undefined;

  return {
    shopDomain: input.shopDomain,
    ...(totalSpentFilter ? { totalSpent: totalSpentFilter } : {}),
    ...(totalOrdersFilter ? { totalOrders: totalOrdersFilter } : {}),
    ...(lastOrderBefore ? { lastOrderDate: { lt: lastOrderBefore } } : {}),
    ...(input.rules.hasEmail === true
      ? {
          AND: [{ email: { not: null } }, { email: { not: "" } }],
        }
      : {}),
    ...(input.rules.hasEmail === false
      ? {
          OR: [{ email: null }, { email: "" }],
        }
      : {}),
  };
}
