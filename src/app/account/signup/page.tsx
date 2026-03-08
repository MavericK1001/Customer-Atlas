"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  buildAccountAuthUrl,
  isExternalAccountAuthEnabled,
} from "@/lib/account-auth-url";

export default function AccountSignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(() => {
    if (typeof window === "undefined") {
      return new URLSearchParams();
    }

    return new URLSearchParams(window.location.search);
  }, []);

  const shop = params.get("shop") ?? "";
  const host = params.get("host") ?? "";
  const returnTo = params.get("returnTo") ?? "/dashboard";
  const externalAuthEnabled = isExternalAccountAuthEnabled();

  useEffect(() => {
    if (!externalAuthEnabled) {
      return;
    }

    const authUrl = buildAccountAuthUrl({
      intent: "signup",
      shop,
      host,
      returnPath: returnTo,
    });

    window.location.replace(authUrl);
  }, [externalAuthEnabled, host, returnTo, shop]);

  async function handleSignup(): Promise<void> {
    try {
      setIsSubmitting(true);
      setError(null);

      const endpoint = shop
        ? `/api/account/signup?shop=${encodeURIComponent(shop)}`
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

      const targetParams = new URLSearchParams();
      if (shop) targetParams.set("shop", shop);
      if (host) targetParams.set("host", host);

      const targetPath = returnTo.startsWith("/") ? returnTo : "/dashboard";
      window.location.href = targetParams.toString()
        ? `${targetPath}?${targetParams.toString()}`
        : targetPath;
    } catch (signupError) {
      setError((signupError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (externalAuthEnabled) {
    return (
      <PolarisProvider>
        <Page title="Redirecting to sign up">
          <Text as="p" variant="bodyMd">
            Redirecting you to CustomerAtlas Accounts...
          </Text>
        </Page>
      </PolarisProvider>
    );
  }

  const loginHref = `/account/login?${new URLSearchParams({
    ...(shop ? { shop } : {}),
    ...(host ? { host } : {}),
    returnTo,
  }).toString()}`;

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
