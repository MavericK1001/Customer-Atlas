import { NextRequest, NextResponse } from "next/server";
import { getAccountUserFromRequest } from "@/lib/account-user";
import { prisma } from "@/lib/prisma";

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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return auth.response;
  }

  const status = request.nextUrl.searchParams.get("status") ?? "pending-transfer";

  const payouts = await prisma.affiliatePayout.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      amount: true,
      status: true,
      notes: true,
      periodStart: true,
      periodEnd: true,
      paidAt: true,
      createdAt: true,
      affiliate: {
        select: {
          id: true,
          merchantUser: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    payouts: payouts.map((payout) => ({
      ...payout,
      amount: Number(payout.amount),
    })),
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return auth.response;
  }

  const body = (await request.json().catch(() => ({}))) as {
    affiliateId?: number;
    amount?: number;
    periodStart?: string;
    periodEnd?: string;
    notes?: string;
  };

  if (
    !body.affiliateId ||
    typeof body.amount !== "number" ||
    body.amount <= 0 ||
    !body.periodStart ||
    !body.periodEnd
  ) {
    return NextResponse.json(
      { error: "affiliateId, amount, periodStart and periodEnd are required." },
      { status: 400 },
    );
  }

  const payout = await prisma.affiliatePayout.create({
    data: {
      affiliateId: body.affiliateId,
      amount: body.amount,
      periodStart: new Date(body.periodStart),
      periodEnd: new Date(body.periodEnd),
      status: "calculated",
      notes: body.notes?.trim() || null,
    },
    select: {
      id: true,
      amount: true,
      status: true,
    },
  });

  return NextResponse.json({
    ok: true,
    payout: {
      ...payout,
      amount: Number(payout.amount),
    },
  });
}
