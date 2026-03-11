"use client";

import { useEffect, useState } from "react";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  FormLayout,
  Layout,
  Page,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { AppShell } from "@/components/layout/AppShell";

type Application = {
  id: number;
  email: string;
  contactName: string;
  companyName: string | null;
  websiteUrl: string | null;
  audienceNotes: string | null;
  status: string;
};

export default function AffiliateApplicationsAdminPage() {
  const [status, setStatus] = useState("pending");
  const [applications, setApplications] = useState<Application[]>([]);
  const [notesById, setNotesById] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function fetchApplications(nextStatus: string): Promise<Application[]> {
    const response = await fetch(
      `/api/admin/affiliate-applications?status=${nextStatus}`,
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      error?: string;
      applications?: Application[];
    };

    if (!response.ok || !payload.ok || !Array.isArray(payload.applications)) {
      throw new Error(payload.error ?? "Unable to load applications.");
    }

    return payload.applications;
  }

  useEffect(() => {
    let cancelled = false;

    void fetchApplications(status)
      .then((nextApplications) => {
        if (cancelled) {
          return;
        }

        setApplications(nextApplications);
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

  async function reviewApplication(
    applicationId: number,
    nextStatus: "approved" | "rejected",
  ): Promise<void> {
    setError(null);

    const response = await fetch("/api/admin/affiliate-applications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        applicationId,
        status: nextStatus,
        reviewerNotes: notesById[applicationId] ?? "",
      }),
    });

    const payload = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error ?? "Unable to review application.");
    }

    const nextApplications = await fetchApplications(status);
    setApplications(nextApplications);
  }

  return (
    <AppShell>
      <Page
        title="Affiliate Applications"
        subtitle="Review and approve partner applications"
      >
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <div className="ca-section-title">
                  <Text as="h3" variant="headingMd">
                    Review Queue
                  </Text>
                </div>
                <Select
                  label="Status"
                  options={[
                    { label: "Pending", value: "pending" },
                    { label: "Approved", value: "approved" },
                    { label: "Rejected", value: "rejected" },
                  ]}
                  value={status}
                  onChange={(nextStatus) => {
                    setError(null);
                    setStatus(nextStatus);
                  }}
                />
                {error ? <Banner tone="critical">{error}</Banner> : null}
                {applications.length === 0 ? (
                  <Text as="p">No applications found.</Text>
                ) : null}
                {applications.map((application) => (
                  <Card key={application.id}>
                    <BlockStack gap="200">
                      <Text as="p" variant="headingSm">
                        {application.contactName} ({application.email})
                      </Text>
                      <Text as="p">
                        Company: {application.companyName || "-"}
                      </Text>
                      <Text as="p">
                        Website: {application.websiteUrl || "-"}
                      </Text>
                      <Text as="p">
                        Audience: {application.audienceNotes || "-"}
                      </Text>
                      {status === "pending" ? (
                        <FormLayout>
                          <TextField
                            label="Reviewer notes"
                            autoComplete="off"
                            value={notesById[application.id] ?? ""}
                            onChange={(value) => {
                              setNotesById((prev) => ({
                                ...prev,
                                [application.id]: value,
                              }));
                            }}
                          />
                          <div className="ca-inline-actions">
                            <Button
                              tone="success"
                              onClick={() => {
                                reviewApplication(
                                  application.id,
                                  "approved",
                                ).catch((reviewError) => {
                                  setError((reviewError as Error).message);
                                });
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              tone="critical"
                              variant="secondary"
                              onClick={() => {
                                reviewApplication(
                                  application.id,
                                  "rejected",
                                ).catch((reviewError) => {
                                  setError((reviewError as Error).message);
                                });
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        </FormLayout>
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
