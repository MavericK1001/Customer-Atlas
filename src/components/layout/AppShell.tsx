"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Frame, InlineStack, Navigation } from "@shopify/polaris";
import { PolarisProvider } from "@/components/providers/PolarisProvider";

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
  const queryString = searchParams.toString();

  async function handleLogout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/install");
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
              <Button variant="tertiary" onClick={() => { handleLogout().catch(() => undefined); }}>
                Log out
              </Button>
            </InlineStack>
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
