import type { Prisma } from "@prisma/client";
import { enqueueMetricsRecompute } from "@/lib/queue";
import { prisma } from "@/lib/prisma";

type ShopifyCustomer = {
  id: number;
  email?: string | null;
};

type ShopifyOrder = {
  id: number;
  total_price: string;
  created_at: string;
  customer?: {
    id: number;
    email?: string | null;
  } | null;
  line_items?: Array<{ title?: string }>;
};

export type SyncShopDataResult = {
  customersFetched: number;
  customersUpserted: number;
  customerSyncSkipped: boolean;
  ordersFetched: number;
  ordersUpserted: number;
};

const CUSTOMER_CHUNK_SIZE = 200;
const ORDER_CHUNK_SIZE = 100;

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

async function fetchShopifyPage<T>(input: {
  shop: string;
  accessToken: string;
  path: string;
}): Promise<{ data: T; nextPath: string | null }> {
  const response = await fetch(`https://${input.shop}/admin/api/2025-01${input.path}`, {
    headers: {
      "X-Shopify-Access-Token": input.accessToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Shopify API request failed (${response.status}) for ${input.path}`);
  }

  const data = (await response.json()) as T;
  const linkHeader = response.headers.get("link");
  const nextPath = getNextPagePath(linkHeader);

  return { data, nextPath };
}

function getNextPagePath(linkHeader: string | null): string | null {
  if (!linkHeader) {
    return null;
  }

  const parts = linkHeader.split(",");
  const nextPart = parts.find((part) => part.includes('rel="next"'));

  if (!nextPart) {
    return null;
  }

  const start = nextPart.indexOf("<");
  const end = nextPart.indexOf(">");

  if (start < 0 || end <= start) {
    return null;
  }

  const nextUrl = nextPart.slice(start + 1, end);

  try {
    const parsed = new URL(nextUrl, "https://example.myshopify.com");
    return parsed.pathname.replace("/admin/api/2025-01", "") + parsed.search;
  } catch {
    return null;
  }
}

async function fetchAllCustomers(input: {
  shop: string;
  accessToken: string;
}): Promise<ShopifyCustomer[]> {
  const customers: ShopifyCustomer[] = [];
  let nextPath: string | null = "/customers.json?limit=250";

  while (nextPath) {
    const pageResponse: {
      data: { customers: ShopifyCustomer[] };
      nextPath: string | null;
    } = await fetchShopifyPage<{ customers: ShopifyCustomer[] }>({
      shop: input.shop,
      accessToken: input.accessToken,
      path: nextPath,
    });

    customers.push(...(pageResponse.data.customers ?? []));
    nextPath = pageResponse.nextPath;
  }

  return customers;
}

async function fetchAllOrders(input: {
  shop: string;
  accessToken: string;
}): Promise<ShopifyOrder[]> {
  const orders: ShopifyOrder[] = [];
  let nextPath: string | null = "/orders.json?status=any&limit=250";

  while (nextPath) {
    const pageResponse: {
      data: { orders: ShopifyOrder[] };
      nextPath: string | null;
    } = await fetchShopifyPage<{ orders: ShopifyOrder[] }>({
      shop: input.shop,
      accessToken: input.accessToken,
      path: nextPath,
    });

    orders.push(...(pageResponse.data.orders ?? []));
    nextPath = pageResponse.nextPath;
  }

  return orders;
}

export async function syncShopData(input: {
  shop: string;
  accessToken: string;
}): Promise<SyncShopDataResult> {
  const startedAt = Date.now();
  let customers: ShopifyCustomer[] = [];
  let customerSyncSkipped = false;
  let customersUpserted = 0;
  let ordersUpserted = 0;

  try {
    customers = await fetchAllCustomers({
      shop: input.shop,
      accessToken: input.accessToken,
    });
  } catch (error) {
    console.warn(`Skipping customer sync for ${input.shop}: ${(error as Error).message}`);
    customerSyncSkipped = true;
  }

  const orders = await fetchAllOrders({
    shop: input.shop,
    accessToken: input.accessToken,
  });

  console.info(
    `[sync] starting transactional write shop=${input.shop} customers=${customers.length} orders=${orders.length}`,
  );

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    for (const chunk of chunkArray(customers, CUSTOMER_CHUNK_SIZE)) {
      await Promise.all(
        chunk.map(async (customer) => {
          await tx.customer.upsert({
            where: {
              shopDomain_shopifyCustomerId: {
                shopDomain: input.shop,
                shopifyCustomerId: String(customer.id),
              },
            },
            update: {
              email: customer.email,
            },
            create: {
              shopDomain: input.shop,
              shopifyCustomerId: String(customer.id),
              email: customer.email,
              totalSpent: 0,
              averageOrderValue: 0,
              predictedLtv: 0,
            },
          });
          customersUpserted += 1;
        }),
      );
    }

    for (const chunk of chunkArray(orders, ORDER_CHUNK_SIZE)) {
      await Promise.all(
        chunk.map(async (order) => {
          const shopifyCustomerId = order.customer?.id
            ? String(order.customer.id)
            : null;
          let customerId: number | null = null;

          if (shopifyCustomerId) {
            const customer = await tx.customer.upsert({
              where: {
                shopDomain_shopifyCustomerId: {
                  shopDomain: input.shop,
                  shopifyCustomerId,
                },
              },
              update: {
                email: order.customer?.email,
              },
              create: {
                shopDomain: input.shop,
                shopifyCustomerId,
                email: order.customer?.email,
                totalSpent: 0,
                averageOrderValue: 0,
                predictedLtv: 0,
              },
            });

            customerId = customer.id;
          }

          const productTitles = (order.line_items ?? [])
            .map((line) => line.title)
            .filter((title): title is string => typeof title === "string");

          await tx.order.upsert({
            where: {
              shopDomain_shopifyOrderId: {
                shopDomain: input.shop,
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
              shopDomain: input.shop,
              shopifyOrderId: String(order.id),
              customerId,
              orderValue: Number(order.total_price ?? 0),
              products: productTitles,
              createdAt: new Date(order.created_at),
            },
          });

          ordersUpserted += 1;
        }),
      );
    }
  });

  await enqueueMetricsRecompute({
    shopDomain: input.shop,
  });

  console.info(
    `[sync] completed shop=${input.shop} customersUpserted=${customersUpserted} ordersUpserted=${ordersUpserted} durationMs=${Date.now() - startedAt}`,
  );

  return {
    customersFetched: customers.length,
    customersUpserted,
    customerSyncSkipped,
    ordersFetched: orders.length,
    ordersUpserted,
  };
}
