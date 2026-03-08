import { NextRequest, NextResponse } from "next/server";
import { linkCurrentStoreToMerchant } from "@/lib/account-link";
import {
  createAccountSessionToken,
  getAccountSessionCookieOptions,
} from "@/lib/account-session";
import { ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

function normalizeEmail(email: string | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  const email = normalizeEmail(body.email);
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const user = await prisma.merchantUser.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const link = await linkCurrentStoreToMerchant({
    request,
    merchantUserId: user.id,
  });

  const response = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    link,
  });

  response.cookies.set(
    ACCOUNT_SESSION_COOKIE_NAME,
    createAccountSessionToken({
      merchantUserId: user.id,
      email: user.email,
    }),
    getAccountSessionCookieOptions(),
  );

  return response;
}
