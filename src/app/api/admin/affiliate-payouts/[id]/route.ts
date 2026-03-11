import { NextRequest, NextResponse } from "next/server";
import { getAccountUserFromRequest } from "@/lib/account-user";
import { updateAffiliatePayoutStatus } from "@/lib/services/affiliate-payouts";

async function requireAdmin(request: NextRequest): Promise<
  | { ok: true }
  | { ok: false; response: NextResponse }
> {
  const user = await getAccountUserFromRequest(request);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }

  if (user.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }

  return { ok: true };
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const payoutId = Number.parseInt(id, 10);
  if (!Number.isFinite(payoutId)) {
    return NextResponse.json({ error: "Invalid payout id." }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    status?: "calculated" | "pending-transfer" | "paid" | "canceled";
    notes?: string;
  };

  if (!body.status) {
    return NextResponse.json({ error: "status is required." }, { status: 400 });
  }

  const result = await updateAffiliatePayoutStatus({
    payoutId,
    nextStatus: body.status,
    notes: body.notes,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true });
}
