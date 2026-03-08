"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  Checkbox,
  FormLayout,
  InlineStack,
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

type BillingState = {
  planTier: "free" | "pro";
  billingStatus: string;
};

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [segmentName, setSegmentName] = useState("High Intent Segment");
  const [minTotalSpent, setMinTotalSpent] = useState("100");
  const [minOrders, setMinOrders] = useState("2");
  const [inactiveDays, setInactiveDays] = useState("30");
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSegmentId, setEditingSegmentId] = useState<number | null>(null);
  const [editSegmentName, setEditSegmentName] = useState("");
  const [editMinTotalSpent, setEditMinTotalSpent] = useState("0");
  const [editMinOrders, setEditMinOrders] = useState("0");
  const [editInactiveDays, setEditInactiveDays] = useState("0");
  const [savingSegmentId, setSavingSegmentId] = useState<number | null>(null);
  const [deletingSegmentId, setDeletingSegmentId] = useState<number | null>(
    null,
  );
  const [exportingSegmentId, setExportingSegmentId] = useState<number | null>(
    null,
  );
  const [copyingSegmentId, setCopyingSegmentId] = useState<number | null>(null);
  const [exportMinSpend, setExportMinSpend] = useState("0");
  const [exportRepeatOnly, setExportRepeatOnly] = useState(false);
  const [segmentActionError, setSegmentActionError] = useState<string | null>(
    null,
  );
  const [segmentActionSuccess, setSegmentActionSuccess] = useState<
    string | null
  >(null);
  const [billing, setBilling] = useState<BillingState | null>(null);

  const shop = useMemo(() => {
    if (typeof window === "undefined") return "";
    return getShopFromSearchParams(new URLSearchParams(window.location.search));
  }, []);

  useEffect(() => {
    async function loadSegments() {
      const query = shop ? `?shop=${encodeURIComponent(shop)}` : "";
      const [segmentsResponse, billingResponse] = await Promise.all([
        fetch(`/api/segments${query}`),
        fetch(`/api/billing${query}`),
      ]);

      if (segmentsResponse.ok) {
        const json = (await segmentsResponse.json()) as { segments: Segment[] };
        setSegments(json.segments);
      }

      if (billingResponse.ok) {
        const billingJson = (await billingResponse.json()) as {
          billing?: BillingState;
        };
        if (billingJson.billing) {
          setBilling(billingJson.billing);
        }
      }
    }

    loadSegments().catch(() => undefined);
  }, [shop]);

  function parseRuleNumber(
    rules: Record<string, unknown>,
    key: string,
  ): string {
    const value = rules[key];
    return typeof value === "number" && Number.isFinite(value)
      ? String(value)
      : "0";
  }

  async function reloadSegments(): Promise<void> {
    const query = shop ? `?shop=${encodeURIComponent(shop)}` : "";
    const response = await fetch(`/api/segments${query}`);
    if (!response.ok) {
      throw new Error("Unable to refresh segments.");
    }

    const json = (await response.json()) as { segments: Segment[] };
    setSegments(json.segments);
  }

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

  async function handleCreateSegment(): Promise<void> {
    try {
      if (billing?.planTier !== "pro") {
        throw new Error("Upgrade to Pro to create custom segments.");
      }

      setIsCreating(true);
      setSegmentActionError(null);
      setSegmentActionSuccess(null);

      const query = shop ? `?shop=${encodeURIComponent(shop)}` : "";
      const response = await fetch(`/api/segments${query}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          segmentName,
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
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to create segment.");
      }

      await reloadSegments();
      setSegmentActionSuccess("Segment created successfully.");
      setSegmentName("High Intent Segment");
    } catch (error) {
      setSegmentActionError((error as Error).message);
    } finally {
      setIsCreating(false);
    }
  }

  function beginEditSegment(segment: Segment): void {
    setEditingSegmentId(segment.id);
    setEditSegmentName(segment.segmentName);
    setEditMinTotalSpent(parseRuleNumber(segment.rules, "minTotalSpent"));
    setEditMinOrders(parseRuleNumber(segment.rules, "minOrders"));
    setEditInactiveDays(parseRuleNumber(segment.rules, "inactiveDays"));
    setSegmentActionError(null);
    setSegmentActionSuccess(null);
  }

  function cancelEditSegment(): void {
    setEditingSegmentId(null);
    setEditSegmentName("");
    setEditMinTotalSpent("0");
    setEditMinOrders("0");
    setEditInactiveDays("0");
  }

  async function handleSaveSegment(segmentId: number): Promise<void> {
    try {
      if (billing?.planTier !== "pro") {
        throw new Error("Upgrade to Pro to edit custom segments.");
      }

      setSavingSegmentId(segmentId);
      setSegmentActionError(null);
      setSegmentActionSuccess(null);

      const query = shop ? `?shop=${encodeURIComponent(shop)}` : "";
      const response = await fetch(`/api/segments/${segmentId}${query}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          segmentName: editSegmentName,
          rules: {
            minTotalSpent: Number(editMinTotalSpent),
            minOrders: Number(editMinOrders),
            inactiveDays: Number(editInactiveDays),
          },
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to update segment.");
      }

      await reloadSegments();
      cancelEditSegment();
      setSegmentActionSuccess("Segment updated successfully.");
    } catch (error) {
      setSegmentActionError((error as Error).message);
    } finally {
      setSavingSegmentId(null);
    }
  }

  async function handleDeleteSegment(segmentId: number): Promise<void> {
    try {
      if (billing?.planTier !== "pro") {
        throw new Error("Upgrade to Pro to delete custom segments.");
      }

      setDeletingSegmentId(segmentId);
      setSegmentActionError(null);
      setSegmentActionSuccess(null);

      const query = shop ? `?shop=${encodeURIComponent(shop)}` : "";
      const response = await fetch(`/api/segments/${segmentId}${query}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to delete segment.");
      }

      await reloadSegments();
      if (editingSegmentId === segmentId) {
        cancelEditSegment();
      }
      setSegmentActionSuccess("Segment deleted.");
    } catch (error) {
      setSegmentActionError((error as Error).message);
    } finally {
      setDeletingSegmentId(null);
    }
  }

  async function handleExportCsv(segment: Segment): Promise<void> {
    try {
      setExportingSegmentId(segment.id);
      setSegmentActionError(null);
      setSegmentActionSuccess(null);

      const params = new URLSearchParams();
      if (shop) {
        params.set("shop", shop);
      }
      const minSpend = Number.parseFloat(exportMinSpend);
      if (Number.isFinite(minSpend) && minSpend > 0) {
        params.set("minSpend", String(minSpend));
      }
      if (exportRepeatOnly) {
        params.set("repeatOnly", "true");
      }

      const queryString = params.toString();
      const endpoint = queryString
        ? `/api/segments/${segment.id}/export?${queryString}`
        : `/api/segments/${segment.id}/export`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error ?? "Unable to export segment CSV.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeName = segment.segmentName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      link.href = url;
      link.download = `${safeName || "segment"}-export.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSegmentActionSuccess("Segment CSV export started.");
    } catch (error) {
      setSegmentActionError((error as Error).message);
    } finally {
      setExportingSegmentId(null);
    }
  }

  async function handleCopyEmails(segment: Segment): Promise<void> {
    try {
      setCopyingSegmentId(segment.id);
      setSegmentActionError(null);
      setSegmentActionSuccess(null);

      const params = new URLSearchParams();
      params.set("format", "emails");
      if (shop) {
        params.set("shop", shop);
      }
      const minSpend = Number.parseFloat(exportMinSpend);
      if (Number.isFinite(minSpend) && minSpend > 0) {
        params.set("minSpend", String(minSpend));
      }
      if (exportRepeatOnly) {
        params.set("repeatOnly", "true");
      }

      const response = await fetch(
        `/api/segments/${segment.id}/export?${params.toString()}`,
      );

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        emailCount?: number;
        emails?: string[];
      };

      if (!response.ok || !payload.ok || !Array.isArray(payload.emails)) {
        throw new Error(payload.error ?? "Unable to copy segment emails.");
      }

      if (payload.emails.length === 0) {
        setSegmentActionSuccess("No customer emails found for this segment.");
        return;
      }

      await navigator.clipboard.writeText(payload.emails.join(", "));
      setSegmentActionSuccess(
        `Copied ${payload.emailCount ?? payload.emails.length} emails to clipboard.`,
      );
    } catch (error) {
      setSegmentActionError((error as Error).message);
    } finally {
      setCopyingSegmentId(null);
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
                    label="Segment name"
                    value={segmentName}
                    onChange={setSegmentName}
                    autoComplete="off"
                  />
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
                  <Button
                    tone="success"
                    loading={isCreating}
                    disabled={billing?.planTier !== "pro"}
                    onClick={() => {
                      handleCreateSegment().catch(() => undefined);
                    }}
                  >
                    Create segment
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
                {billing?.planTier !== "pro" ? (
                  <Banner tone="warning">
                    Custom segment create/edit/delete is available on Pro. You
                    can still preview segment match counts on the free plan.
                  </Banner>
                ) : null}
                {segmentActionError ? (
                  <Banner tone="critical">{segmentActionError}</Banner>
                ) : null}
                {segmentActionSuccess ? (
                  <Banner tone="success">{segmentActionSuccess}</Banner>
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
              <FormLayout>
                <TextField
                  label="Export filter: minimum total spend"
                  type="number"
                  value={exportMinSpend}
                  onChange={setExportMinSpend}
                  autoComplete="off"
                  helpText="Exports and copied emails include only customers with an email address."
                />
                <Checkbox
                  label="Only include repeat customers (2+ orders)"
                  checked={exportRepeatOnly}
                  onChange={setExportRepeatOnly}
                />
              </FormLayout>
              {segments.length === 0 ? (
                <div className="ca-muted">
                  <Text as="p">No segments available yet.</Text>
                </div>
              ) : null}
              <div className="ca-priority-list">
                {segments.map((segment) => (
                  <div key={segment.id} className="ca-priority-card">
                    {editingSegmentId === segment.id ? (
                      <BlockStack gap="300">
                        <FormLayout>
                          <TextField
                            label="Segment name"
                            value={editSegmentName}
                            onChange={setEditSegmentName}
                            autoComplete="off"
                          />
                          <TextField
                            label="Minimum total spend"
                            type="number"
                            value={editMinTotalSpent}
                            onChange={setEditMinTotalSpent}
                            autoComplete="off"
                          />
                          <TextField
                            label="Minimum orders"
                            type="number"
                            value={editMinOrders}
                            onChange={setEditMinOrders}
                            autoComplete="off"
                          />
                          <TextField
                            label="Inactive for at least (days)"
                            type="number"
                            value={editInactiveDays}
                            onChange={setEditInactiveDays}
                            autoComplete="off"
                          />
                        </FormLayout>
                        <InlineStack align="space-between">
                          <Button
                            variant="primary"
                            disabled={billing?.planTier !== "pro"}
                            loading={savingSegmentId === segment.id}
                            onClick={() => {
                              handleSaveSegment(segment.id).catch(
                                () => undefined,
                              );
                            }}
                          >
                            Save changes
                          </Button>
                          <Button
                            variant="tertiary"
                            onClick={cancelEditSegment}
                          >
                            Cancel
                          </Button>
                        </InlineStack>
                      </BlockStack>
                    ) : (
                      <>
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
                          <Text as="p">
                            Rules: {JSON.stringify(segment.rules)}
                          </Text>
                        </div>
                        <InlineStack align="space-between" blockAlign="center">
                          <InlineStack gap="200">
                            <Button
                              variant="secondary"
                              loading={exportingSegmentId === segment.id}
                              onClick={() => {
                                handleExportCsv(segment).catch(() => undefined);
                              }}
                            >
                              Export CSV
                            </Button>
                            <Button
                              variant="tertiary"
                              loading={copyingSegmentId === segment.id}
                              onClick={() => {
                                handleCopyEmails(segment).catch(
                                  () => undefined,
                                );
                              }}
                            >
                              Copy emails
                            </Button>
                          </InlineStack>
                          <InlineStack gap="200">
                            <Button
                              variant="tertiary"
                              disabled={billing?.planTier !== "pro"}
                              onClick={() => beginEditSegment(segment)}
                            >
                              Edit
                            </Button>
                            <Button
                              tone="critical"
                              variant="tertiary"
                              disabled={billing?.planTier !== "pro"}
                              loading={deletingSegmentId === segment.id}
                              onClick={() => {
                                handleDeleteSegment(segment.id).catch(
                                  () => undefined,
                                );
                              }}
                            >
                              Delete
                            </Button>
                          </InlineStack>
                        </InlineStack>
                      </>
                    )}
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
