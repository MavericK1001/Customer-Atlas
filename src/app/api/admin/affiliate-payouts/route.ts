import { NextRequest, NextResponse } from "next/server";
import { getAccountUserFromRequest } from "@/lib/account-user";
import { prisma } from "@/lib/prisma";

const PAYOUT_STATUSES = new Set([
  "calculated",
  "pending-transfer",
  "paid",
  "canceled",
]);

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
  if (!PAYOUT_STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid status filter." }, { status: 400 });
  }

  const includeAffiliates = request.nextUrl.searchParams.get("includeAffiliates") === "1";

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

  const responseBody: {
    ok: true;
    payouts: Array<Record<string, unknown>>;
    affiliates?: Array<{ id: number; email: string; name: string | null }>;
  } = {
    ok: true,
    payouts: payouts.map((payout) => ({
      ...payout,
      amount: Number(payout.amount),
    })),
  };

  if (includeAffiliates) {
    const affiliates = await prisma.affiliateProfile.findMany({
      where: { status: "active" },
      orderBy: { id: "asc" },
      take: 500,
      select: {
        id: true,
        merchantUser: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    responseBody.affiliates = affiliates.map((affiliate) => ({
      id: affiliate.id,
      email: affiliate.merchantUser.email,
      name: affiliate.merchantUser.name,
    }));
  }

  return NextResponse.json(responseBody);
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

  const periodStart = new Date(body.periodStart);
  const periodEnd = new Date(body.periodEnd);

  if (Number.isNaN(periodStart.getTime()) || Number.isNaN(periodEnd.getTime())) {
    return NextResponse.json(
      { error: "periodStart and periodEnd must be valid ISO date values." },
      { status: 400 },
    );
  }

  if (periodEnd < periodStart) {
    return NextResponse.json(
      { error: "periodEnd must be on or after periodStart." },
      { status: 400 },
    );
  }

  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { id: body.affiliateId },
    select: { id: true, status: true },
  });

  if (!affiliate || affiliate.status !== "active") {
    return NextResponse.json(
      { error: "Affiliate must be active before creating payouts." },
      { status: 404 },
    );
  }

  const payout = await prisma.affiliatePayout.create({
    data: {
      affiliateId: body.affiliateId,
      amount: body.amount,
      periodStart,
      periodEnd,
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
