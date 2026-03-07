"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  FormLayout,
  Layout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
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
  const [minTotalSpent, setMinTotalSpent] = useState("100");
  const [minOrders, setMinOrders] = useState("2");
  const [inactiveDays, setInactiveDays] = useState("30");
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

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

  async function handlePreview(): Promise<void> {
    try {
      setIsPreviewing(true);
      setPreviewError(null);

      const query = shop ? `?shop=${encodeURIComponent(shop)}` : "";
      const response = await fetch(`/api/segments/preview${query}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rules: {
            minTotalSpent: Number(minTotalSpent),
            minOrders: Number(minOrders),
            inactiveDays: Number(inactiveDays),
          },
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        matchCount?: number;
      };

      if (
        !response.ok ||
        !payload.ok ||
        typeof payload.matchCount !== "number"
      ) {
        throw new Error(payload.error ?? "Unable to preview segment.");
      }

      setPreviewCount(payload.matchCount);
    } catch (error) {
      setPreviewError((error as Error).message);
    } finally {
      setIsPreviewing(false);
    }
  }

  return (
    <AppShell>
      <Page
        title="Customer Segments"
        subtitle="Design audience rules, preview impact, and monitor segment size"
      >
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <div className="ca-section-title">
                  <Text as="h3" variant="headingMd">
                    Segment Rule Builder
                  </Text>
                </div>
                <div className="ca-opportunities" style={{ marginTop: 0 }}>
                  <div className="ca-opportunity-card">
                    <div className="ca-opportunity-type">Rule Chip</div>
                    <Text as="p" variant="bodyMd">
                      Spent &gt;= ${Number(minTotalSpent || 0)}
                    </Text>
                  </div>
                  <div className="ca-opportunity-card">
                    <div className="ca-opportunity-type">Rule Chip</div>
                    <Text as="p" variant="bodyMd">
                      Orders &gt;= {Number(minOrders || 0)}
                    </Text>
                  </div>
                  <div className="ca-opportunity-card">
                    <div className="ca-opportunity-type">Rule Chip</div>
                    <Text as="p" variant="bodyMd">
                      Inactive &gt;= {Number(inactiveDays || 0)} days
                    </Text>
                  </div>
                </div>
                <FormLayout>
                  <TextField
                    label="Minimum total spend"
                    type="number"
                    value={minTotalSpent}
                    onChange={setMinTotalSpent}
                    autoComplete="off"
                  />
                  <TextField
                    label="Minimum orders"
                    type="number"
                    value={minOrders}
                    onChange={setMinOrders}
                    autoComplete="off"
                  />
                  <TextField
                    label="Inactive for at least (days)"
                    type="number"
                    value={inactiveDays}
                    onChange={setInactiveDays}
                    autoComplete="off"
                  />
                  <Button
                    variant="primary"
                    loading={isPreviewing}
                    onClick={handlePreview}
                  >
                    Preview segment match count
                  </Button>
                </FormLayout>
                {typeof previewCount === "number" ? (
                  <Banner tone="info">
                    Estimated matching customers: {previewCount}
                  </Banner>
                ) : null}
                {previewError ? (
                  <Banner tone="critical">{previewError}</Banner>
                ) : null}
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <div className="ca-section-title">
                <Text as="h3" variant="headingMd">
                  Existing Segments
                </Text>
              </div>
              {segments.length === 0 ? (
                <div className="ca-muted">
                  <Text as="p">No segments available yet.</Text>
                </div>
              ) : null}
              <div className="ca-priority-list">
                {segments.map((segment) => (
                  <div key={segment.id} className="ca-priority-card">
                    <div className="ca-priority-row">
                      <div className="ca-priority-title">
                        <Text as="p" variant="headingSm">
                          {segment.segmentName}
                        </Text>
                      </div>
                      <span className="ca-priority-meta">
                        {segment.customerCount} customers
                      </span>
                    </div>
                    <div className="ca-muted">
                      <Text as="p">Rules: {JSON.stringify(segment.rules)}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </AppShell>
  );
}
