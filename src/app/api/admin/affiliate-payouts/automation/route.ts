import { NextRequest, NextResponse } from "next/server";
import { getAccountUserFromRequest } from "@/lib/account-user";
import { env } from "@/lib/env";
import { generateAffiliatePayouts } from "@/lib/services/affiliate-payouts";

function hasValidAutomationSecret(request: NextRequest): boolean {
  const configured = env.AFFILIATE_PAYOUT_AUTOMATION_SECRET;
  const provided = request.headers.get("x-affiliate-payout-secret");

  if (!configured || configured.length === 0) {
    return false;
  }

  return configured === provided;
}

async function hasAdminSession(request: NextRequest): Promise<boolean> {
  const user = await getAccountUserFromRequest(request);
  return Boolean(user && user.role === "admin");
}

function parseDateInput(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secretAuthorized = hasValidAutomationSecret(request);
  const sessionAuthorized = await hasAdminSession(request);

  if (!secretAuthorized && !sessionAuthorized) {
    return NextResponse.json(
      { error: "Unauthorized. Admin session or valid automation secret required." },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    periodStart?: string;
    periodEnd?: string;
    minAmountUsd?: number;
    dryRun?: boolean;
  };

  const periodStart = parseDateInput(body.periodStart ?? null);
  const periodEnd = parseDateInput(body.periodEnd ?? null);

  if (!periodStart || !periodEnd) {
    return NextResponse.json(
      { error: "periodStart and periodEnd are required as ISO dates." },
      { status: 400 },
    );
  }

  if (periodEnd < periodStart) {
    return NextResponse.json(
      { error: "periodEnd must be on or after periodStart." },
      { status: 400 },
    );
  }

  const minAmountUsd =
    typeof body.minAmountUsd === "number" && Number.isFinite(body.minAmountUsd)
      ? body.minAmountUsd
      : 10;

  if (minAmountUsd < 0) {
    return NextResponse.json(
      { error: "minAmountUsd must be non-negative." },
      { status: 400 },
    );
  }

  const result = await generateAffiliatePayouts({
    periodStart,
    periodEnd,
    minAmountUsd,
    dryRun: body.dryRun === true,
  });

  return NextResponse.json({
    ok: true,
    ...result,
    periodStart,
    periodEnd,
    minAmountUsd,
    dryRun: body.dryRun === true,
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return POST(request);
}
