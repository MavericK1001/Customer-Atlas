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
  const includeArchived = request.nextUrl.searchParams.get("includeArchived") === "true";
  const pagination = parsePagination(request);

  const where = includeArchived
    ? { shopDomain, archivedAt: { not: null } }
    : { shopDomain, archivedAt: null };

  const [insights, total] = await Promise.all([
    prisma.insight.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...(typeof pagination.limit === "number"
        ? {
            take: pagination.limit,
            skip: pagination.offset,
          }
        : {}),
    }),
    prisma.insight.count({ where }),
  ]);

  const returnedCount = insights.length;
  const offset = pagination.limit === null ? 0 : pagination.offset;
  const hasMore =
    pagination.limit === null ? false : offset + returnedCount < total;

  return NextResponse.json({
    insights: insights.map((insight: (typeof insights)[number]) => ({
      id: insight.id,
      insightType: insight.insightType,
      message: insight.message,
      potentialRevenue: toNumber(insight.potentialRevenue),
      createdAt: insight.createdAt,
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

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { shopDomain } = resolved;

  const body = (await request.json()) as {
    insightId?: number;
    action?: "archive" | "unarchive";
  };

  if (!body.insightId || !body.action) {
    return NextResponse.json(
      { error: "insightId and action are required." },
      { status: 400 },
    );
  }

  if (body.action !== "archive" && body.action !== "unarchive") {
    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }

  const updated = await prisma.insight.updateMany({
    where: {
      id: body.insightId,
      shopDomain,
      archivedAt: body.action === "archive" ? null : { not: null },
    },
    data: {
      archivedAt: body.action === "archive" ? new Date() : null,
    },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Insight not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    insightId: body.insightId,
    action: body.action,
  });
}
