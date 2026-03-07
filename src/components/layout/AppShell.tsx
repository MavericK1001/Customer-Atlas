"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Frame, Navigation } from "@shopify/polaris";
import { PolarisProvider } from "@/components/providers/PolarisProvider";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Customers", path: "/customers" },
  { label: "Segments", path: "/segments" },
  { label: "Insights", path: "/insights" },
  { label: "Settings", path: "/settings" },
];

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

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
          <div style={{ marginBottom: "10px", fontSize: "12px", opacity: 0.8 }}>
            <Link
              href={queryString ? `/dashboard?${queryString}` : "/dashboard"}
            >
              CustomerAtlas
            </Link>
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
