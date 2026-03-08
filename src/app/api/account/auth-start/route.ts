import { NextRequest, NextResponse } from "next/server";
import {
  accountAuthStateCookieOptions,
  createAccountAuthStateToken,
} from "@/lib/account-auth-state";
import {
  buildExternalAccountProviderUrl,
  isExternalAccountAuthEnabled,
  sanitizeInternalReturnPath,
} from "@/lib/account-auth-url";
import { ACCOUNT_AUTH_STATE_COOKIE_NAME } from "@/lib/auth-constants";
import { requiredEnv } from "@/lib/env";
import { normalizeShopDomain } from "@/lib/shop";

function normalizeIntent(value: string | null): "login" | "signup" {
  return value === "signup" ? "signup" : "login";
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const intent = normalizeIntent(request.nextUrl.searchParams.get("intent"));
  const shop = normalizeShopDomain(request.nextUrl.searchParams.get("shop"));
  const host = (request.nextUrl.searchParams.get("host") ?? "").trim();
  const returnTo = sanitizeInternalReturnPath(
    request.nextUrl.searchParams.get("returnTo") ?? "/dashboard",
  );

  if (!isExternalAccountAuthEnabled()) {
    const fallbackUrl = new URL(
      intent === "login" ? "/account/login" : "/account/signup",
      requiredEnv("SHOPIFY_APP_URL"),
    );
    if (shop) {
      fallbackUrl.searchParams.set("shop", shop);
    }
    if (host) {
      fallbackUrl.searchParams.set("host", host);
    }
    fallbackUrl.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(fallbackUrl);
  }

  const state = createAccountAuthStateToken({
    intent,
    shop,
    host,
    returnTo,
  });

  const callbackUrl = new URL("/api/account/auth-return", requiredEnv("SHOPIFY_APP_URL"));
  const authUrl = buildExternalAccountProviderUrl({
    intent,
    shop,
    host,
    returnTo,
    callbackUrl: callbackUrl.toString(),
    state,
  });

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(
    ACCOUNT_AUTH_STATE_COOKIE_NAME,
    state,
    accountAuthStateCookieOptions(),
  );

  return response;
}