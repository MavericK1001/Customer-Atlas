import { NextResponse } from "next/server";
import { ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/auth-constants";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCOUNT_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
