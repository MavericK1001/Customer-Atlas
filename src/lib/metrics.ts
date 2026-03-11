import dayjs from "dayjs";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/serializers/number";

const SEGMENT_DEFINITIONS = {
  vip: {
    name: "VIP Customers",
    rules: { total_spent_gt: 500, orders_gt: 5 },
  },
  churnRisk: {
    name: "Churn Risk",
    rules: { last_order_date_days_gt: 90 },
  },
  oneTime: {
    name: "One-Time Buyers",
    rules: { orders_eq: 1 },
  },
} as const;

const CUSTOMER_BATCH_SIZE = 500;
const MEMBERSHIP_BATCH_SIZE = 1000;

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

export function calculatePredictedLtv(input: {
  averageOrderValue: number;
  totalOrders: number;
  firstOrderDate: Date;
}): number {
  const observedYears = Math.max(dayjs().diff(dayjs(input.firstOrderDate), "day") / 365, 0.25);
  const purchaseFrequency = input.totalOrders / observedYears;
  const projectedLifespanYears = Math.max(observedYears * 1.25, 1);

  return Number((input.averageOrderValue * purchaseFrequency * projectedLifespanYears).toFixed(2));
}

export async function recomputeCustomerMetrics(shopDomain: string, customerId: number): Promise<void> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      orders: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!customer || customer.shopDomain !== shopDomain) {
    return;
  }

  const totalOrders = customer.orders.length;
  const totalSpentRaw = customer.orders.reduce(
    (acc: number, order: { orderValue: unknown }) => acc + toNumber(order.orderValue),
    0,
  );
  const averageOrderValue = totalOrders > 0 ? totalSpentRaw / totalOrders : 0;
  const firstOrderDate = customer.orders[0]?.createdAt ?? customer.createdAt;
  const lastOrderDate = customer.orders[totalOrders - 1]?.createdAt ?? null;
  const predictedLtv = totalOrders > 0
    ? calculatePredictedLtv({
        averageOrderValue,
        totalOrders,
        firstOrderDate,
      })
    : 0;

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      totalOrders,
      totalSpent: totalSpentRaw,
      averageOrderValue,
      predictedLtv,
      lastOrderDate,
    },
  });
}

export async function rebuildSegmentsForShop(shopDomain: string): Promise<void> {
  const customers: Array<{
    id: number;
    totalSpent: unknown;
    totalOrders: number;
    lastOrderDate: Date | null;
  }> = [];

  let cursor: number | undefined;
  while (true) {
    const page = await prisma.customer.findMany({
      where: { shopDomain },
      select: {
        id: true,
        totalSpent: true,
        totalOrders: true,
        lastOrderDate: true,
      },
      orderBy: { id: "asc" },
      take: CUSTOMER_BATCH_SIZE,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    if (page.length === 0) {
      break;
    }

    customers.push(...page);
    cursor = page[page.length - 1].id;
  }

  const [vipSegment, churnRiskSegment, oneTimeSegment] = await Promise.all([
    prisma.segment.upsert({
      where: {
        shopDomain_segmentName: {
          shopDomain,
          segmentName: SEGMENT_DEFINITIONS.vip.name,
        },
      },
      update: { rules: SEGMENT_DEFINITIONS.vip.rules },
      create: {
        shopDomain,
        segmentName: SEGMENT_DEFINITIONS.vip.name,
        rules: SEGMENT_DEFINITIONS.vip.rules,
      },
    }),
    prisma.segment.upsert({
      where: {
        shopDomain_segmentName: {
          shopDomain,
          segmentName: SEGMENT_DEFINITIONS.churnRisk.name,
        },
      },
      update: { rules: SEGMENT_DEFINITIONS.churnRisk.rules },
      create: {
        shopDomain,
        segmentName: SEGMENT_DEFINITIONS.churnRisk.name,
        rules: SEGMENT_DEFINITIONS.churnRisk.rules,
      },
    }),
    prisma.segment.upsert({
      where: {
        shopDomain_segmentName: {
          shopDomain,
          segmentName: SEGMENT_DEFINITIONS.oneTime.name,
        },
      },
      update: { rules: SEGMENT_DEFINITIONS.oneTime.rules },
      create: {
        shopDomain,
        segmentName: SEGMENT_DEFINITIONS.oneTime.name,
        rules: SEGMENT_DEFINITIONS.oneTime.rules,
      },
    }),
  ]);

  const ninetyDaysAgo = dayjs().subtract(90, "day").toDate();

  const vipCustomerIds = customers
    .filter((c: { totalSpent: unknown; totalOrders: number }) => toNumber(c.totalSpent) > 500 && c.totalOrders > 5)
    .map((c: { id: number }) => c.id);

  const churnRiskCustomerIds = customers
    .filter((c: { lastOrderDate: Date | null }) => Boolean(c.lastOrderDate && c.lastOrderDate < ninetyDaysAgo))
    .map((c: { id: number }) => c.id);

  const oneTimeCustomerIds = customers
    .filter((c: { totalOrders: number }) => c.totalOrders === 1)
    .map((c: { id: number }) => c.id);

  await prisma.segmentMembership.deleteMany({
    where: {
      segment: {
        shopDomain,
      },
    },
  });

  const membershipPayload = [
    ...vipCustomerIds.map((customerId: number) => ({ customerId, segmentId: vipSegment.id })),
    ...churnRiskCustomerIds.map((customerId: number) => ({ customerId, segmentId: churnRiskSegment.id })),
    ...oneTimeCustomerIds.map((customerId: number) => ({ customerId, segmentId: oneTimeSegment.id })),
  ];

  if (membershipPayload.length > 0) {
    for (const chunk of chunkArray(membershipPayload, MEMBERSHIP_BATCH_SIZE)) {
      await prisma.segmentMembership.createMany({
        data: chunk,
        skipDuplicates: true,
      });
    }
  }

  await Promise.all([
    prisma.segment.update({ where: { id: vipSegment.id }, data: { customerCount: vipCustomerIds.length } }),
    prisma.segment.update({ where: { id: churnRiskSegment.id }, data: { customerCount: churnRiskCustomerIds.length } }),
    prisma.segment.update({ where: { id: oneTimeSegment.id }, data: { customerCount: oneTimeCustomerIds.length } }),
  ]);
}
