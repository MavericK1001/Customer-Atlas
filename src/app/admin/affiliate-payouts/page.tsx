"use client";

import { useEffect, useState } from "react";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  InlineStack,
  Layout,
  Page,
  Select,
  Text,
} from "@shopify/polaris";
import { AppShell } from "@/components/layout/AppShell";

type Payout = {
  id: number;
  amount: number;
  status: string;
  notes: string | null;
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
  affiliate: {
    merchantUser: {
      email: string;
      name: string | null;
    };
  };
};

export default function AffiliatePayoutsPage() {
  const [status, setStatus] = useState("pending-transfer");
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function fetchPayouts(nextStatus: string): Promise<Payout[]> {
    const response = await fetch(
      `/api/admin/affiliate-payouts?status=${nextStatus}`,
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      error?: string;
      payouts?: Payout[];
    };

    if (!response.ok || !payload.ok || !Array.isArray(payload.payouts)) {
      throw new Error(payload.error ?? "Unable to load payouts.");
    }

    return payload.payouts;
  }

  useEffect(() => {
    let cancelled = false;

    void fetchPayouts(status)
      .then((nextPayouts) => {
        if (cancelled) {
          return;
        }

        setPayouts(nextPayouts);
      })
      .catch((loadError) => {
        if (cancelled) {
          return;
        }

        setError((loadError as Error).message);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  async function markPayout(
    payoutId: number,
    nextStatus: "paid" | "canceled",
  ): Promise<void> {
    setError(null);

    const response = await fetch(`/api/admin/affiliate-payouts/${payoutId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: nextStatus }),
    });

    const payload = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error ?? "Unable to update payout status.");
    }

    const nextPayouts = await fetchPayouts(status);
    setPayouts(nextPayouts);
  }

  return (
    <AppShell>
      <Page
        title="Affiliate Payouts"
        subtitle="Track and settle affiliate payouts"
      >
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <Select
                  label="Status"
                  options={[
                    { label: "Calculated", value: "calculated" },
                    { label: "Pending Transfer", value: "pending-transfer" },
                    { label: "Paid", value: "paid" },
                    { label: "Canceled", value: "canceled" },
                  ]}
                  value={status}
                  onChange={setStatus}
                />
                {error ? <Banner tone="critical">{error}</Banner> : null}
                {payouts.length === 0 ? (
                  <Text as="p">No payouts in this status.</Text>
                ) : null}
                {payouts.map((payout) => (
                  <Card key={payout.id}>
                    <BlockStack gap="200">
                      <Text as="p" variant="headingSm">
                        {payout.affiliate.merchantUser.name ||
                          payout.affiliate.merchantUser.email}
                      </Text>
                      <Text as="p">Amount: ${payout.amount.toFixed(2)}</Text>
                      <Text as="p">Status: {payout.status}</Text>
                      <Text as="p">
                        Period:{" "}
                        {new Date(payout.periodStart).toLocaleDateString()} -{" "}
                        {new Date(payout.periodEnd).toLocaleDateString()}
                      </Text>
                      {payout.status === "pending-transfer" ||
                      payout.status === "calculated" ? (
                        <InlineStack gap="200">
                          <Button
                            tone="success"
                            onClick={() => {
                              markPayout(payout.id, "paid").catch(
                                (markError) => {
                                  setError((markError as Error).message);
                                },
                              );
                            }}
                          >
                            Mark paid
                          </Button>
                          <Button
                            tone="critical"
                            variant="secondary"
                            onClick={() => {
                              markPayout(payout.id, "canceled").catch(
                                (markError) => {
                                  setError((markError as Error).message);
                                },
                              );
                            }}
                          >
                            Cancel
                          </Button>
                        </InlineStack>
                      ) : null}
                    </BlockStack>
                  </Card>
                ))}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </AppShell>
  );
}
