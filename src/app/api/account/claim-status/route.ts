import { NextRequest, NextResponse } from "next/server";
import { readAccountSessionToken } from "@/lib/account-session";
import { ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { prisma } from "@/lib/prisma";
import { resolveShopDomain } from "@/lib/shop-context";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const accountSession = readAccountSessionToken(
    request.cookies.get(ACCOUNT_SESSION_COOKIE_NAME)?.value,
  );

  const resolved = await resolveShopDomain(request);
  if (!resolved.ok) {
    return NextResponse.json({
      ok: false,
      accountLoggedIn: !!accountSession,
      error: resolved.error,
    });
  }

  const install = await prisma.appInstall.findUnique({
    where: { shopDomain: resolved.shopDomain },
    select: {
      shopDomain: true,
      merchantUserId: true,
    },
  });

  if (!install) {
    return NextResponse.json({
      ok: false,
      accountLoggedIn: !!accountSession,
      error: "Store install not found.",
    });
  }

  const ownership = !install.merchantUserId
    ? "unclaimed"
    : install.merchantUserId === accountSession?.merchantUserId
      ? "owned-by-current-account"
      : "owned-by-other-account";

  return NextResponse.json({
    ok: true,
    shopDomain: install.shopDomain,
    accountLoggedIn: !!accountSession,
    ownership,
  });
}
