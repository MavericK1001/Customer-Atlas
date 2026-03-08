import { NextRequest, NextResponse } from "next/server";
import { linkCurrentStoreToMerchant } from "@/lib/account-link";
import {
  createAccountSessionToken,
  getAccountSessionCookieOptions,
} from "@/lib/account-session";
import { ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

function normalizeEmail(email: string | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    name?: string;
  };

  const email = normalizeEmail(body.email);
  const password = body.password ?? "";
  const name = body.name?.trim();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters long." },
      { status: 400 },
    );
  }

  const existing = await prisma.merchantUser.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.merchantUser.create({
    data: {
      email,
      passwordHash,
      name: name && name.length > 0 ? name : null,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  const link = await linkCurrentStoreToMerchant({
    request,
    merchantUserId: user.id,
  });

  const response = NextResponse.json({
    ok: true,
    user,
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
