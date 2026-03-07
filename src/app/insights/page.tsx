"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Banner,
  Button,
  Card,
  InlineStack,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";
import { AppShell } from "@/components/layout/AppShell";
import { getShopFromSearchParams } from "@/lib/shop";

type Insight = {
  id: number;
  insightType: string;
  message: string;
  potentialRevenue: number;
};

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [archivedInsights, setArchivedInsights] = useState<Insight[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatingInsightId, setUpdatingInsightId] = useState<number | null>(
    null,
  );

  const shop = useMemo(() => {
    if (typeof window === "undefined") return "";
    return getShopFromSearchParams(new URLSearchParams(window.location.search));
  }, []);

  useEffect(() => {
    async function loadInsights() {
      const query = shop ? `?shop=${encodeURIComponent(shop)}` : "";
      const [activeResponse, archivedResponse] = await Promise.all([
        fetch(`/api/insights${query}`),
        fetch(
          `/api/insights${query ? `${query}&includeArchived=true` : "?includeArchived=true"}`,
        ),
      ]);

      if (!activeResponse.ok || !archivedResponse.ok) {
        throw new Error("Unable to load insights.");
      }

      const activeJson = (await activeResponse.json()) as {
        insights: Insight[];
      };
      const archivedJson = (await archivedResponse.json()) as {
        insights: Insight[];
      };

      setInsights(activeJson.insights);
      setArchivedInsights(archivedJson.insights);
    }

    loadInsights().catch((loadError) => setError((loadError as Error).message));
  }, [shop]);

  async function updateInsightState(input: {
    insightId: number;
    action: "archive" | "unarchive";
  }): Promise<void> {
    try {
      setUpdatingInsightId(input.insightId);
      setError(null);

      const query = shop ? `?shop=${encodeURIComponent(shop)}` : "";
      const response = await fetch(`/api/insights${query}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to update insight.");
      }

      if (input.action === "archive") {
        const archivedItem = insights.find(
          (item) => item.id === input.insightId,
        );
        setInsights((prev) =>
          prev.filter((item) => item.id !== input.insightId),
        );
        if (archivedItem) {
          setArchivedInsights((prev) => [archivedItem, ...prev]);
        }
        return;
      }

      const restoredItem = archivedInsights.find(
        (item) => item.id === input.insightId,
      );
      setArchivedInsights((prev) =>
        prev.filter((item) => item.id !== input.insightId),
      );
      if (restoredItem) {
        setInsights((prev) => [restoredItem, ...prev]);
      }
    } catch (updateError) {
      setError((updateError as Error).message);
    } finally {
      setUpdatingInsightId(null);
    }
  }

  return (
    <AppShell>
      <Page title="Revenue Insights">
        <Layout>
          <Layout.Section>
            {error ? <Banner tone="critical">{error}</Banner> : null}
          </Layout.Section>
          <Layout.Section>
            <Card>
              <Text as="h3" variant="headingMd">
                Active Insights
              </Text>
              {insights.length === 0 ? (
                <Text as="p" tone="subdued">
                  No active insights right now.
                </Text>
              ) : null}
            </Card>
          </Layout.Section>
          <Layout.Section>
            {insights.map((insight) => (
              <Card key={insight.id}>
                <Text as="h3" variant="headingSm">
                  {insight.message}
                </Text>
                <Text as="p">Type: {insight.insightType}</Text>
                <Text as="p" tone="success">
                  Potential Revenue Gain: ${insight.potentialRevenue}
                </Text>
                <InlineStack align="end">
                  <Button
                    tone="critical"
                    variant="tertiary"
                    loading={updatingInsightId === insight.id}
                    onClick={() => {
                      updateInsightState({
                        insightId: insight.id,
                        action: "archive",
                      }).catch(() => undefined);
                    }}
                  >
                    Archive
                  </Button>
                </InlineStack>
              </Card>
            ))}
          </Layout.Section>
          <Layout.Section>
            <Card>
              <Text as="h3" variant="headingMd">
                Archived Insights
              </Text>
              {archivedInsights.length === 0 ? (
                <Text as="p" tone="subdued">
                  No archived insights.
                </Text>
              ) : null}
            </Card>
          </Layout.Section>
          <Layout.Section>
            {archivedInsights.map((insight) => (
              <Card key={insight.id}>
                <Text as="h3" variant="headingSm">
                  {insight.message}
                </Text>
                <Text as="p">Type: {insight.insightType}</Text>
                <Text as="p" tone="subdued">
                  Potential Revenue Gain: ${insight.potentialRevenue}
                </Text>
                <InlineStack align="end">
                  <Button
                    variant="tertiary"
                    loading={updatingInsightId === insight.id}
                    onClick={() => {
                      updateInsightState({
                        insightId: insight.id,
                        action: "unarchive",
                      }).catch(() => undefined);
                    }}
                  >
                    Restore
                  </Button>
                </InlineStack>
              </Card>
            ))}
          </Layout.Section>
        </Layout>
      </Page>
    </AppShell>
  );
}
