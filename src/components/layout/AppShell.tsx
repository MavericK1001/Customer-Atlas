"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Banner,
  Button,
  Frame,
  InlineStack,
  Navigation,
  Text,
  TextField,
} from "@shopify/polaris";
import { PolarisProvider } from "@/components/providers/PolarisProvider";
import { normalizeShopDomain } from "@/lib/shop";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Customers", path: "/customers" },
  { label: "Segments", path: "/segments" },
  { label: "Insights", path: "/insights" },
  { label: "Settings", path: "/settings" },
];

function AppShellInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentShop = searchParams.get("shop") ?? "";
  const currentHost = searchParams.get("host") ?? "";
  const queryString = searchParams.toString();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [switchShopInput, setSwitchShopInput] = useState(currentShop);
  const [claimStatus, setClaimStatus] = useState<{
    accountLoggedIn: boolean;
    ownership:
      | "unclaimed"
      | "owned-by-current-account"
      | "owned-by-other-account";
  } | null>(null);
  const [isClaimingStore, setIsClaimingStore] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const normalizedSwitchShop = normalizeShopDomain(switchShopInput);
  const canSwitchShop = normalizedSwitchShop.endsWith(".myshopify.com");

  async function handleLogout(): Promise<void> {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        throw new Error("Unable to log out right now. Please try again.");
      }

      router.push("/install");
    } catch {
      setLogoutError("Unable to log out right now. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  function handleSwitchStore(): void {
    if (!canSwitchShop) {
      return;
    }

    const target = new URLSearchParams();
    target.set("shop", normalizedSwitchShop);
    if (currentHost) {
      target.set("host", currentHost);
    }

    router.push(`/api/auth/shopify?${target.toString()}`);
  }

  const refreshClaimStatus = useCallback(async (): Promise<void> => {
    const query = queryString ? `?${queryString}` : "";
    const response = await fetch(`/api/account/claim-status${query}`);
    const payload = (await response.json()) as {
      ok?: boolean;
      accountLoggedIn?: boolean;
      ownership?:
        | "unclaimed"
        | "owned-by-current-account"
        | "owned-by-other-account";
    };

    if (!response.ok || !payload.ok || !payload.ownership) {
      setClaimStatus(null);
      return;
    }

    setClaimStatus({
      accountLoggedIn: !!payload.accountLoggedIn,
      ownership: payload.ownership,
    });
  }, [queryString]);

  async function handleClaimStore(): Promise<void> {
    try {
      setIsClaimingStore(true);
      setClaimError(null);

      const query = queryString ? `?${queryString}` : "";
      const response = await fetch(`/api/account/claim-store${query}`, {
        method: "POST",
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to claim this store.");
      }

      await refreshClaimStatus();
    } catch (error) {
      setClaimError((error as Error).message);
    } finally {
      setIsClaimingStore(false);
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    type ShopifyGlobal = {
      idToken?: () => Promise<string>;
    };

    const shopify = (window as Window & { shopify?: ShopifyGlobal }).shopify;
    if (!shopify?.idToken) {
      return;
    }
    const getIdToken = shopify.idToken;

    const originalFetch = window.fetch.bind(window);

    window.fetch = async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      let requestUrl = "";

      if (typeof input === "string") {
        requestUrl = input;
      } else if (input instanceof URL) {
        requestUrl = input.toString();
      } else {
        requestUrl = input.url;
      }

      const base = window.location.origin;
      const parsedUrl = new URL(requestUrl, base);
      const isSameOriginApiCall =
        parsedUrl.origin === window.location.origin &&
        parsedUrl.pathname.startsWith("/api/");

      if (!isSameOriginApiCall) {
        return originalFetch(input, init);
      }

      const headers = new Headers(init?.headers);
      if (!headers.has("Authorization")) {
        const token = await getIdToken();
        headers.set("Authorization", `Bearer ${token}`);
      }

      return originalFetch(input, {
        ...init,
        headers,
      });
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    refreshClaimStatus().catch(() => undefined);
  }, [refreshClaimStatus]);

  return (
    <PolarisProvider>
      <Frame
        navigation={
          <Navigation location={pathname}>
            <Navigation.Section
              items={NAV_ITEMS.map((item) => ({
                label: item.label,
                url: queryString ? `${item.path}?${queryString}` : item.path,
              }))}
            />
          </Navigation>
        }
      >
        <div style={{ padding: "16px" }}>
          <div style={{ marginBottom: "10px", fontSize: "12px", opacity: 0.9 }}>
            <InlineStack align="space-between">
              <Link
                href={queryString ? `/dashboard?${queryString}` : "/dashboard"}
              >
                CustomerAtlas
              </Link>
              <InlineStack gap="200" align="center">
                {currentShop ? (
                  <Text as="p" variant="bodyMd">
                    Store: {currentShop}
                  </Text>
                ) : null}
                <div style={{ minWidth: "260px" }}>
                  <TextField
                    label="Switch store"
                    labelHidden
                    placeholder="store-name.myshopify.com"
                    autoComplete="off"
                    value={switchShopInput}
                    onChange={setSwitchShopInput}
                  />
                </div>
                <Button
                  variant="secondary"
                  disabled={!canSwitchShop}
                  onClick={handleSwitchStore}
                >
                  Switch
                </Button>
                <Button
                  variant="tertiary"
                  loading={isLoggingOut}
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                >
                  Log out
                </Button>
              </InlineStack>
            </InlineStack>
            {logoutError ? (
              <Text as="p" tone="critical" variant="bodyMd">
                {logoutError}
              </Text>
            ) : null}
            {claimStatus?.ownership === "unclaimed" ? (
              <div style={{ marginTop: "10px" }}>
                <Banner
                  tone="warning"
                  title="This store is not linked to a CustomerAtlas account"
                  action={
                    claimStatus.accountLoggedIn
                      ? {
                          content: isClaimingStore
                            ? "Claiming..."
                            : "Claim store",
                          onAction: () => {
                            handleClaimStore().catch(() => undefined);
                          },
                          disabled: isClaimingStore,
                        }
                      : {
                          content: "Sign in",
                          url: queryString
                            ? `/account/login?${queryString}`
                            : "/account/login",
                        }
                  }
                  secondaryAction={
                    claimStatus.accountLoggedIn
                      ? undefined
                      : {
                          content: "Create account",
                          url: queryString
                            ? `/account/signup?${queryString}`
                            : "/account/signup",
                        }
                  }
                >
                  Link this Shopify store to your account to manage all stores
                  in one workspace.
                </Banner>
              </div>
            ) : null}
            {claimStatus?.ownership === "owned-by-other-account" ? (
              <div style={{ marginTop: "10px" }}>
                <Banner tone="critical" title="Store linked to another account">
                  This store is already linked to another CustomerAtlas account.
                </Banner>
              </div>
            ) : null}
            {claimError ? (
              <Text as="p" tone="critical" variant="bodyMd">
                {claimError}
              </Text>
            ) : null}
          </div>
          {children}
        </div>
      </Frame>
    </PolarisProvider>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PolarisProvider>{children}</PolarisProvider>}>
      <AppShellInner>{children}</AppShellInner>
    </Suspense>
  );
}
