"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Layout, Page, Text } from "@shopify/polaris";
import { AppShell } from "@/components/layout/AppShell";
import { getShopFromSearchParams } from "@/lib/shop";

type Segment = {
  id: number;
  segmentName: string;
  rules: Record<string, unknown>;
  customerCount: number;
};

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);

  const shop = useMemo(() => {
    if (typeof window === "undefined") return "";
    return getShopFromSearchParams(new URLSearchParams(window.location.search));
  }, []);

  useEffect(() => {
    async function loadSegments() {
      const query = shop ? `?shop=${encodeURIComponent(shop)}` : "";
      const response = await fetch(`/api/segments${query}`);
      if (!response.ok) return;
      const json = (await response.json()) as { segments: Segment[] };
      setSegments(json.segments);
    }

    loadSegments().catch(() => undefined);
  }, [shop]);

  return (
    <AppShell>
      <Page title="Customer Segments">
        <Layout>
          <Layout.Section>
            {segments.map((segment) => (
              <Card key={segment.id}>
                <Text as="h3" variant="headingMd">
                  {segment.segmentName}
                </Text>
                <Text as="p">Customers: {segment.customerCount}</Text>
                <Text as="p" tone="subdued">
                  Rules: {JSON.stringify(segment.rules)}
                </Text>
              </Card>
            ))}
          </Layout.Section>
        </Layout>
      </Page>
    </AppShell>
  );
}
