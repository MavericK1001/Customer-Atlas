import { prisma } from "@/lib/prisma";
import { getActiveSubscriptions } from "@/lib/shopify-billing";

function normalizeBillingStatus(status: string | undefined): string {
  if (!status) {
    return "inactive";
  }

  return status.toLowerCase();
}

function isProBillingStatus(status: string): boolean {
  return status === "active" || status === "trialing";
}

type InstallRecord = {
  shopDomain: string;
  accessToken: string;
};

export async function reconcileInstallBilling(install: InstallRecord): Promise<{
  shopDomain: string;
  planTier: "free" | "pro";
  billingStatus: string;
}> {
  const subscriptions = await getActiveSubscriptions({
    shop: install.shopDomain,
    accessToken: install.accessToken,
  });

  if (subscriptions.length === 0) {
    const billingStatus = "inactive";
    await prisma.appInstall.update({
      where: { shopDomain: install.shopDomain },
      data: {
        planTier: "free",
        billingStatus,
        shopifySubscriptionId: null,
      },
    });

    return {
      shopDomain: install.shopDomain,
      planTier: "free",
      billingStatus,
    };
  }

  const active = subscriptions[0];
  const billingStatus = normalizeBillingStatus(active.status);
  const planTier = isProBillingStatus(billingStatus) ? "pro" : "free";

  await prisma.appInstall.update({
    where: { shopDomain: install.shopDomain },
    data: {
      planTier,
      billingStatus,
      shopifySubscriptionId: planTier === "pro" ? active.id : null,
    },
  });

  return {
    shopDomain: install.shopDomain,
    planTier,
    billingStatus,
  };
}
