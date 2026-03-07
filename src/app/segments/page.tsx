"use client";

import { useEffect, useMemo, useState } from "react";
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

type Segment = {
  id: number;
  segmentName: string;
  rules: Record<string, unknown>;
  customerCount: number;
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
  const [deletingSegmentId, setDeletingSegmentId] = useState<number | null>(null);
  const [segmentActionError, setSegmentActionError] = useState<string | null>(null);
  const [segmentActionSuccess, setSegmentActionSuccess] = useState<string | null>(
    null,
  );

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

  function parseRuleNumber(rules: Record<string, unknown>, key: string): string {
    const value = rules[key];
    return typeof value === "number" && Number.isFinite(value) ? String(value) : "0";
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
                            loading={savingSegmentId === segment.id}
                            onClick={() => {
                              handleSaveSegment(segment.id).catch(() => undefined);
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
                          <Text as="p">Rules: {JSON.stringify(segment.rules)}</Text>
                        </div>
                        <InlineStack align="space-between">
                          <Button
                            variant="tertiary"
                            onClick={() => beginEditSegment(segment)}
                          >
                            Edit
                          </Button>
                          <Button
                            tone="critical"
                            variant="tertiary"
                            loading={deletingSegmentId === segment.id}
                            onClick={() => {
                              handleDeleteSegment(segment.id).catch(() => undefined);
                            }}
                          >
                            Delete
                          </Button>
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
