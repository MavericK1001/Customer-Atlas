import { NextRequest, NextResponse } from "next/server";
import { buildShopifyInstallUrl } from "@/lib/shopify";
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

  if (!shop) {
    return NextResponse.json({ error: "Valid shop parameter is required." }, { status: 400 });
  }

  const state = createShopifyOAuthStateToken(shop);
  const redirect = buildShopifyInstallUrl(shop, state);

  const response = NextResponse.redirect(redirect);
  response.cookies.set("shopify_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
