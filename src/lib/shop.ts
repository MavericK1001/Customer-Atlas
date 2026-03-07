const SHOP_STORAGE_KEY = "customeratlas.shopDomain";

function isValidMyShopifyDomain(value: string): boolean {
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(value);
}

export function normalizeShopDomain(input: string | null | undefined): string {
  if (!input) {
    return "";
  }

  let value = input.trim().toLowerCase();
  if (!value) {
    return "";
  }

  value = value.replace(/^https?:\/\//, "");
  value = value.replace(/\/+$/, "");
  value = value.replace(/\/.*$/, "");
  value = value.replace(/^www\./, "");

  if (!value.endsWith(".myshopify.com") && !value.includes(".")) {
    value = `${value}.myshopify.com`;
  }

  return isValidMyShopifyDomain(value) ? value : "";
}

export function savePreferredShopDomain(shopDomain: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = normalizeShopDomain(shopDomain);
  if (!normalized) {
    return;
  }

  window.localStorage.setItem(SHOP_STORAGE_KEY, normalized);
}

export function getStoredShopDomain(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const stored = window.localStorage.getItem(SHOP_STORAGE_KEY);
  return normalizeShopDomain(stored);
}

export function getShopFromSearchParams(searchParams: URLSearchParams): string {
  const fromQuery = normalizeShopDomain(searchParams.get("shop"));

  if (fromQuery) {
    savePreferredShopDomain(fromQuery);
    return fromQuery;
  }

  return getStoredShopDomain();
}
