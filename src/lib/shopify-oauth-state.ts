import crypto from "crypto";
import { env, requiredEnv } from "@/lib/env";
import { normalizeShopDomain } from "@/lib/shop";

const SHOPIFY_OAUTH_STATE_TTL_SECONDS = 60 * 10;

type ShopifyOAuthStatePayload = {
  shopDomain: string;
  nonce: string;
  issuedAt: number;
  expiresAt: number;
};

function getStateSecret(): string {
  return env.APP_SESSION_SECRET || requiredEnv("SHOPIFY_API_SECRET");
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getStateSecret()).update(value).digest("hex");
}

function encodePayload(payload: ShopifyOAuthStatePayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(raw: string): ShopifyOAuthStatePayload | null {
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as Partial<ShopifyOAuthStatePayload>;

    if (
      typeof parsed.shopDomain !== "string" ||
      typeof parsed.nonce !== "string" ||
      typeof parsed.issuedAt !== "number" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }

    const normalizedShopDomain = normalizeShopDomain(parsed.shopDomain);
    if (!normalizedShopDomain || parsed.nonce.length < 8) {
      return null;
    }

    return {
      shopDomain: normalizedShopDomain,
      nonce: parsed.nonce,
      issuedAt: parsed.issuedAt,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

export function createShopifyOAuthStateToken(shopDomain: string): string {
  const normalizedShopDomain = normalizeShopDomain(shopDomain);
  if (!normalizedShopDomain) {
    throw new Error("Cannot create OAuth state for invalid shop domain.");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: ShopifyOAuthStatePayload = {
    shopDomain: normalizedShopDomain,
    nonce: crypto.randomUUID(),
    issuedAt: now,
    expiresAt: now + SHOPIFY_OAUTH_STATE_TTL_SECONDS,
  };

  const encodedPayload = encodePayload(payload);
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function readShopifyOAuthStateToken(
  token: string | null | undefined,
): ShopifyOAuthStatePayload | null {
  if (!token) {
    return null;
  }

  const [rawPayload, signature] = token.split(".");
  if (!rawPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(rawPayload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(provided, expected)) {
    return null;
  }

  const payload = decodePayload(rawPayload);
  if (!payload) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.expiresAt <= now) {
    return null;
  }

  return payload;
}
