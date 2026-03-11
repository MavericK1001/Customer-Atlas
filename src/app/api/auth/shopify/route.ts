import { NextRequest, NextResponse } from "next/server";
import { requiredEnv } from "@/lib/env";
import { buildShopifyInstallUrlForBase } from "@/lib/shopify";
import { createShopifyOAuthStateToken } from "@/lib/shopify-oauth-state";

function normalizeShopDomain(input: string | null): string | null {
  if (!input) {
    return null;
  }

  let candidate = input.trim();

  if (candidate.length === 0) {
    return null;
  }

  // Accept either a raw shop domain or a pasted full URL from Shopify admin.
  if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
    try {
      candidate = new URL(candidate).hostname;
    } catch {
      return null;
    }
  }

  candidate = candidate.replace(/^www\./, "").replace(/\/+$/, "").toLowerCase();

  return candidate.endsWith(".myshopify.com") ? candidate : null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const shop = normalizeShopDomain(request.nextUrl.searchParams.get("shop"));
  const referralCode = (request.nextUrl.searchParams.get("ref") ?? "").trim();

  if (!shop) {
    return NextResponse.json({ error: "Valid shop parameter is required." }, { status: 400 });
  }

  const state = createShopifyOAuthStateToken(shop);
  const redirect = buildShopifyInstallUrlForBase(
    shop,
    state,
    requiredEnv("SHOPIFY_APP_URL"),
  );

  const response = NextResponse.redirect(redirect);
  response.cookies.set("shopify_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  if (/^[a-zA-Z0-9_-]{4,64}$/.test(referralCode)) {
    response.cookies.set("affiliate_ref_code", referralCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  return response;
}
