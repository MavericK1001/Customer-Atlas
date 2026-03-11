import { prisma } from "@/lib/prisma";

const VALID_PAYOUT_TRANSITIONS: Record<string, string[]> = {
  calculated: ["pending-transfer", "canceled"],
  "pending-transfer": ["paid", "canceled"],
  paid: [],
  canceled: [],
};

export async function updateAffiliatePayoutStatus(input: {
  payoutId: number;
  nextStatus: "calculated" | "pending-transfer" | "paid" | "canceled";
  notes?: string;
}): Promise<
  | { ok: true }
  | { ok: false; status: number; error: string }
> {
  const payout = await prisma.affiliatePayout.findUnique({
    where: { id: input.payoutId },
    select: {
      id: true,
      status: true,
    },
  });

  if (!payout) {
    return { ok: false, status: 404, error: "Payout not found." };
  }

  if (payout.status === input.nextStatus) {
    return { ok: true };
  }

  const allowed = VALID_PAYOUT_TRANSITIONS[payout.status] ?? [];
  if (!allowed.includes(input.nextStatus)) {
    return {
      ok: false,
      status: 409,
      error: `Cannot move payout from ${payout.status} to ${input.nextStatus}.`,
    };
  }

  await prisma.affiliatePayout.update({
    where: { id: payout.id },
    data: {
      status: input.nextStatus,
      notes: input.notes?.trim() || null,
      paidAt: input.nextStatus === "paid" ? new Date() : null,
    },
  });

  return { ok: true };
}

export async function generateAffiliatePayouts(input: {
  periodStart: Date;
  periodEnd: Date;
  minAmountUsd?: number;
  dryRun?: boolean;
}): Promise<{
  createdCount: number;
  skippedCount: number;
  created: Array<{ affiliateId: number; amount: number }>;
  skipped: Array<{ affiliateId: number; reason: string }>;
}> {
  const minAmountUsd = input.minAmountUsd ?? 10;
  const dryRun = input.dryRun ?? false;

  const grouped = await prisma.affiliateReferral.groupBy({
    by: ["affiliateId"],
    where: {
      attributedAt: {
        gte: input.periodStart,
        lte: input.periodEnd,
      },
      commissionAmount: {
        gt: 0,
      },
      affiliate: {
        status: "active",
      },
    },
    _sum: {
      commissionAmount: true,
    },
  });

  const created: Array<{ affiliateId: number; amount: number }> = [];
  const skipped: Array<{ affiliateId: number; reason: string }> = [];

  for (const row of grouped) {
    const amount = Number(row._sum.commissionAmount ?? 0);

    if (!Number.isFinite(amount) || amount < minAmountUsd) {
      skipped.push({
        affiliateId: row.affiliateId,
        reason: `below-minimum-${minAmountUsd.toFixed(2)}`,
      });
      continue;
    }

    const existing = await prisma.affiliatePayout.findFirst({
      where: {
        affiliateId: row.affiliateId,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      skipped.push({
        affiliateId: row.affiliateId,
        reason: "period-already-generated",
      });
      continue;
    }

    if (!dryRun) {
      await prisma.affiliatePayout.create({
        data: {
          affiliateId: row.affiliateId,
          amount,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          status: "calculated",
          notes: "Auto-generated from affiliate referral commissions.",
        },
      });
    }

    created.push({
      affiliateId: row.affiliateId,
      amount,
    });
  }

  return {
    createdCount: created.length,
    skippedCount: skipped.length,
    created,
    skipped,
  };
}
