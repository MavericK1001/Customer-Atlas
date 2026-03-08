import { NextRequest, NextResponse } from "next/server";
import {
  sanitizeInternalReturnPath,
} from "@/lib/account-auth-url";
import { requiredEnv } from "@/lib/env";
import { normalizeShopDomain } from "@/lib/shop";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const shop = normalizeShopDomain(request.nextUrl.searchParams.get("shop"));
  const host = (request.nextUrl.searchParams.get("host") ?? "").trim();
  const returnTo = sanitizeInternalReturnPath(
    request.nextUrl.searchParams.get("returnTo") ?? "/dashboard",
  );

  const appBaseUrl = requiredEnv("SHOPIFY_APP_URL");
  const redirectUrl = new URL(returnTo, appBaseUrl);

  if (shop) {
    redirectUrl.searchParams.set("shop", shop);
  }
  if (host) {
    redirectUrl.searchParams.set("host", host);
  }

  return NextResponse.redirect(redirectUrl);
}