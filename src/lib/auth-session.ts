import crypto from "crypto";
import { env, requiredEnv } from "@/lib/env";
import { normalizeShopDomain } from "@/lib/shop";
const APP_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  shopDomain: string;
  issuedAt: number;
  expiresAt: number;
};

function getSessionSecret(): string {
  return env.APP_SESSION_SECRET || requiredEnv("SHOPIFY_API_SECRET");
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function encodePayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(raw: string): SessionPayload | null {
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as Partial<SessionPayload>;

    if (
      typeof parsed.shopDomain !== "string" ||
      typeof parsed.issuedAt !== "number" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }

    const normalized = normalizeShopDomain(parsed.shopDomain);
    if (!normalized) {
      return null;
    }

    return {
      shopDomain: normalized,
      issuedAt: parsed.issuedAt,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

export function createAppSessionToken(shopDomain: string): string {
  const normalized = normalizeShopDomain(shopDomain);
  if (!normalized) {
    throw new Error("Cannot create session for invalid shop domain.");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    shopDomain: normalized,
    issuedAt: now,
    expiresAt: now + APP_SESSION_TTL_SECONDS,
  };

  const encodedPayload = encodePayload(payload);
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function readAppSessionToken(token: string | null | undefined): SessionPayload | null {
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

export function getAppSessionCookieOptions(): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: APP_SESSION_TTL_SECONDS,
  };
}
