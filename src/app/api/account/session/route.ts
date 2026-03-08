import { NextRequest, NextResponse } from "next/server";
import { readAccountSessionToken } from "@/lib/account-session";
import { ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = readAccountSessionToken(
    request.cookies.get(ACCOUNT_SESSION_COOKIE_NAME)?.value,
  );

  if (!session) {
    return NextResponse.json({ ok: false, account: null, stores: [] }, { status: 200 });
  }

  const user = await prisma.merchantUser.findUnique({
    where: { id: session.merchantUserId },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    return NextResponse.json({ ok: false, account: null, stores: [] }, { status: 200 });
  }

  const stores = await prisma.appInstall.findMany({
    where: { merchantUserId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      shopDomain: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    ok: true,
    account: user,
    stores,
  });
}
