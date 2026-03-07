import { NextRequest, NextResponse } from "next/server";
import { APP_SESSION_COOKIE_NAME } from "@/lib/auth-constants";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(APP_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.delete("shopify_oauth_state");

  const redirectTo = request.nextUrl.searchParams.get("redirectTo");
  if (redirectTo) {
    const redirectUrl = new URL(redirectTo, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
