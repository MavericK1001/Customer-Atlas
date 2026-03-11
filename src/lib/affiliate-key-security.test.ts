import test from "node:test";
import assert from "node:assert/strict";
import {
  consumeAffiliateKeyRateLimit,
  resetAffiliateKeyRateLimitBuckets,
} from "./affiliate-key-rate-limit";

test("consumeAffiliateKeyRateLimit allows requests inside window until limit", () => {
  resetAffiliateKeyRateLimitBuckets();

  for (let i = 0; i < 120; i += 1) {
    const result = consumeAffiliateKeyRateLimit({
      apiKeyId: 1,
      ipAddress: "127.0.0.1",
      nowMs: 1_000,
    });

    assert.equal(result.ok, true);
  }

  const blocked = consumeAffiliateKeyRateLimit({
    apiKeyId: 1,
    ipAddress: "127.0.0.1",
    nowMs: 1_000,
  });

  assert.equal(blocked.ok, false);
  if (!blocked.ok) {
    assert.equal(blocked.retryAfterSeconds >= 1, true);
  }
});

test("consumeAffiliateKeyRateLimit resets after window", () => {
  resetAffiliateKeyRateLimitBuckets();

  for (let i = 0; i < 121; i += 1) {
    consumeAffiliateKeyRateLimit({
      apiKeyId: 9,
      ipAddress: "10.0.0.2",
      nowMs: 5_000,
    });
  }

  const nextWindow = consumeAffiliateKeyRateLimit({
    apiKeyId: 9,
    ipAddress: "10.0.0.2",
    nowMs: 5_000 + 61_000,
  });

  assert.equal(nextWindow.ok, true);
});
