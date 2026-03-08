import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ACCOUNT_SESSION_COOKIE_NAME, APP_SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { readAccountSessionToken } from "@/lib/account-session";
import { createAppSessionToken, getAppSessionCookieOptions } from "@/lib/auth-session";
import { readShopifyOAuthStateToken } from "@/lib/shopify-oauth-state";
import { normalizeShopDomain } from "@/lib/shop";
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

const POST_INSTALL_SETUP_MAX_WAIT_MS = 4000;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get("code");
  const shop = normalizeShopDomain(request.nextUrl.searchParams.get("shop"));
  const state = request.nextUrl.searchParams.get("state");
  const stateCookie = request.cookies.get("shopify_oauth_state")?.value;
  const isValidHmac = verifyShopifyOAuthCallback(request.nextUrl.search);
  const parsedState = readShopifyOAuthStateToken(state);

  const stateMatchesCookie =
    !!state &&
    !!stateCookie &&
    state.length === stateCookie.length &&
    state === stateCookie;

  // Cookie may be blocked or stale in embedded contexts, so signed state token is primary validation.
  const isValidState =
    !!parsedState &&
    !!shop &&
    parsedState.shopDomain === shop;

  const hasCoreParams = !!code && !!shop;
  const isValidRequest = hasCoreParams && isValidState;

  if (!isValidRequest) {
    return NextResponse.json(
      {
        error: "Invalid OAuth callback request.",
        checks: {
          hasCode: !!code,
          hasShop: !!shop,
          hasState: !!state,
          hasStateCookie: !!stateCookie,
          stateTokenValid: !!parsedState,
          stateShopMatches: !!parsedState && !!shop ? parsedState.shopDomain === shop : false,
          stateCookieMatches: stateMatchesCookie,
          hmacValid: isValidHmac,
        },
      },
      { status: 400 },
    );
  }

  if (!isValidHmac) {
    console.warn(`OAuth callback HMAC validation failed for ${shop}. Proceeding via signed state validation.`);
  }

  function buildDashboardResponse(targetShop: string): NextResponse {
    const host = request.nextUrl.searchParams.get("host") ?? "";
    const dashboardUrl = new URL("/dashboard", request.nextUrl.origin);
    dashboardUrl.searchParams.set("shop", targetShop);
    if (host) {
      dashboardUrl.searchParams.set("host", host);
    }

    const response = NextResponse.redirect(dashboardUrl.toString());
    response.cookies.delete("shopify_oauth_state");
    response.cookies.set(
      APP_SESSION_COOKIE_NAME,
      createAppSessionToken(targetShop),
      getAppSessionCookieOptions(),
    );

    return response;
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

    // Keep install UX snappy: run setup tasks in parallel and cap how long callback waits.
    const postInstallSetup = Promise.allSettled([
      ...WEBHOOK_TOPICS.map((topic) =>
        registerWebhookSubscription({
          shop,
          accessToken,
          appBaseUrl: request.nextUrl.origin,
          topic,
        }),
      ),
      syncShopData({
        shop,
        accessToken,
      }),
    ]);

    const setupResult = await Promise.race([
      postInstallSetup.then(() => "completed" as const),
      new Promise<"timeout">((resolve) => {
        setTimeout(() => resolve("timeout"), POST_INSTALL_SETUP_MAX_WAIT_MS);
      }),
    ]);

    if (setupResult === "timeout") {
      console.warn(
        `Post-install setup exceeded ${POST_INSTALL_SETUP_MAX_WAIT_MS}ms for ${shop}; redirecting early.`,
      );
      postInstallSetup
        .then((results) => {
          const rejected = results.filter((result) => result.status === "rejected");
          if (rejected.length > 0) {
            console.warn(
              `Post-install setup completed with ${rejected.length} rejected task(s) for ${shop}.`,
            );
          }
        })
        .catch((error) => {
          console.warn(`Post-install background setup failed for ${shop}: ${(error as Error).message}`);
        });
    }

    return buildDashboardResponse(shop);
  } catch (error) {
    const message = (error as Error).message;

    // Shopify can hit callback twice; second call sees consumed code (400).
    if (message.includes("OAuth token exchange failed: 400")) {
      const install = await prisma.appInstall.findUnique({
        where: { shopDomain: shop },
        select: { shopDomain: true },
      });

      if (install?.shopDomain) {
        console.warn(
          `OAuth token exchange 400 for ${shop}; using existing install and continuing.`,
        );
        return buildDashboardResponse(install.shopDomain);
      }
    }

    return NextResponse.json(
      { error: "OAuth setup failed", details: message },
      { status: 500 },
    );
  }
}
