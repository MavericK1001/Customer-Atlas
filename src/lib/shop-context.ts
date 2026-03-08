import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { APP_SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { readAppSessionToken } from "@/lib/auth-session";
import { normalizeShopDomain } from "@/lib/shop";

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

export async function resolveShopDomain(request: NextRequest): Promise<ResolveShopDomainResult> {
  const fromQuery = normalizeShopDomain(request.nextUrl.searchParams.get("shop"));

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
      select: { shopDomain: true },
    });

    if (installed?.shopDomain) {
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
      select: { shopDomain: true },
    });

    if (installed?.shopDomain) {
      return { ok: true, shopDomain: installed.shopDomain };
    }

    return {
      ok: false,
      status: 404,
      error: "Shop is not installed. Install the app from Shopify first.",
    };
  }

  const installs = await prisma.appInstall.findMany({
    select: { shopDomain: true },
    orderBy: { createdAt: "desc" },
    take: 2,
  });

  if (installs.length === 0) {
    return {
      ok: false,
      status: 404,
      error: "No installed shops found. Install the app from Shopify first.",
    };
  }

  if (installs.length > 1) {
    return {
      ok: false,
      status: 400,
      error: "Multiple shops are installed. Provide ?shop=your-shop.myshopify.com.",
    };
  }

  return {
    ok: true,
    shopDomain: installs[0].shopDomain,
  };
}
