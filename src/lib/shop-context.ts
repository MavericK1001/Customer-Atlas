import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
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
  if (fromQuery) {
    return { ok: true, shopDomain: fromQuery };
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
