import { normalizeShopDomain } from "@/lib/shop";

type AccountAuthIntent = "login" | "signup";

type BuildAccountAuthUrlOptions = {
  intent: AccountAuthIntent;
  shop?: string;
  host?: string;
  returnPath?: string;
};

function isEnabled(value: string | undefined): boolean {
  const normalized = (value ?? "").trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return !["0", "false", "off", "no"].includes(normalized);
}

export function sanitizeInternalReturnPath(path: string | undefined): string {
  const trimmed = (path ?? "").trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/dashboard";
  }

  if (trimmed.includes("://") || trimmed.includes("\n") || trimmed.includes("\r")) {
    return "/dashboard";
  }

  return trimmed;
}

function normalizeBaseUrl(rawBaseUrl: string): string {
  const trimmed = rawBaseUrl.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function getAccountAuthBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_ACCOUNT_AUTH_BASE_URL ??
    process.env.ACCOUNT_AUTH_BASE_URL ??
    "https://login.customeratlas.app";

  return normalizeBaseUrl(configured);
}

export function isExternalAccountAuthEnabled(): boolean {
  return isEnabled(
    process.env.NEXT_PUBLIC_EXTERNAL_ACCOUNT_AUTH_ENABLED ??
      process.env.EXTERNAL_ACCOUNT_AUTH_ENABLED,
  );
}

export function hasExternalAccountAuth(): boolean {
  return isExternalAccountAuthEnabled() && getAccountAuthBaseUrl().length > 0;
}

export function buildAccountAuthStartUrl({
  intent,
  shop,
  host,
  returnPath = "/dashboard",
}: BuildAccountAuthUrlOptions): string {
  const normalizedShop = normalizeShopDomain(shop ?? "");
  const normalizedHost = (host ?? "").trim();
  const sanitizedReturnPath = sanitizeInternalReturnPath(returnPath);

  const params = new URLSearchParams();
  params.set("intent", intent);
  if (normalizedShop) {
    params.set("shop", normalizedShop);
  }
  if (normalizedHost) {
    params.set("host", normalizedHost);
  }
  params.set("returnTo", sanitizedReturnPath);

  return `/api/account/auth-start?${params.toString()}`;
}

export function buildExternalAccountProviderUrl(input: {
  intent: AccountAuthIntent;
  shop: string;
  host: string;
  returnTo: string;
  callbackUrl: string;
  state: string;
}): string {
  const externalUrl = new URL(getAccountAuthBaseUrl());
  const basePath =
    externalUrl.pathname === "/" ? "" : externalUrl.pathname.replace(/\/$/, "");
  externalUrl.pathname = `${basePath}/${input.intent}`;
  externalUrl.searchParams.set("shop", input.shop);
  externalUrl.searchParams.set("host", input.host);
  externalUrl.searchParams.set("returnTo", input.returnTo);
  externalUrl.searchParams.set("callbackUrl", input.callbackUrl);
  externalUrl.searchParams.set("state", input.state);
  return externalUrl.toString();
}

export function buildAccountAuthUrl({
  intent,
  shop,
  host,
  returnPath = "/dashboard",
}: BuildAccountAuthUrlOptions): string {
  const normalizedShop = normalizeShopDomain(shop ?? "");
  const normalizedHost = (host ?? "").trim();
  const sanitizedReturnPath = sanitizeInternalReturnPath(returnPath);
  const internalPath = intent === "login" ? "/account/login" : "/account/signup";

  const internalParams = new URLSearchParams();
  if (normalizedShop) {
    internalParams.set("shop", normalizedShop);
  }
  if (normalizedHost) {
    internalParams.set("host", normalizedHost);
  }
  internalParams.set("returnTo", sanitizedReturnPath);

  if (!hasExternalAccountAuth()) {
    return internalParams.toString()
      ? `${internalPath}?${internalParams.toString()}`
      : internalPath;
  }

  return buildAccountAuthStartUrl({
    intent,
    shop: normalizedShop,
    host: normalizedHost,
    returnPath: sanitizedReturnPath,
  });
}