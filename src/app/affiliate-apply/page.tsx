"use client";

import { useState } from "react";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  FormLayout,
  Layout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import { BrandMark } from "@/components/brand/BrandMark";
import { PolarisProvider } from "@/components/providers/PolarisProvider";

export default function AffiliateApplyPage() {
  const [email, setEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [audienceNotes, setAudienceNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(): Promise<void> {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/affiliate/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          contactName,
          companyName,
          websiteUrl,
          audienceNotes,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to submit application.");
      }

      setSuccess(
        "Application submitted. Our team will review and contact you soon.",
      );
      setEmail("");
      setContactName("");
      setCompanyName("");
      setWebsiteUrl("");
      setAudienceNotes("");
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PolarisProvider>
      <Page title="CustomerAtlas Affiliate Program">
        <Layout>
          <Layout.Section>
            <div className="ca-auth-hero ca-fade-in">
              <BrandMark
                subtitle="Apply to become a CustomerAtlas affiliate partner"
                size={40}
              />
              <h2>
                Grow with us and earn commissions for qualified referrals.
              </h2>
              <p>
                Submit your details below. Our team reviews each application and
                enables affiliate access after approval.
              </p>
            </div>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <div className="ca-section-title">
                  <Text as="h3" variant="headingMd">
                    Affiliate Application
                  </Text>
                </div>
                <FormLayout>
                  <TextField
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={setEmail}
                  />
                  <TextField
                    label="Contact name"
                    autoComplete="name"
                    value={contactName}
                    onChange={setContactName}
                  />
                  <TextField
                    label="Company or brand (optional)"
                    autoComplete="organization"
                    value={companyName}
                    onChange={setCompanyName}
                  />
                  <TextField
                    label="Website or portfolio (optional)"
                    autoComplete="url"
                    value={websiteUrl}
                    onChange={setWebsiteUrl}
                  />
                  <TextField
                    label="Tell us about your audience"
                    value={audienceNotes}
                    multiline={4}
                    autoComplete="off"
                    onChange={setAudienceNotes}
                  />
                  <Button
                    variant="primary"
                    loading={isSubmitting}
                    onClick={() => {
                      handleSubmit().catch(() => undefined);
                    }}
                  >
                    Submit application
                  </Button>
                </FormLayout>
                {error ? <Banner tone="critical">{error}</Banner> : null}
                {success ? <Banner tone="success">{success}</Banner> : null}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </PolarisProvider>
  );
}
