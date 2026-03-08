"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { PolarisProvider } from "@/components/providers/PolarisProvider";

function AccountSignupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shop = useMemo(() => searchParams.get("shop") ?? "", [searchParams]);
  const host = useMemo(() => searchParams.get("host") ?? "", [searchParams]);

  async function handleSignup(): Promise<void> {
    try {
      setIsSubmitting(true);
      setError(null);

      const params = new URLSearchParams();
      if (shop) {
        params.set("shop", shop);
      }

      const endpoint = params.toString()
        ? `/api/account/signup?${params.toString()}`
        : "/api/account/signup";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to create account.");
      }

      const dashboardParams = new URLSearchParams();
      if (shop) dashboardParams.set("shop", shop);
      if (host) dashboardParams.set("host", host);

      router.push(
        dashboardParams.toString()
          ? `/dashboard?${dashboardParams.toString()}`
          : "/dashboard",
      );
    } catch (signupError) {
      setError((signupError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const loginParams = new URLSearchParams();
  if (shop) loginParams.set("shop", shop);
  if (host) loginParams.set("host", host);
  const loginHref = loginParams.toString()
    ? `/account/login?${loginParams.toString()}`
    : "/account/login";

  return (
    <PolarisProvider>
      <Page title="Create CustomerAtlas account">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <FormLayout>
                  <TextField
                    label="Name (optional)"
                    autoComplete="name"
                    value={name}
                    onChange={setName}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={setEmail}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    helpText="Use at least 8 characters."
                    value={password}
                    onChange={setPassword}
                  />
                  <Button
                    variant="primary"
                    loading={isSubmitting}
                    onClick={() => {
                      handleSignup().catch(() => undefined);
                    }}
                  >
                    Create account
                  </Button>
                </FormLayout>
                {error ? <Banner tone="critical">{error}</Banner> : null}
                <Text as="p" variant="bodyMd">
                  Already have an account? <a href={loginHref}>Sign in</a>
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </PolarisProvider>
  );
}

export default function AccountSignupPage() {
  return (
    <Suspense
      fallback={
        <PolarisProvider>
          <Page title="Create CustomerAtlas account" />
        </PolarisProvider>
      }
    >
      <AccountSignupInner />
    </Suspense>
  );
}
