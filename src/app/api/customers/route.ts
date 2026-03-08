import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveShopDomain } from "@/lib/shop-context";

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toString" in value) {
    return Number((value as { toString(): string }).toString());
  }
  return 0;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { shopDomain } = resolved;

  const customers = await prisma.customer.findMany({
    where: { shopDomain },
    orderBy: { createdAt: "desc" },
  });

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
  });
}
