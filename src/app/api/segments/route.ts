import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveShopDomain } from "@/lib/shop-context";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const resolved = await resolveShopDomain(request);

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { shopDomain } = resolved;

  const segments = await prisma.segment.findMany({
    where: { shopDomain },
    orderBy: { segmentName: "asc" },
  });

  return NextResponse.json({
    segments: segments.map((segment) => ({
      id: segment.id,
      segmentName: segment.segmentName,
      rules: segment.rules,
      customerCount: segment.customerCount,
    })),
  });
}
