"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
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
