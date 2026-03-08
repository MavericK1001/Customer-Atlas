import crypto from "crypto";
import { env, requiredEnv } from "@/lib/env";

const ACCOUNT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type AccountSessionPayload = {
  merchantUserId: number;
  email: string;
  issuedAt: number;
  expiresAt: number;
};

function getSessionSecret(): string {
  return env.APP_SESSION_SECRET || requiredEnv("SHOPIFY_API_SECRET");
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function encodePayload(payload: AccountSessionPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(raw: string): AccountSessionPayload | null {
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as Partial<AccountSessionPayload>;

    if (
      typeof parsed.merchantUserId !== "number" ||
      typeof parsed.email !== "string" ||
      typeof parsed.issuedAt !== "number" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }

    const normalizedEmail = parsed.email.trim().toLowerCase();
    if (!normalizedEmail.includes("@")) {
      return null;
    }

    return {
      merchantUserId: parsed.merchantUserId,
      email: normalizedEmail,
      issuedAt: parsed.issuedAt,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

export function createAccountSessionToken(input: {
  merchantUserId: number;
  email: string;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AccountSessionPayload = {
    merchantUserId: input.merchantUserId,
    email: input.email.trim().toLowerCase(),
    issuedAt: now,
    expiresAt: now + ACCOUNT_SESSION_TTL_SECONDS,
  };

  const encodedPayload = encodePayload(payload);
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function readAccountSessionToken(
  token: string | null | undefined,
): AccountSessionPayload | null {
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

export function getAccountSessionCookieOptions(): {
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
    maxAge: ACCOUNT_SESSION_TTL_SECONDS,
  };
}
