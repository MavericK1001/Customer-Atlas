"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  FormLayout,
  Layout,
  List,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import { AppShell } from "@/components/layout/AppShell";
import {
  getShopFromSearchParams,
  normalizeShopDomain,
  savePreferredShopDomain,
} from "@/lib/shop";

type SyncResult = {
  customersFetched: number;
  customersUpserted: number;
  customerSyncSkipped: boolean;
  ordersFetched: number;
  ordersUpserted: number;
};

type SyncHealth = {
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  lastSyncError: string | null;
  updatedAt: string;
  freshness: "fresh" | "aging" | "stale" | "unknown";
  consecutiveFailures: number;
  recommendation: {
    headline: string;
    action: string;
  };
};

function getStatusTone(
  status: string | null,
): "info" | "success" | "attention" | "critical" {
  if (status === "success") return "success";
  if (status === "failed") return "critical";
  if (status === "running") return "attention";
  return "info";
}

function getFreshnessTone(
  freshness: SyncHealth["freshness"],
): "info" | "success" | "attention" | "critical" {
  if (freshness === "fresh") return "success";
  if (freshness === "aging") return "attention";
  if (freshness === "stale") return "critical";
  return "info";
}

export default function SettingsPage() {
  const [shopDomain, setShopDomain] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncHealth, setSyncHealth] = useState<SyncHealth | null>(null);

  useEffect(() => {
    const detectedShop = getShopFromSearchParams(
      new URLSearchParams(window.location.search),
    );

    if (detectedShop) {
      setShopDomain(detectedShop);
    }
  }, []);

  useEffect(() => {
    async function loadSyncHealth(): Promise<void> {
      const normalizedShop = normalizeShopDomain(shopDomain);
      const query = normalizedShop
        ? `?shop=${encodeURIComponent(normalizedShop)}`
        : "";
      const response = await fetch(`/api/sync${query}`);
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as {
        ok?: boolean;
        syncHealth?: SyncHealth;
      };

      if (payload.ok && payload.syncHealth) {
        setSyncHealth(payload.syncHealth);
      }
    }

    loadSyncHealth().catch(() => undefined);
  }, [shopDomain]);

  const helperText = useMemo(() => {
    if (!syncResult) {
      return "";
    }

    const customerLine = syncResult.customerSyncSkipped
      ? "Customer sync skipped (permissions or policy restrictions)."
      : `Customers fetched: ${syncResult.customersFetched}, upserted: ${syncResult.customersUpserted}.`;

    const orderLine = `Orders fetched: ${syncResult.ordersFetched}, upserted: ${syncResult.ordersUpserted}.`;

    return `${customerLine} ${orderLine}`;
  }, [syncResult]);

  async function handleSyncNow(): Promise<void> {
    const normalizedShop = normalizeShopDomain(shopDomain);
    const query = normalizedShop
      ? `?shop=${encodeURIComponent(normalizedShop)}`
      : "";

    try {
      setIsSyncing(true);
      setSyncError(null);
      setSyncResult(null);

      const response = await fetch(`/api/sync${query}`, {
        method: "POST",
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        details?: string;
        result?: SyncResult;
        syncHealth?: SyncHealth;
      };

      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(payload.details ?? payload.error ?? "Sync failed.");
      }

      if (normalizedShop) {
        savePreferredShopDomain(normalizedShop);
      }

      if (payload.syncHealth) {
        setSyncHealth(payload.syncHealth);
      }

      setSyncResult(payload.result);
    } catch (error) {
      setSyncError((error as Error).message);
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <AppShell>
      <Page title="Settings">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  Data Sync
                </Text>
                <FormLayout>
                  <TextField
                    label="Shop domain"
                    value={shopDomain}
                    onChange={(value) => setShopDomain(value)}
                    autoComplete="off"
                    placeholder="mystore.myshopify.com"
                    helpText="Optional for single-store installs. Leave blank and CustomerAtlas auto-resolves the installed shop."
                  />
                  <Button
                    variant="primary"
                    loading={isSyncing}
                    onClick={handleSyncNow}
                  >
                    Sync now
                  </Button>
                </FormLayout>
                {syncError ? (
                  <Banner tone="critical">{syncError}</Banner>
                ) : null}
                {syncResult ? (
                  <Banner tone="success">{helperText}</Banner>
                ) : null}
                <Card>
                  <BlockStack gap="200">
                    <Text as="h4" variant="headingSm">
                      Sync Health
                    </Text>
                    <Text as="p" variant="bodyMd">
                      <Badge
                        tone={getStatusTone(syncHealth?.lastSyncStatus ?? null)}
                      >
                        {`Status: ${syncHealth?.lastSyncStatus ?? "never run"}`}
                      </Badge>
                    </Text>
                    <Text as="p" variant="bodyMd">
                      <Badge
                        tone={getFreshnessTone(
                          syncHealth?.freshness ?? "unknown",
                        )}
                      >
                        {`Freshness: ${syncHealth?.freshness ?? "unknown"}`}
                      </Badge>
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Last successful sync:{" "}
                      {syncHealth?.lastSyncAt
                        ? new Date(syncHealth.lastSyncAt).toLocaleString()
                        : "N/A"}
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Consecutive failures:{" "}
                      {syncHealth?.consecutiveFailures ?? 0}
                    </Text>
                    {syncHealth?.recommendation ? (
                      <Banner tone="info">
                        <p>
                          <strong>{syncHealth.recommendation.headline}:</strong>{" "}
                          {syncHealth.recommendation.action}
                        </p>
                      </Banner>
                    ) : null}
                    {syncHealth?.lastSyncError ? (
                      <Text as="p" tone="critical">
                        Last error: {syncHealth.lastSyncError}
                      </Text>
                    ) : null}
                  </BlockStack>
                </Card>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <Text as="h3" variant="headingMd">
                Integration Checklist
              </Text>
              <List>
                <List.Item>
                  Set environment variables for Shopify OAuth and database.
                </List.Item>
                <List.Item>
                  Point Shopify webhook subscriptions to{" "}
                  <code>/api/webhooks/shopify</code>.
                </List.Item>
                <List.Item>
                  Start a dedicated BullMQ worker in production if REDIS_URL is
                  configured.
                </List.Item>
                <List.Item>
                  Use HTTPS app URL for embedded Shopify app loading.
                </List.Item>
              </List>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </AppShell>
  );
}
