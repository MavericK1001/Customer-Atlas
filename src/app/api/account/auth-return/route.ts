import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { readAccountAuthStateToken } from "@/lib/account-auth-state";
import {
  sanitizeInternalReturnPath,
} from "@/lib/account-auth-url";
import { ACCOUNT_AUTH_STATE_COOKIE_NAME } from "@/lib/auth-constants";
import { requiredEnv } from "@/lib/env";
import { normalizeShopDomain } from "@/lib/shop";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const stateQuery = request.nextUrl.searchParams.get("state") ?? "";
  const stateCookie = request.cookies.get(ACCOUNT_AUTH_STATE_COOKIE_NAME)?.value ?? "";

  if (!stateQuery || !stateCookie) {
    return NextResponse.json({ error: "Invalid auth return state." }, { status: 400 });
  }

  const provided = Buffer.from(stateQuery);
  const expected = Buffer.from(stateCookie);
  if (provided.length !== expected.length) {
    return NextResponse.json({ error: "Invalid auth return state." }, { status: 400 });
  }

  if (!crypto.timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: "Invalid auth return state." }, { status: 400 });
  }

  const parsed = readAccountAuthStateToken(stateQuery);
  if (!parsed) {
    return NextResponse.json({ error: "Expired or invalid auth state." }, { status: 400 });
  }

  const shop = normalizeShopDomain(parsed.shop);
  const host = parsed.host;
  const returnTo = sanitizeInternalReturnPath(parsed.returnTo);

  const appBaseUrl = requiredEnv("SHOPIFY_APP_URL");
  const redirectUrl = new URL(returnTo, appBaseUrl);

  if (shop) {
    redirectUrl.searchParams.set("shop", shop);
  }
  if (host) {
    redirectUrl.searchParams.set("host", host);
  }

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(ACCOUNT_AUTH_STATE_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}