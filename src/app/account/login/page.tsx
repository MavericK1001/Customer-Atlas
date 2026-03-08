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

function AccountLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shop = useMemo(() => searchParams.get("shop") ?? "", [searchParams]);
  const host = useMemo(() => searchParams.get("host") ?? "", [searchParams]);

  async function handleLogin(): Promise<void> {
    try {
      setIsSubmitting(true);
      setError(null);

      const params = new URLSearchParams();
      if (shop) {
        params.set("shop", shop);
      }

      const endpoint = params.toString()
        ? `/api/account/login?${params.toString()}`
        : "/api/account/login";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to sign in.");
      }

      const dashboardParams = new URLSearchParams();
      if (shop) dashboardParams.set("shop", shop);
      if (host) dashboardParams.set("host", host);

      router.push(
        dashboardParams.toString()
          ? `/dashboard?${dashboardParams.toString()}`
          : "/dashboard",
      );
    } catch (loginError) {
      setError((loginError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const signupParams = new URLSearchParams();
  if (shop) signupParams.set("shop", shop);
  if (host) signupParams.set("host", host);
  const signupHref = signupParams.toString()
    ? `/account/signup?${signupParams.toString()}`
    : "/account/signup";

  return (
    <PolarisProvider>
      <Page title="Sign in to CustomerAtlas account">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <FormLayout>
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
                    autoComplete="current-password"
                    value={password}
                    onChange={setPassword}
                  />
                  <Button
                    variant="primary"
                    loading={isSubmitting}
                    onClick={() => {
                      handleLogin().catch(() => undefined);
                    }}
                  >
                    Sign in
                  </Button>
                </FormLayout>
                {error ? <Banner tone="critical">{error}</Banner> : null}
                <Text as="p" variant="bodyMd">
                  Need an account? <a href={signupHref}>Create one</a>
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </PolarisProvider>
  );
}

export default function AccountLoginPage() {
  return (
    <Suspense
      fallback={
        <PolarisProvider>
          <Page title="Sign in to CustomerAtlas account" />
        </PolarisProvider>
      }
    >
      <AccountLoginInner />
    </Suspense>
  );
}
