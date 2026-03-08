import { normalizeShopDomain } from "@/lib/shop";

type AccountAuthIntent = "login" | "signup";

type BuildAccountAuthUrlOptions = {
  intent: AccountAuthIntent;
  shop?: string;
  host?: string;
  returnPath?: string;
};

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
    "https://login.customeratlas.com";

  return normalizeBaseUrl(configured);
}

export function hasExternalAccountAuth(): boolean {
  return getAccountAuthBaseUrl().length > 0;
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

  const accountAuthBaseUrl = getAccountAuthBaseUrl();
  if (!accountAuthBaseUrl) {
    return internalParams.toString()
      ? `${internalPath}?${internalParams.toString()}`
      : internalPath;
  }

  let externalUrl: URL;
  try {
    externalUrl = new URL(accountAuthBaseUrl);
  } catch {
    return internalParams.toString()
      ? `${internalPath}?${internalParams.toString()}`
      : internalPath;
  }

  const basePath = externalUrl.pathname === "/" ? "" : externalUrl.pathname.replace(/\/$/, "");
  externalUrl.pathname = `${basePath}/${intent}`;

  if (normalizedShop) {
    externalUrl.searchParams.set("shop", normalizedShop);
  }
  if (normalizedHost) {
    externalUrl.searchParams.set("host", normalizedHost);
  }
  externalUrl.searchParams.set("returnTo", sanitizedReturnPath);

  return externalUrl.toString();
}