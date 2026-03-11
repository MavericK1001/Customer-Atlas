import { NextRequest } from "next/server";

type RateLimitBucket = {
  windowStartMs: number;
  count: number;
};

const keyRateLimitBuckets = new Map<string, RateLimitBucket>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;

export function getClientIpAddress(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.trim();
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function consumeAffiliateKeyRateLimit(input: {
  apiKeyId: number;
  ipAddress: string;
  nowMs?: number;
}):
  | { ok: true }
  | {
      ok: false;
      retryAfterSeconds: number;
    } {
  const nowMs = input.nowMs ?? Date.now();
  const bucketKey = `${input.apiKeyId}:${input.ipAddress}`;
  const existing = keyRateLimitBuckets.get(bucketKey);

  if (!existing || nowMs - existing.windowStartMs >= RATE_LIMIT_WINDOW_MS) {
    keyRateLimitBuckets.set(bucketKey, { windowStartMs: nowMs, count: 1 });
    return { ok: true };
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - (nowMs - existing.windowStartMs);
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  existing.count += 1;
  keyRateLimitBuckets.set(bucketKey, existing);
  return { ok: true };
}

export function resetAffiliateKeyRateLimitBuckets(): void {
  keyRateLimitBuckets.clear();
}
