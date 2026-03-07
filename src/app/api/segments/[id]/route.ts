import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveShopDomain } from "@/lib/shop-context";
import { buildCustomerWhereClause, parseSegmentRules } from "@/lib/segment-rules";

const SYSTEM_SEGMENT_NAMES = new Set([
  "VIP Customers",
  "Churn Risk",
  "One-Time Buyers",
]);

export async function PATCH(
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

  const { shopDomain } = resolved;

  const existing = await prisma.segment.findFirst({
    where: { id: segmentId, shopDomain },
    select: { id: true, segmentName: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Segment not found." }, { status: 404 });
  }

  if (SYSTEM_SEGMENT_NAMES.has(existing.segmentName)) {
    return NextResponse.json(
      { error: "System-generated segments cannot be edited." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as {
    segmentName?: string;
    rules?: unknown;
  };

  const segmentName = body.segmentName?.trim();
  if (!segmentName || segmentName.length < 2 || segmentName.length > 80) {
    return NextResponse.json(
      { error: "segmentName must be between 2 and 80 characters." },
      { status: 400 },
    );
  }

  if (SYSTEM_SEGMENT_NAMES.has(segmentName)) {
    return NextResponse.json(
      { error: "This segment name is reserved for a system-generated segment." },
      { status: 400 },
    );
  }

  const parsed = parseSegmentRules(body.rules);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const whereClause = buildCustomerWhereClause({
    shopDomain,
    rules: parsed.rules,
  });
  const matchCount = await prisma.customer.count({ where: whereClause });

  try {
    const updated = await prisma.segment.update({
      where: { id: segmentId },
      data: {
        segmentName,
        rules: parsed.rules,
        customerCount: matchCount,
      },
    });

    return NextResponse.json({
      ok: true,
      segment: {
        id: updated.id,
        segmentName: updated.segmentName,
        rules: updated.rules,
        customerCount: updated.customerCount,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Segment with this name already exists for this shop." },
      { status: 409 },
    );
  }
}

export async function DELETE(
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

  const { shopDomain } = resolved;

  const existing = await prisma.segment.findFirst({
    where: { id: segmentId, shopDomain },
    select: { id: true, segmentName: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Segment not found." }, { status: 404 });
  }

  if (SYSTEM_SEGMENT_NAMES.has(existing.segmentName)) {
    return NextResponse.json(
      { error: "System-generated segments cannot be deleted." },
      { status: 403 },
    );
  }

  await prisma.segment.delete({ where: { id: segmentId } });

  return NextResponse.json({ ok: true });
}
