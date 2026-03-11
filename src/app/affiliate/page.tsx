"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  FormLayout,
  InlineStack,
  Layout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import { AppShell } from "@/components/layout/AppShell";
import { getShopFromSearchParams } from "@/lib/shop";

type AffiliateResponse = {
  ok: boolean;
  hasAffiliateProfile: boolean;
  installBaseUrl?: string;
  affiliate?: {
    id: number;
    status: string;
    commissionRate: number;
    approvedAt: string | null;
    links: Array<{
      id: number;
      code: string;
      label: string | null;
      isDefault: boolean;
    }>;
    apiKeys: Array<{ id: number; name: string; keyPrefix: string }>;
    referrals: Array<{
      id: number;
      referredShopDomain: string;
      commissionAmount: number;
      status: string;
    }>;
    payouts: Array<{ id: number; amount: number; status: string }>;
  };
  error?: string;
};

export default function AffiliatePage() {
  const [data, setData] = useState<AffiliateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkLabel, setLinkLabel] = useState("");
  const [keyName, setKeyName] = useState("Partner API Key");
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);

  const shop = useMemo(() => {
    if (typeof window === "undefined") return "";
    return getShopFromSearchParams(new URLSearchParams(window.location.search));
  }, []);

  const loadAffiliate = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const query = shop ? `?shop=${encodeURIComponent(shop)}` : "";
      const response = await fetch(`/api/affiliate${query}`);
      const payload = (await response.json()) as AffiliateResponse;

      if (!response.ok && payload.error) {
        throw new Error(payload.error);
      }

      setData(payload);
    } catch (loadError) {
      setError((loadError as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [shop]);

  useEffect(() => {
    loadAffiliate().catch(() => undefined);
  }, [loadAffiliate]);

  async function createCampaignLink(): Promise<void> {
    const query = shop ? `?shop=${encodeURIComponent(shop)}` : "";
    const response = await fetch(`/api/affiliate/links${query}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: linkLabel }),
    });

    const payload = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error ?? "Unable to create link.");
    }

    setLinkLabel("");
    await loadAffiliate();
  }

  async function createApiKey(): Promise<void> {
    const query = shop ? `?shop=${encodeURIComponent(shop)}` : "";
    const response = await fetch(`/api/affiliate/keys${query}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: keyName }),
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      error?: string;
      key?: { plainTextKey?: string };
    };

    if (!response.ok || !payload.ok) {
      throw new Error(payload.error ?? "Unable to create key.");
    }

    setNewKeyValue(payload.key?.plainTextKey ?? null);
    await loadAffiliate();
  }

  const defaultLink = data?.affiliate?.links.find((link) => link.isDefault);

  return (
    <AppShell>
      <Page
        title="Affiliate Portal"
        subtitle="Manage referral links, keys, and progress"
      >
        <Layout>
          <Layout.Section>
            {isLoading ? (
              <Card>
                <Text as="p">Loading affiliate portal...</Text>
              </Card>
            ) : null}
            {error ? <Banner tone="critical">{error}</Banner> : null}
            {!isLoading && !error && data && !data.hasAffiliateProfile ? (
              <Banner tone="warning">
                No active affiliate profile yet. Apply at{" "}
                <a href="/affiliate-apply">/affiliate-apply</a> and wait for
                approval.
              </Banner>
            ) : null}
          </Layout.Section>

          {data?.affiliate ? (
            <>
              <Layout.Section>
                <Card>
                  <BlockStack gap="300">
                    <div className="ca-section-title">
                      <Text as="h3" variant="headingMd">
                        Program Overview
                      </Text>
                    </div>
                    <InlineStack gap="200">
                      <Text as="p">
                        Status: <strong>{data.affiliate.status}</strong>
                      </Text>
                      <Text as="p">
                        Commission:{" "}
                        <strong>{data.affiliate.commissionRate}%</strong>
                      </Text>
                    </InlineStack>
                    {defaultLink ? (
                      <Banner tone="info">
                        Permanent referral link: {data.installBaseUrl}?ref=
                        {defaultLink.code}
                      </Banner>
                    ) : null}
                  </BlockStack>
                </Card>
              </Layout.Section>

              <Layout.Section>
                <Card>
                  <BlockStack gap="300">
                    <div className="ca-section-title">
                      <Text as="h3" variant="headingMd">
                        Campaign Links
                      </Text>
                    </div>
                    <FormLayout>
                      <TextField
                        label="New link label"
                        autoComplete="off"
                        value={linkLabel}
                        onChange={setLinkLabel}
                      />
                      <Button
                        variant="primary"
                        onClick={() => {
                          createCampaignLink().catch((createError) => {
                            setError((createError as Error).message);
                          });
                        }}
                      >
                        Create link
                      </Button>
                    </FormLayout>
                    {data.affiliate.links.map((link) => (
                      <Text as="p" key={link.id}>
                        {link.label || "Untitled"}: {data.installBaseUrl}?ref=
                        {link.code}
                      </Text>
                    ))}
                  </BlockStack>
                </Card>
              </Layout.Section>

              <Layout.Section>
                <Card>
                  <BlockStack gap="300">
                    <div className="ca-section-title">
                      <Text as="h3" variant="headingMd">
                        API Keys
                      </Text>
                    </div>
                    <FormLayout>
                      <TextField
                        label="Key name"
                        autoComplete="off"
                        value={keyName}
                        onChange={setKeyName}
                      />
                      <Button
                        variant="primary"
                        onClick={() => {
                          createApiKey().catch((createError) => {
                            setError((createError as Error).message);
                          });
                        }}
                      >
                        Generate key
                      </Button>
                    </FormLayout>
                    {newKeyValue ? (
                      <Banner tone="success">
                        New key (copy now, shown once): {newKeyValue}
                      </Banner>
                    ) : null}
                    {data.affiliate.apiKeys.map((key) => (
                      <Text as="p" key={key.id}>
                        {key.name}: {key.keyPrefix}...
                      </Text>
                    ))}
                  </BlockStack>
                </Card>
              </Layout.Section>
            </>
          ) : null}
        </Layout>
      </Page>
    </AppShell>
  );
}
