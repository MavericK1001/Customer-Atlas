import { NextRequest, NextResponse } from "next/server";
import { readAccountSessionToken } from "@/lib/account-session";
import { ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { prisma } from "@/lib/prisma";
import { resolveShopDomain } from "@/lib/shop-context";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const accountSession = readAccountSessionToken(
    request.cookies.get(ACCOUNT_SESSION_COOKIE_NAME)?.value,
  );

  if (!accountSession) {
    return NextResponse.json(
      { error: "Sign in to claim this store." },
      { status: 401 },
    );
  }

  const resolved = await resolveShopDomain(request);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const install = await prisma.appInstall.findUnique({
    where: { shopDomain: resolved.shopDomain },
    select: {
      shopDomain: true,
      merchantUserId: true,
    },
  });

  if (!install) {
    return NextResponse.json({ error: "Store install not found." }, { status: 404 });
  }

  if (
    install.merchantUserId &&
    install.merchantUserId !== accountSession.merchantUserId
  ) {
    return NextResponse.json(
      { error: "This store is already claimed by another account." },
      { status: 403 },
    );
  }

  if (install.merchantUserId === accountSession.merchantUserId) {
    return NextResponse.json({ ok: true, status: "already-claimed" });
  }

  const claimResult = await prisma.appInstall.updateMany({
    where: {
      shopDomain: install.shopDomain,
      merchantUserId: null,
    },
    data: {
      merchantUserId: accountSession.merchantUserId,
    },
  });

  if (claimResult.count === 0) {
    const latest = await prisma.appInstall.findUnique({
      where: { shopDomain: install.shopDomain },
      select: { merchantUserId: true },
    });

    if (latest?.merchantUserId === accountSession.merchantUserId) {
      return NextResponse.json({ ok: true, status: "already-claimed" });
    }

    return NextResponse.json(
      { error: "This store was claimed by another account just now." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true, status: "claimed" });
}
