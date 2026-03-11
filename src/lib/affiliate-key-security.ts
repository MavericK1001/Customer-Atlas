import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { getClientIpAddress } from "@/lib/affiliate-key-rate-limit";
import { prisma } from "@/lib/prisma";

export async function recordAffiliateApiKeyEvent(input: {
  affiliateId?: number | null;
  apiKeyId?: number | null;
  eventType: string;
  request: NextRequest;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.affiliateApiKeyEvent.create({
      data: {
        affiliateId: input.affiliateId ?? null,
        apiKeyId: input.apiKeyId ?? null,
        eventType: input.eventType,
        ipAddress: getClientIpAddress(input.request),
        userAgent: requestUserAgent(input.request),
        details: (input.details ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (error) {
    // Audit logging failures should not block customer traffic.
    console.warn("Failed to record affiliate API key event", error);
  }
}

function requestUserAgent(request: NextRequest): string | null {
  const value = request.headers.get("user-agent")?.trim();
  return value || null;
}
