import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveShopDomain } from "@/lib/shop-context";
import { toNumber } from "@/lib/serializers/number";

type Pagination = {
  limit: number | null;
  offset: number;
};

function parsePagination(request: NextRequest): Pagination {
  const limitRaw = request.nextUrl.searchParams.get("limit");
  const offsetRaw = request.nextUrl.searchParams.get("offset");

  const limitParsed = limitRaw ? Number.parseInt(limitRaw, 10) : Number.NaN;
  const offsetParsed = offsetRaw ? Number.parseInt(offsetRaw, 10) : Number.NaN;

  return {
    limit:
      Number.isFinite(limitParsed) && limitParsed > 0
        ? Math.min(limitParsed, 250)
        : null,
    offset:
      Number.isFinite(offsetParsed) && offsetParsed >= 0 ? offsetParsed : 0,
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { shopDomain } = resolved;
  const pagination = parsePagination(request);

  const where = { shopDomain };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...(typeof pagination.limit === "number"
        ? {
            take: pagination.limit,
            skip: pagination.offset,
          }
        : {}),
    }),
    prisma.customer.count({ where }),
  ]);

  const returnedCount = customers.length;
  const offset = pagination.limit === null ? 0 : pagination.offset;
  const hasMore =
    pagination.limit === null ? false : offset + returnedCount < total;

  return NextResponse.json({
    customers: customers.map((customer: (typeof customers)[number]) => ({
      id: customer.id,
      shopifyCustomerId: customer.shopifyCustomerId,
      email: customer.email,
      totalOrders: customer.totalOrders,
      totalSpent: toNumber(customer.totalSpent),
      averageOrderValue: toNumber(customer.averageOrderValue),
      predictedLtv: toNumber(customer.predictedLtv),
      lastOrderDate: customer.lastOrderDate,
      createdAt: customer.createdAt,
    })),
    meta: {
      total,
      returnedCount,
      limit: pagination.limit,
      offset,
      hasMore,
      paginationEnabled: pagination.limit !== null,
    },
  });
}
