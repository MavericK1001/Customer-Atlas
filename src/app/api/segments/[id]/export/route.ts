import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildCustomerWhereClause, parseSegmentRules } from "@/lib/segment-rules";
import { resolveShopDomain } from "@/lib/shop-context";

type ExportRow = {
  email: string;
  shopifyCustomerId: string;
  totalSpent: string;
  totalOrders: number;
  lastOrderDate: string;
};

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toString" in value) {
    return Number((value as { toString(): string }).toString());
  }
  return 0;
}

function escapeCsv(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

function toCsv(rows: ExportRow[]): string {
  const header = [
    "email",
    "shopify_customer_id",
    "total_spent",
    "total_orders",
    "last_order_date",
  ];

  const lines = rows.map((row) =>
    [
      escapeCsv(row.email),
      escapeCsv(row.shopifyCustomerId),
      escapeCsv(row.totalSpent),
      escapeCsv(String(row.totalOrders)),
      escapeCsv(row.lastOrderDate),
    ].join(","),
  );

  return [header.join(","), ...lines].join("\n");
}

function toSlug(input: string): string {
  const cleaned = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned.length > 0 ? cleaned : "segment";
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { id } = await context.params;
  const segmentId = Number.parseInt(id, 10);
  if (!Number.isFinite(segmentId)) {
    return NextResponse.json({ error: "Invalid segment id." }, { status: 400 });
  }

  const segment = await prisma.segment.findFirst({
    where: { id: segmentId, shopDomain: resolved.shopDomain },
    select: {
      id: true,
      segmentName: true,
      rules: true,
    },
  });

  if (!segment) {
    return NextResponse.json({ error: "Segment not found." }, { status: 404 });
  }

  const parsed = parseSegmentRules(segment.rules);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "Segment rules are invalid. Please update segment rules and retry export." },
      { status: 422 },
    );
  }

  const whereClause = buildCustomerWhereClause({
    shopDomain: resolved.shopDomain,
    rules: parsed.rules,
  });

  const exportMinSpendRaw = request.nextUrl.searchParams.get("minSpend");
  const exportMinSpendParsed = exportMinSpendRaw
    ? Number.parseFloat(exportMinSpendRaw)
    : Number.NaN;

  if (
    exportMinSpendRaw &&
    (!Number.isFinite(exportMinSpendParsed) || exportMinSpendParsed < 0)
  ) {
    return NextResponse.json(
      { error: "minSpend must be a valid non-negative number." },
      { status: 400 },
    );
  }

  const exportMinSpend = exportMinSpendRaw ? exportMinSpendParsed : null;

  const customers = await prisma.customer.findMany({
    where: whereClause,
    orderBy: { totalSpent: "desc" },
    select: {
      email: true,
      shopifyCustomerId: true,
      totalSpent: true,
      totalOrders: true,
      lastOrderDate: true,
    },
  });

  const rows: ExportRow[] = customers
    .filter((customer) => {
      if (exportMinSpend === null) {
        return true;
      }

      return toNumber(customer.totalSpent) >= exportMinSpend;
    })
    .filter((customer) => !!customer.email)
    .map((customer) => ({
      email: customer.email ?? "",
      shopifyCustomerId: customer.shopifyCustomerId,
      totalSpent: toNumber(customer.totalSpent).toFixed(2),
      totalOrders: customer.totalOrders,
      lastOrderDate: customer.lastOrderDate?.toISOString() ?? "",
    }));

  const format = request.nextUrl.searchParams.get("format");
  if (format === "emails") {
    return NextResponse.json({
      ok: true,
      segmentId: segment.id,
      segmentName: segment.segmentName,
      emailCount: rows.length,
      emails: rows.map((row) => row.email),
    });
  }

  const csv = `\uFEFF${toCsv(rows)}`;
  const filename = `${toSlug(segment.segmentName)}-export.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"${filename}\"`,
      "Cache-Control": "no-store",
    },
  });
}
