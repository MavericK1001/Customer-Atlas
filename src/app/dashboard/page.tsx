"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button, Card, InlineGrid, Layout, Page, Text } from "@shopify/polaris";
import { AppShell } from "@/components/layout/AppShell";
import { getShopFromSearchParams } from "@/lib/shop";

type DashboardResponse = {
  customerOverview: {
    totalCustomers: number;
    repeatPurchaseRate: number;
    averageOrderValue: number;
    predictedLtv: number;
  };
  todayPriorities: Array<{
    id: number;
    title: string;
    reason: string;
    confidence: number;
    potentialRevenue: number;
    priorityScore: number;
    ctaLabel: string;
    ctaPath: string;
  }>;
  revenueInsights: Array<{
    id: number;
    type: string;
    message: string;
    potentialRevenue: number;
  }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dismissingInsightId, setDismissingInsightId] = useState<number | null>(
    null,
  );

  const shop = useMemo(() => {
    if (typeof window === "undefined") return "";
    return getShopFromSearchParams(new URLSearchParams(window.location.search));
  }, []);

  useEffect(() => {
    async function loadDashboard() {
      const query = shop ? `?shop=${encodeURIComponent(shop)}` : "";

      const response = await fetch(`/api/dashboard${query}`);
      if (!response.ok) {
        setError("Unable to load dashboard data.");
        return;
      }

      const json = (await response.json()) as DashboardResponse;
      setData(json);
    }

    loadDashboard().catch(() => setError("Unable to load dashboard data."));
  }, [shop]);

  async function handleDismissPriority(insightId: number): Promise<void> {
    try {
      setDismissingInsightId(insightId);

      const query = shop ? `?shop=${encodeURIComponent(shop)}` : "";
      const response = await fetch(`/api/insights${query}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          insightId,
          action: "archive",
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to dismiss priority.");
      }

      setData((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          todayPriorities: prev.todayPriorities.filter(
            (item) => item.id !== insightId,
          ),
          revenueInsights: prev.revenueInsights.filter(
            (item) => item.id !== insightId,
          ),
        };
      });
    } catch (dismissError) {
      setError((dismissError as Error).message);
    } finally {
      setDismissingInsightId(null);
    }
  }

  return (
    <AppShell>
      <Page title="Customer Overview">
        <Layout>
          <Layout.Section>
            <Card>
              <Text as="h3" variant="headingMd">
                Today&apos;s Priorities
              </Text>
              {(data?.todayPriorities ?? []).length === 0 ? (
                <Text as="p" tone="subdued">
                  No priority actions yet. Run a sync to refresh
                  recommendations.
                </Text>
              ) : null}
              {(data?.todayPriorities ?? []).map((item) => (
                <div key={item.id} style={{ marginTop: "12px" }}>
                  <Text as="p" variant="headingSm">
                    {item.title}
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {item.reason}
                  </Text>
                  <Text as="p" tone="subdued">
                    Confidence: {item.confidence}% | Priority score:{" "}
                    {item.priorityScore}
                  </Text>
                  <Text as="p" tone="success">
                    Potential Revenue: ${item.potentialRevenue}
                  </Text>
                  <Link
                    href={
                      shop
                        ? `${item.ctaPath}?shop=${encodeURIComponent(shop)}`
                        : item.ctaPath
                    }
                  >
                    {item.ctaLabel}
                  </Link>
                  <div style={{ marginTop: "8px" }}>
                    <Button
                      variant="tertiary"
                      tone="critical"
                      loading={dismissingInsightId === item.id}
                      onClick={() => {
                        handleDismissPriority(item.id).catch(() => undefined);
                      }}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
          </Layout.Section>
          <Layout.Section>
            <InlineGrid columns={{ xs: 1, md: 2, lg: 4 }} gap="400">
              <Card>
                <Text as="h3" variant="headingSm">
                  Total Customers
                </Text>
                <Text as="p" variant="heading2xl">
                  {data?.customerOverview.totalCustomers ?? 0}
                </Text>
              </Card>
              <Card>
                <Text as="h3" variant="headingSm">
                  Repeat Purchase Rate
                </Text>
                <Text as="p" variant="heading2xl">
                  {data?.customerOverview.repeatPurchaseRate ?? 0}%
                </Text>
              </Card>
              <Card>
                <Text as="h3" variant="headingSm">
                  Average Order Value
                </Text>
                <Text as="p" variant="heading2xl">
                  ${data?.customerOverview.averageOrderValue ?? 0}
                </Text>
              </Card>
              <Card>
                <Text as="h3" variant="headingSm">
                  Predicted LTV
                </Text>
                <Text as="p" variant="heading2xl">
                  ${data?.customerOverview.predictedLtv ?? 0}
                </Text>
              </Card>
            </InlineGrid>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <Text as="h3" variant="headingMd">
                Revenue Insights
              </Text>
              {(data?.revenueInsights ?? []).map((insight) => (
                <div key={insight.id} style={{ marginTop: "12px" }}>
                  <Text as="p" variant="bodyMd">
                    {insight.message}
                  </Text>
                  <Text as="p" tone="success">
                    Potential Revenue: ${insight.potentialRevenue}
                  </Text>
                </div>
              ))}
              {error ? (
                <Text as="p" tone="critical">
                  {error}
                </Text>
              ) : null}
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </AppShell>
  );
}
