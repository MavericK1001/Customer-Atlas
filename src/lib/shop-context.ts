import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ACCOUNT_SESSION_COOKIE_NAME, APP_SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { readAccountSessionToken } from "@/lib/account-session";
import { readAppSessionToken } from "@/lib/auth-session";
import { normalizeShopDomain } from "@/lib/shop";
import { readShopFromShopifySessionToken } from "@/lib/shopify-session-token";

type ResolvedShop = {
  ok: true;
  shopDomain: string;
};

type UnresolvedShop = {
  ok: false;
  status: number;
  error: string;
};

export type ResolveShopDomainResult = ResolvedShop | UnresolvedShop;

function hasAccountAccess(input: {
  installMerchantUserId: number | null;
  accountMerchantUserId: number | null;
}): boolean {
  if (!input.accountMerchantUserId) {
    return true;
  }

  if (!input.installMerchantUserId) {
    return true;
  }

  return input.installMerchantUserId === input.accountMerchantUserId;
}

export async function resolveShopDomain(request: NextRequest): Promise<ResolveShopDomainResult> {
  const fromQuery = normalizeShopDomain(request.nextUrl.searchParams.get("shop"));
  const tokenShop = readShopFromShopifySessionToken(request.headers.get("authorization"));
  const accountSession = readAccountSessionToken(
    request.cookies.get(ACCOUNT_SESSION_COOKIE_NAME)?.value,
  );

  if (tokenShop) {
    if (fromQuery && fromQuery !== tokenShop) {
      return {
        ok: false,
        status: 403,
        error: "Store mismatch. Re-authenticate for the requested shop.",
      };
    }

    const installed = await prisma.appInstall.findUnique({
      where: { shopDomain: tokenShop },
      select: { shopDomain: true, merchantUserId: true },
    });

    if (installed?.shopDomain) {
      if (
        !hasAccountAccess({
          installMerchantUserId: installed.merchantUserId,
          accountMerchantUserId: accountSession?.merchantUserId ?? null,
        })
      ) {
        return {
          ok: false,
          status: 403,
          error: "This store is linked to a different account.",
        };
      }

      return { ok: true, shopDomain: installed.shopDomain };
    }

    return {
      ok: false,
      status: 401,
      error: "Token store is not installed. Reinstall or re-authenticate.",
    };
  }

  const session = readAppSessionToken(request.cookies.get(APP_SESSION_COOKIE_NAME)?.value);
  if (session) {
    if (fromQuery && fromQuery !== session.shopDomain) {
      return {
        ok: false,
        status: 403,
        error: "Store mismatch. Re-authenticate for the requested shop.",
      };
    }

    const installed = await prisma.appInstall.findUnique({
      where: { shopDomain: session.shopDomain },
      select: { shopDomain: true, merchantUserId: true },
    });

    if (installed?.shopDomain) {
      if (
        !hasAccountAccess({
          installMerchantUserId: installed.merchantUserId,
          accountMerchantUserId: accountSession?.merchantUserId ?? null,
        })
      ) {
        return {
          ok: false,
          status: 403,
          error: "This store is linked to a different account.",
        };
      }

      return { ok: true, shopDomain: installed.shopDomain };
    }

    return {
      ok: false,
      status: 401,
      error: "Session store is no longer installed. Reinstall or re-authenticate.",
    };
  }

  if (fromQuery) {
    const installed = await prisma.appInstall.findUnique({
      where: { shopDomain: fromQuery },
      select: { shopDomain: true, merchantUserId: true },
    });

    if (installed?.shopDomain) {
      if (
        !hasAccountAccess({
          installMerchantUserId: installed.merchantUserId,
          accountMerchantUserId: accountSession?.merchantUserId ?? null,
        })
      ) {
        return {
          ok: false,
          status: 403,
          error: "This store is linked to a different account.",
        };
      }

      return { ok: true, shopDomain: installed.shopDomain };
    }

    return {
      ok: false,
      status: 404,
      error: "Shop is not installed. Install the app from Shopify first.",
    };
  }

  const installs = await prisma.appInstall.findMany({
    select: { shopDomain: true, merchantUserId: true },
    orderBy: { createdAt: "desc" },
    take: 2,
  });

  const accessibleInstalls = installs.filter((install) =>
    hasAccountAccess({
      installMerchantUserId: install.merchantUserId,
      accountMerchantUserId: accountSession?.merchantUserId ?? null,
    }),
  );

  if (accessibleInstalls.length === 0 && installs.length > 0 && accountSession) {
    return {
      ok: false,
      status: 403,
      error: "No accessible stores found for this account.",
    };
  }

  if (accessibleInstalls.length === 0) {
    return {
      ok: false,
      status: 404,
      error: "No installed shops found. Install the app from Shopify first.",
    };
  }

  if (accessibleInstalls.length > 1) {
    return {
      ok: false,
      status: 400,
      error: "Multiple shops are installed. Provide ?shop=your-shop.myshopify.com.",
    };
  }

  return {
    ok: true,
    shopDomain: accessibleInstalls[0].shopDomain,
  };
}
