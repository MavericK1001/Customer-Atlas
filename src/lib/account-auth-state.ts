import crypto from "crypto";
import { env, requiredEnv } from "@/lib/env";

const ACCOUNT_AUTH_STATE_TTL_SECONDS = 60 * 10;

type AccountAuthStatePayload = {
  intent: "login" | "signup";
  shop: string;
  host: string;
  returnTo: string;
  issuedAt: number;
  expiresAt: number;
};

function getStateSecret(): string {
  return env.APP_SESSION_SECRET || requiredEnv("SHOPIFY_API_SECRET");
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getStateSecret()).update(value).digest("hex");
}

function encodePayload(payload: AccountAuthStatePayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(raw: string): AccountAuthStatePayload | null {
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as Partial<AccountAuthStatePayload>;

    if (
      (parsed.intent !== "login" && parsed.intent !== "signup") ||
      typeof parsed.shop !== "string" ||
      typeof parsed.host !== "string" ||
      typeof parsed.returnTo !== "string" ||
      typeof parsed.issuedAt !== "number" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }

    return {
      intent: parsed.intent,
      shop: parsed.shop,
      host: parsed.host,
      returnTo: parsed.returnTo,
      issuedAt: parsed.issuedAt,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

export function createAccountAuthStateToken(input: {
  intent: "login" | "signup";
  shop: string;
  host: string;
  returnTo: string;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AccountAuthStatePayload = {
    intent: input.intent,
    shop: input.shop,
    host: input.host,
    returnTo: input.returnTo,
    issuedAt: now,
    expiresAt: now + ACCOUNT_AUTH_STATE_TTL_SECONDS,
  };

  const encoded = encodePayload(payload);
  return `${encoded}.${sign(encoded)}`;
}

export function readAccountAuthStateToken(
  token: string | null | undefined,
): AccountAuthStatePayload | null {
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

export function accountAuthStateCookieOptions(): {
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
    maxAge: ACCOUNT_AUTH_STATE_TTL_SECONDS,
  };
}