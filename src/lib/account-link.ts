import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveShopDomain } from "@/lib/shop-context";

export type AccountLinkStatus =
  | "linked"
  | "already-linked"
  | "belongs-to-other"
  | "unavailable";

export async function linkCurrentStoreToMerchant(input: {
  request: NextRequest;
  merchantUserId: number;
}): Promise<{ status: AccountLinkStatus; shopDomain: string | null }> {
  const resolved = await resolveShopDomain(input.request);
  if (!resolved.ok) {
    return { status: "unavailable", shopDomain: null };
  }

  const install = await prisma.appInstall.findUnique({
    where: { shopDomain: resolved.shopDomain },
    select: {
      shopDomain: true,
      merchantUserId: true,
    },
  });

  if (!install) {
    return { status: "unavailable", shopDomain: null };
  }

  if (install.merchantUserId && install.merchantUserId !== input.merchantUserId) {
    return {
      status: "belongs-to-other",
      shopDomain: install.shopDomain,
    };
  }

  if (install.merchantUserId === input.merchantUserId) {
    return {
      status: "already-linked",
      shopDomain: install.shopDomain,
    };
  }

  await prisma.appInstall.update({
    where: { shopDomain: install.shopDomain },
    data: { merchantUserId: input.merchantUserId },
  });

  return {
    status: "linked",
    shopDomain: install.shopDomain,
  };
}
