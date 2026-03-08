import { NextRequest, NextResponse } from "next/server";
import { requiredEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { ACCOUNT_SESSION_COOKIE_NAME, APP_SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { readAccountSessionToken } from "@/lib/account-session";
import { createAppSessionToken, getAppSessionCookieOptions } from "@/lib/auth-session";
import { exchangeShopifyCodeForToken, registerWebhookSubscription, verifyShopifyOAuthCallback } from "@/lib/shopify";
import { syncShopData } from "@/lib/sync";

const WEBHOOK_TOPICS = [
  "orders/create",
  "orders/updated",
  "customers/create",
  "customers/update",
  "app_subscriptions/update",
  "customers/data_request",
  "customers/redact",
  "shop/redact",
] as const;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get("code");
  const shop = request.nextUrl.searchParams.get("shop");
  const state = request.nextUrl.searchParams.get("state");
  const stateCookie = request.cookies.get("shopify_oauth_state")?.value;
  const isValidHmac = verifyShopifyOAuthCallback(request.nextUrl.searchParams);

  if (!code || !shop || !state || state !== stateCookie || !isValidHmac) {
    return NextResponse.json({ error: "Invalid OAuth callback request." }, { status: 400 });
  }

  try {
    const accessToken = await exchangeShopifyCodeForToken({
      code,
      shop,
    });

    const accountSession = readAccountSessionToken(
      request.cookies.get(ACCOUNT_SESSION_COOKIE_NAME)?.value,
    );

    const existingInstall = await prisma.appInstall.findUnique({
      where: { shopDomain: shop },
      select: {
        shopDomain: true,
        merchantUserId: true,
      },
    });

    if (existingInstall) {
      const shouldLinkToCurrentAccount =
        !!accountSession &&
        (!existingInstall.merchantUserId ||
          existingInstall.merchantUserId === accountSession.merchantUserId);

      await prisma.appInstall.update({
        where: { shopDomain: shop },
        data: {
          accessToken,
          ...(shouldLinkToCurrentAccount
            ? { merchantUserId: accountSession.merchantUserId }
            : {}),
        },
      });
    } else {
      await prisma.appInstall.create({
        data: {
          shopDomain: shop,
          accessToken,
          merchantUserId: accountSession?.merchantUserId ?? null,
        },
      });
    }

    for (const topic of WEBHOOK_TOPICS) {
      await registerWebhookSubscription({
        shop,
        accessToken,
        topic,
      });
    }

    try {
      await syncShopData({
        shop,
        accessToken,
      });
    } catch (error) {
      console.warn(`Initial data sync failed for ${shop}: ${(error as Error).message}`);
    }

    const host = request.nextUrl.searchParams.get("host") ?? "";
    const dashboardUrl = new URL("/dashboard", requiredEnv("SHOPIFY_APP_URL"));
    dashboardUrl.searchParams.set("shop", shop);
    if (host) {
      dashboardUrl.searchParams.set("host", host);
    }

    const response = NextResponse.redirect(dashboardUrl.toString());
    response.cookies.delete("shopify_oauth_state");
    response.cookies.set(
      APP_SESSION_COOKIE_NAME,
      createAppSessionToken(shop),
      getAppSessionCookieOptions(),
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "OAuth setup failed", details: (error as Error).message },
      { status: 500 },
    );
  }
}
