import { NextRequest, NextResponse } from "next/server";
import { enqueueMetricsRecompute } from "@/lib/queue";
import { prisma } from "@/lib/prisma";
import { verifyShopifyWebhookHmac } from "@/lib/shopify";

type ShopifyOrderPayload = {
  id: number;
  total_price: string;
  created_at: string;
  customer?: {
    id: number;
    email?: string | null;
  } | null;
  line_items?: Array<{ title?: string }>;
};

type ShopifyCustomerPayload = {
  id: number;
  email?: string | null;
};

type ShopifyAppSubscriptionPayload = {
  id?: string;
  admin_graphql_api_id?: string;
  status?: string;
};

type ShopifyCustomerDataRequestPayload = {
  customer?: {
    id?: number;
  };
};

type ShopifyCustomerRedactPayload = {
  customer?: {
    id?: number;
  };
};

function normalizeBillingStatus(status: string | undefined): string {
  if (!status) {
    return "inactive";
  }

  return status.toLowerCase();
}

function isProBillingStatus(status: string): boolean {
  return status === "active" || status === "trialing";
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const topic = request.headers.get("x-shopify-topic");
  const shopDomain = request.headers.get("x-shopify-shop-domain");
  const hmac = request.headers.get("x-shopify-hmac-sha256");

  if (!topic || !shopDomain || !hmac) {
    return NextResponse.json({ error: "Missing webhook headers." }, { status: 400 });
  }

  const payload = await request.text();

  if (!verifyShopifyWebhookHmac(payload, hmac)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const install = await prisma.appInstall.findUnique({
    where: { shopDomain },
    select: { id: true },
  });

  if (!install) {
    // Acknowledge unknown shops to prevent retry storms while keeping data isolated.
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    if (topic === "customers/create" || topic === "customers/update") {
      const customer = JSON.parse(payload) as ShopifyCustomerPayload;

      const stored = await prisma.customer.upsert({
        where: {
          shopDomain_shopifyCustomerId: {
            shopDomain,
            shopifyCustomerId: String(customer.id),
          },
        },
        update: {
          email: customer.email,
        },
        create: {
          shopDomain,
          shopifyCustomerId: String(customer.id),
          email: customer.email,
          totalSpent: 0,
          averageOrderValue: 0,
          predictedLtv: 0,
        },
      });

      await enqueueMetricsRecompute({
        shopDomain,
        customerId: stored.id,
      });
    }

    if (topic === "orders/create" || topic === "orders/updated") {
      const order = JSON.parse(payload) as ShopifyOrderPayload;
      const shopifyCustomerId = order.customer?.id ? String(order.customer.id) : null;

      let customerId: number | null = null;
      const productTitles = (order.line_items ?? [])
        .map((line) => line.title)
        .filter((title): title is string => typeof title === "string");

      if (shopifyCustomerId) {
        const customer = await prisma.customer.upsert({
          where: {
            shopDomain_shopifyCustomerId: {
              shopDomain,
              shopifyCustomerId,
            },
          },
          update: {
            email: order.customer?.email,
          },
          create: {
            shopDomain,
            shopifyCustomerId,
            email: order.customer?.email,
            totalSpent: 0,
            averageOrderValue: 0,
            predictedLtv: 0,
          },
        });

        customerId = customer.id;
      }

      await prisma.order.upsert({
        where: {
          shopDomain_shopifyOrderId: {
            shopDomain,
            shopifyOrderId: String(order.id),
          },
        },
        update: {
          customerId,
          orderValue: Number(order.total_price ?? 0),
          products: productTitles,
          createdAt: new Date(order.created_at),
        },
        create: {
          shopDomain,
          shopifyOrderId: String(order.id),
          customerId,
          orderValue: Number(order.total_price ?? 0),
          products: productTitles,
          createdAt: new Date(order.created_at),
        },
      });

      if (customerId) {
        await enqueueMetricsRecompute({
          shopDomain,
          customerId,
        });
      } else {
        await enqueueMetricsRecompute({ shopDomain });
      }
    }

    if (topic === "app_subscriptions/update") {
      const subscription = JSON.parse(payload) as ShopifyAppSubscriptionPayload;
      const subscriptionId =
        subscription.admin_graphql_api_id ?? subscription.id ?? null;
      const billingStatus = normalizeBillingStatus(subscription.status);

      const install = await prisma.appInstall.findUnique({
        where: { shopDomain },
        select: {
          shopDomain: true,
          shopifySubscriptionId: true,
        },
      });

      if (!install) {
        return NextResponse.json({ ok: true });
      }

      await prisma.appInstall.update({
        where: { shopDomain },
        data: {
          billingStatus,
          planTier: isProBillingStatus(billingStatus) ? "pro" : "free",
          shopifySubscriptionId: isProBillingStatus(billingStatus)
            ? subscriptionId ?? install.shopifySubscriptionId
            : null,
        },
      });
    }

    if (topic === "customers/data_request") {
      // App has no separate export pipeline yet; acknowledge request for review compliance.
      const requestPayload = JSON.parse(payload) as ShopifyCustomerDataRequestPayload;
      const requestedCustomerId = requestPayload.customer?.id;

      if (requestedCustomerId) {
        await prisma.customer.findUnique({
          where: {
            shopDomain_shopifyCustomerId: {
              shopDomain,
              shopifyCustomerId: String(requestedCustomerId),
            },
          },
          select: { id: true },
        });
      }
    }

    if (topic === "customers/redact") {
      const redactPayload = JSON.parse(payload) as ShopifyCustomerRedactPayload;
      const redactCustomerId = redactPayload.customer?.id;

      if (redactCustomerId) {
        const customer = await prisma.customer.findUnique({
          where: {
            shopDomain_shopifyCustomerId: {
              shopDomain,
              shopifyCustomerId: String(redactCustomerId),
            },
          },
          select: { id: true },
        });

        if (customer) {
          await prisma.order.deleteMany({
            where: {
              shopDomain,
              customerId: customer.id,
            },
          });

          await prisma.customer.delete({
            where: { id: customer.id },
          });
        }
      }
    }

    if (topic === "shop/redact") {
      await prisma.segmentMembership.deleteMany({
        where: {
          customer: { shopDomain },
        },
      });

      await prisma.order.deleteMany({ where: { shopDomain } });
      await prisma.segment.deleteMany({ where: { shopDomain } });
      await prisma.insight.deleteMany({ where: { shopDomain } });
      await prisma.customer.deleteMany({ where: { shopDomain } });
      await prisma.appInstall.deleteMany({ where: { shopDomain } });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
