import crypto from "crypto";
import { requiredEnv } from "@/lib/env";
import { normalizeShopDomain } from "@/lib/shop";

type SessionTokenPayload = {
  dest?: string;
  aud?: string;
  exp?: number;
  nbf?: number;
  iss?: string;
  sub?: string;
};

function decodeBase64Url(value: string): string {
  const padding = value.length % 4;
  const normalized = `${value}${padding > 0 ? "=".repeat(4 - padding) : ""}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function verifySignature(input: string, signature: string): boolean {
  const expected = crypto
    .createHmac("sha256", requiredEnv("SHOPIFY_API_SECRET"))
    .update(input)
    .digest("base64url");

  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

function extractTokenFromHeader(authorizationHeader: string | null): string {
  if (!authorizationHeader) {
    return "";
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return "";
  }

  return token;
}

export function readShopFromShopifySessionToken(
  authorizationHeader: string | null,
): string {
  const token = extractTokenFromHeader(authorizationHeader);
  if (!token) {
    return "";
  }

  const [headerPart, payloadPart, signaturePart] = token.split(".");
  if (!headerPart || !payloadPart || !signaturePart) {
    return "";
  }

  if (!verifySignature(`${headerPart}.${payloadPart}`, signaturePart)) {
    return "";
  }

  let payload: SessionTokenPayload;
  try {
    payload = JSON.parse(decodeBase64Url(payloadPart)) as SessionTokenPayload;
  } catch {
    return "";
  }

  const expectedAudience = requiredEnv("SHOPIFY_API_KEY");
  if (!payload.aud || payload.aud !== expectedAudience) {
    return "";
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && payload.exp <= now) {
    return "";
  }

  if (typeof payload.nbf === "number" && payload.nbf > now) {
    return "";
  }

  const destination = payload.dest ?? "";
  if (!destination) {
    return "";
  }

  try {
    const parsed = new URL(destination);
    return normalizeShopDomain(parsed.hostname);
  } catch {
    return "";
  }
}
