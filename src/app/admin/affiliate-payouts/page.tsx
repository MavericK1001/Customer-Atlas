"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  FormLayout,
  InlineStack,
  Layout,
  Page,
  Select,
  Text,
  TextField,
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

type AffiliateOption = {
  id: number;
  email: string;
  name: string | null;
};

type PayoutListResponse = {
  ok?: boolean;
  error?: string;
  payouts?: Payout[];
  affiliates?: AffiliateOption[];
};

export default function AffiliatePayoutsPage() {
  const [status, setStatus] = useState("pending-transfer");
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [affiliates, setAffiliates] = useState<AffiliateOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createAffiliateId, setCreateAffiliateId] = useState("");
  const [createAmount, setCreateAmount] = useState("");
  const [createPeriodStart, setCreatePeriodStart] = useState("");
  const [createPeriodEnd, setCreatePeriodEnd] = useState("");
  const [createNotes, setCreateNotes] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function fetchPayouts(nextStatus: string): Promise<PayoutListResponse> {
    const response = await fetch(
      `/api/admin/affiliate-payouts?status=${nextStatus}&includeAffiliates=1`,
    );
    const payload = (await response.json()) as PayoutListResponse;

    if (!response.ok || !payload.ok || !Array.isArray(payload.payouts)) {
      throw new Error(payload.error ?? "Unable to load payouts.");
    }

    return payload;
  }

  const loadData = useCallback(async (): Promise<void> => {
    const payload = await fetchPayouts(status);
    setPayouts(payload.payouts ?? []);
    setAffiliates(payload.affiliates ?? []);
  }, [status]);

  useEffect(() => {
    let cancelled = false;

    void fetchPayouts(status)
      .then((payload) => {
        if (cancelled) {
          return;
        }

        setPayouts(payload.payouts ?? []);
        setAffiliates(payload.affiliates ?? []);
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
    setSuccessMessage(null);

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

    await loadData();
    setSuccessMessage(`Payout ${payoutId} updated to ${nextStatus}.`);
  }

  async function createPayout(): Promise<void> {
    setError(null);
    setSuccessMessage(null);

    if (!createAffiliateId) {
      throw new Error("Select an affiliate before creating a payout.");
    }

    const parsedAmount = Number.parseFloat(createAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new Error("Enter a valid payout amount.");
    }

    if (!createPeriodStart || !createPeriodEnd) {
      throw new Error("Set both period start and period end.");
    }

    setIsCreating(true);

    const response = await fetch("/api/admin/affiliate-payouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        affiliateId: Number.parseInt(createAffiliateId, 10),
        amount: parsedAmount,
        periodStart: new Date(createPeriodStart).toISOString(),
        periodEnd: new Date(createPeriodEnd).toISOString(),
        notes: createNotes.trim() || undefined,
      }),
    });

    const payload = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !payload.ok) {
      setIsCreating(false);
      throw new Error(payload.error ?? "Unable to create payout.");
    }

    setStatus("calculated");
    setCreateAmount("");
    setCreateNotes("");
    setIsCreating(false);
    await loadData();
    setSuccessMessage("Payout created in calculated status.");
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
                <Text as="h3" variant="headingMd">
                  Create payout
                </Text>
                <FormLayout>
                  <Select
                    label="Affiliate"
                    options={[
                      { label: "Select an affiliate", value: "" },
                      ...affiliates.map((affiliate) => ({
                        label: `${affiliate.name || affiliate.email} (#${affiliate.id})`,
                        value: String(affiliate.id),
                      })),
                    ]}
                    value={createAffiliateId}
                    onChange={setCreateAffiliateId}
                  />
                  <TextField
                    label="Amount (USD)"
                    type="number"
                    autoComplete="off"
                    value={createAmount}
                    onChange={setCreateAmount}
                  />
                  <TextField
                    label="Period start"
                    type="date"
                    autoComplete="off"
                    value={createPeriodStart}
                    onChange={setCreatePeriodStart}
                  />
                  <TextField
                    label="Period end"
                    type="date"
                    autoComplete="off"
                    value={createPeriodEnd}
                    onChange={setCreatePeriodEnd}
                  />
                  <TextField
                    label="Notes"
                    autoComplete="off"
                    multiline={2}
                    value={createNotes}
                    onChange={setCreateNotes}
                  />
                  <Button
                    variant="primary"
                    loading={isCreating}
                    onClick={() => {
                      createPayout().catch((createError) => {
                        setIsCreating(false);
                        setError((createError as Error).message);
                      });
                    }}
                  >
                    Create payout
                  </Button>
                </FormLayout>

                <Text as="h3" variant="headingMd">
                  Existing payouts
                </Text>
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
                {successMessage ? <Banner tone="success">{successMessage}</Banner> : null}
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
