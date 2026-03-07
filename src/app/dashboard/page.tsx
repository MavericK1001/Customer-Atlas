"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button, Card, Layout, Page, Text } from "@shopify/polaris";
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

type SyncHealthResponse = {
  ok: boolean;
  syncHealth: {
    freshness: "fresh" | "aging" | "stale" | "unknown";
    lastSyncStatus: string | null;
    lastSyncAt: string | null;
    recommendation: {
      headline: string;
      action: string;
    };
  };
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncHealth, setSyncHealth] = useState<
    SyncHealthResponse["syncHealth"] | null
  >(null);
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

      const syncResponse = await fetch(`/api/sync${query}`);
      if (syncResponse.ok) {
        const syncJson = (await syncResponse.json()) as SyncHealthResponse;
        if (syncJson.ok && syncJson.syncHealth) {
          setSyncHealth(syncJson.syncHealth);
        }
      }
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
      <Page
        title="Customer Intelligence"
        subtitle="Revenue opportunities and retention priorities for today"
      >
        <Layout>
          <Layout.Section>
            <Card>
              <div className="ca-fade-in">
                <div className="ca-section-title">
                  <Text as="h3" variant="headingMd">
                    Portfolio Snapshot
                  </Text>
                </div>
                <div className="ca-kpi-grid">
                  <div className="ca-kpi-card">
                    <div className="ca-kpi-label">Total Customers</div>
                    <div className="ca-kpi-value">
                      {data?.customerOverview.totalCustomers ?? 0}
                    </div>
                  </div>
                  <div className="ca-kpi-card">
                    <div className="ca-kpi-label">Repeat Purchase Rate</div>
                    <div className="ca-kpi-value">
                      {data?.customerOverview.repeatPurchaseRate ?? 0}%
                    </div>
                  </div>
                  <div className="ca-kpi-card">
                    <div className="ca-kpi-label">Average Order Value</div>
                    <div className="ca-kpi-value">
                      ${data?.customerOverview.averageOrderValue ?? 0}
                    </div>
                  </div>
                  <div className="ca-kpi-card">
                    <div className="ca-kpi-label">Predicted LTV</div>
                    <div className="ca-kpi-value">
                      ${data?.customerOverview.predictedLtv ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <div className="ca-section-title">
                <Text as="h3" variant="headingMd">
                  Sync Health
                </Text>
              </div>
              <div className="ca-priority-list">
                <div className="ca-priority-card">
                  <div className="ca-priority-row">
                    <div className="ca-priority-title">
                      <Text as="p" variant="headingSm">
                        {syncHealth?.recommendation.headline ??
                          "Sync status unavailable"}
                      </Text>
                    </div>
                    <span className="ca-priority-meta">
                      {`status ${syncHealth?.lastSyncStatus ?? "unknown"}`}
                    </span>
                  </div>
                  <div className="ca-muted">
                    <Text as="p">
                      {syncHealth?.recommendation.action ??
                        "Run a sync from Settings to initialize health checks."}
                    </Text>
                  </div>
                  <div className="ca-muted">
                    <Text as="p">
                      Freshness: {syncHealth?.freshness ?? "unknown"}
                      {syncHealth?.lastSyncAt
                        ? ` | Last sync: ${new Date(syncHealth.lastSyncAt).toLocaleString()}`
                        : ""}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <div className="ca-section-title">
                <Text as="h3" variant="headingMd">
                  Today&apos;s Priorities
                </Text>
              </div>
              {(data?.todayPriorities ?? []).length === 0 ? (
                <div className="ca-muted">
                  <Text as="p">
                    No priority actions yet. Run a sync to refresh
                    recommendations.
                  </Text>
                </div>
              ) : null}
              <div className="ca-priority-list">
                {(data?.todayPriorities ?? []).map((item) => (
                  <div key={item.id} className="ca-priority-card ca-fade-in">
                    <div className="ca-priority-row">
                      <div className="ca-priority-title">
                        <Text as="p" variant="headingSm">
                          {item.title}
                        </Text>
                      </div>
                      <span className="ca-priority-meta">
                        score {item.priorityScore}
                      </span>
                    </div>
                    <div className="ca-muted">
                      <Text as="p" variant="bodyMd">
                        {item.reason}
                      </Text>
                    </div>
                    <div className="ca-priority-revenue">
                      <Text as="p">
                        Potential Revenue: ${item.potentialRevenue}
                      </Text>
                    </div>
                    <div className="ca-muted">
                      <Text as="p">Confidence: {item.confidence}%</Text>
                    </div>
                    <div className="ca-priority-actions">
                      <Link
                        className="ca-link"
                        href={
                          shop
                            ? `${item.ctaPath}?shop=${encodeURIComponent(shop)}`
                            : item.ctaPath
                        }
                      >
                        {item.ctaLabel}
                      </Link>
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
              </div>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <div className="ca-section-title">
                <Text as="h3" variant="headingMd">
                  Revenue Opportunities
                </Text>
              </div>
              <div className="ca-opportunities">
                {(data?.revenueInsights ?? []).map((insight) => (
                  <div
                    key={insight.id}
                    className="ca-opportunity-card ca-fade-in"
                  >
                    <div className="ca-opportunity-type">{insight.type}</div>
                    <Text as="p" variant="bodyMd">
                      {insight.message}
                    </Text>
                    <div className="ca-opportunity-revenue">
                      +${insight.potentialRevenue}
                    </div>
                  </div>
                ))}
              </div>
              {error ? (
                <div className="ca-alert">
                  <Text as="p">{error}</Text>
                </div>
              ) : null}
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </AppShell>
  );
}
