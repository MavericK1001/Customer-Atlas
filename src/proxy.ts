import { NextRequest, NextResponse } from "next/server";
import { APP_SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { readShopFromShopifySessionToken } from "@/lib/shopify-session-token";

const PROTECTED_PAGE_PREFIXES = [
  "/dashboard",
  "/customers",
  "/segments",
  "/insights",
  "/settings",
];

const PUBLIC_API_PREFIXES = [
  "/api/auth/shopify",
  "/api/auth/callback",
  "/api/auth/logout",
  "/api/account/signup",
  "/api/account/login",
  "/api/account/logout",
  "/api/account/session",
  "/api/account/auth-start",
  "/api/account/auth-return",
  "/api/account/claim-status",
  "/api/health",
  "/api/billing/confirm",
  "/api/billing/reconcile",
  "/api/webhooks/shopify",
];

function isProtectedPage(pathname: string): boolean {
  return PROTECTED_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (!isProtectedPage(pathname) && !isApiPath(pathname)) {
    return NextResponse.next();
  }

  if (isApiPath(pathname) && isPublicApiPath(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(APP_SESSION_COOKIE_NAME)?.value;
  const sessionTokenShop = readShopFromShopifySessionToken(
    request.headers.get("authorization"),
  );

  if (sessionCookie || sessionTokenShop) {
    return NextResponse.next();
  }

  if (isApiPath(pathname)) {
    return NextResponse.json(
      { error: "Unauthorized. Install or re-authenticate the app." },
      { status: 401 },
    );
  }

  const installUrl = new URL("/install", request.url);
  return NextResponse.redirect(installUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo|docs).*)"],
};
