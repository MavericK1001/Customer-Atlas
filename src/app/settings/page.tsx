"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  FormLayout,
  InlineStack,
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

type BillingState = {
  planTier: "free" | "pro";
  billingStatus: string;
  trialEndsAt: string | null;
  shopifySubscriptionId: string | null;
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
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [settingsLoadError, setSettingsLoadError] = useState<string | null>(
    null,
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncHealth, setSyncHealth] = useState<SyncHealth | null>(null);
  const [billing, setBilling] = useState<BillingState | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);
  const [billingReturnState, setBillingReturnState] = useState<
    "upgraded" | "not-active" | null
  >(null);
  const normalizedShop = normalizeShopDomain(shopDomain);
  const hasInvalidShopInput =
    shopDomain.trim().length > 0 && !normalizedShop.endsWith(".myshopify.com");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const detectedShop = getShopFromSearchParams(searchParams);
    const billingStatus = searchParams.get("billing");

    if (detectedShop) {
      setShopDomain(detectedShop);
    }

    if (billingStatus === "upgraded") {
      setBillingReturnState("upgraded");
    } else if (billingStatus === "not-active") {
      setBillingReturnState("not-active");
    }
  }, []);

  useEffect(() => {
    async function loadSettingsData(): Promise<void> {
      setIsLoadingSettings(true);
      setSettingsLoadError(null);

      const query = normalizedShop
        ? `?shop=${encodeURIComponent(normalizedShop)}`
        : "";
      const [syncResponse, billingResponse] = await Promise.all([
        fetch(`/api/sync${query}`),
        fetch(`/api/billing${query}`),
      ]);

      if (syncResponse.ok) {
        const payload = (await syncResponse.json()) as {
          ok?: boolean;
          syncHealth?: SyncHealth;
        };

        if (payload.ok && payload.syncHealth) {
          setSyncHealth(payload.syncHealth);
        }
      }

      if (billingResponse.ok) {
        const payload = (await billingResponse.json()) as {
          ok?: boolean;
          billing?: BillingState;
        };

        if (payload.ok && payload.billing) {
          setBilling(payload.billing);
        }
      }

      setIsLoadingSettings(false);
    }

    loadSettingsData().catch(() => {
      setSettingsLoadError("Unable to load settings data right now.");
      setIsLoadingSettings(false);
    });
  }, [normalizedShop]);

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

    if (hasInvalidShopInput) {
      setSyncError("Please enter a valid .myshopify.com domain.");
      return;
    }

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

  async function handleUpgradeToPro(): Promise<void> {
    try {
      setIsUpgrading(true);
      setBillingError(null);

      const normalizedShop = normalizeShopDomain(shopDomain);
      const query = normalizedShop
        ? `?shop=${encodeURIComponent(normalizedShop)}`
        : "";

      const response = await fetch(`/api/billing${query}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planTier: "pro" }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        confirmationUrl?: string;
      };

      if (!response.ok || !payload.ok || !payload.confirmationUrl) {
        throw new Error(payload.error ?? "Unable to start upgrade flow.");
      }

      window.location.href = payload.confirmationUrl;
    } catch (error) {
      setBillingError((error as Error).message);
    } finally {
      setIsUpgrading(false);
    }
  }

  async function handleSwitchToFree(): Promise<void> {
    try {
      setIsDowngrading(true);
      setBillingError(null);

      const normalizedShop = normalizeShopDomain(shopDomain);
      const query = normalizedShop
        ? `?shop=${encodeURIComponent(normalizedShop)}`
        : "";

      const response = await fetch(`/api/billing/cancel${query}`, {
        method: "POST",
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        planTier?: "free" | "pro";
        billingStatus?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to switch to free plan.");
      }

      setBilling((prev) => ({
        planTier: payload.planTier ?? "free",
        billingStatus: payload.billingStatus ?? "canceled",
        trialEndsAt: prev?.trialEndsAt ?? null,
        shopifySubscriptionId: null,
      }));
    } catch (error) {
      setBillingError((error as Error).message);
    } finally {
      setIsDowngrading(false);
    }
  }

  return (
    <AppShell>
      <Page title="Settings">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                {billingReturnState === "upgraded" ? (
                  <Banner tone="success">
                    Pro plan activated successfully. Premium features are now
                    unlocked.
                  </Banner>
                ) : null}
                {billingReturnState === "not-active" ? (
                  <Banner tone="warning">
                    Billing confirmation did not complete. Your plan is still
                    Free.
                  </Banner>
                ) : null}
                <Text as="h3" variant="headingMd">
                  Billing
                </Text>
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd">
                    Current plan
                  </Text>
                  <Badge
                    tone={billing?.planTier === "pro" ? "success" : "info"}
                  >
                    {(billing?.planTier ?? "free").toUpperCase()}
                  </Badge>
                </InlineStack>
                <Text as="p" variant="bodyMd">
                  Billing status: {billing?.billingStatus ?? "unknown"}
                </Text>
                {billing?.trialEndsAt ? (
                  <Text as="p" variant="bodyMd">
                    Trial ends:{" "}
                    {new Date(billing.trialEndsAt).toLocaleDateString()}
                  </Text>
                ) : null}
                <InlineStack gap="200">
                  <Button
                    variant="primary"
                    loading={isUpgrading}
                    disabled={billing?.planTier === "pro"}
                    onClick={() => {
                      handleUpgradeToPro().catch(() => undefined);
                    }}
                  >
                    Upgrade to Pro
                  </Button>
                  <Button
                    variant="tertiary"
                    tone="critical"
                    loading={isDowngrading}
                    disabled={billing?.planTier !== "pro"}
                    onClick={() => {
                      handleSwitchToFree().catch(() => undefined);
                    }}
                  >
                    Switch to Free
                  </Button>
                </InlineStack>
                {billingError ? (
                  <Banner tone="critical">{billingError}</Banner>
                ) : null}
                {isLoadingSettings ? (
                  <Banner tone="info">Loading billing and sync health...</Banner>
                ) : null}
                {settingsLoadError ? (
                  <Banner tone="critical">{settingsLoadError}</Banner>
                ) : null}
              </BlockStack>
            </Card>
          </Layout.Section>
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
                    error={
                      hasInvalidShopInput
                        ? "Shop domain must end with .myshopify.com"
                        : undefined
                    }
                  />
                  <Button
                    variant="primary"
                    loading={isSyncing}
                    disabled={isSyncing || hasInvalidShopInput}
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
