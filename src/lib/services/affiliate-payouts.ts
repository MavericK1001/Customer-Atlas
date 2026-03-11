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
