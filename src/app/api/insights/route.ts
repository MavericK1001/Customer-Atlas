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
  const includeArchived = request.nextUrl.searchParams.get("includeArchived") === "true";

  const insights = await prisma.insight.findMany({
    where: includeArchived
      ? { shopDomain, archivedAt: { not: null } }
      : { shopDomain, archivedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    insights: insights.map((insight: (typeof insights)[number]) => ({
      id: insight.id,
      insightType: insight.insightType,
      message: insight.message,
      potentialRevenue: toNumber(insight.potentialRevenue),
      createdAt: insight.createdAt,
    })),
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
