"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import {
  buildAccountAuthUrl,
  isAccountAuthOrigin,
  isExternalAccountAuthEnabled,
} from "@/lib/account-auth-url";

export default function AccountLoginPage() {
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
  const canSubmit = email.trim().length > 0 && password.length > 0;
  const externalAuthEnabled = isExternalAccountAuthEnabled();
  const [isMounted, setIsMounted] = useState(false);
  const shouldExternalRedirect =
    externalAuthEnabled &&
    (!isMounted ||
      (typeof window !== "undefined" &&
        !isAccountAuthOrigin(window.location.origin)));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !shouldExternalRedirect) {
      return;
    }

    const authUrl = buildAccountAuthUrl({
      intent: "login",
      shop,
      host,
      returnPath: returnTo,
    });

    window.location.replace(authUrl);
  }, [host, isMounted, returnTo, shop, shouldExternalRedirect]);

  async function handleLogin(): Promise<void> {
    try {
      setIsSubmitting(true);
      setError(null);

      const endpoint = shop
        ? `/api/account/login?shop=${encodeURIComponent(shop)}`
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

      const targetParams = new URLSearchParams();
      if (shop) targetParams.set("shop", shop);
      if (host) targetParams.set("host", host);

      const targetPath = returnTo.startsWith("/") ? returnTo : "/dashboard";
      window.location.href = targetParams.toString()
        ? `${targetPath}?${targetParams.toString()}`
        : targetPath;
    } catch (loginError) {
      setError((loginError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (shouldExternalRedirect) {
    return (
      <PolarisProvider>
        <Page title="Redirecting to sign in">
          <Text as="p" variant="bodyMd">
            Redirecting you to CustomerAtlas Accounts...
          </Text>
        </Page>
      </PolarisProvider>
    );
  }

  const signupHref = `/account/signup?${new URLSearchParams({
    ...(shop ? { shop } : {}),
    ...(host ? { host } : {}),
    returnTo,
  }).toString()}`;

  return (
    <PolarisProvider>
      <Page title="Sign in to CustomerAtlas account">
        <Layout>
          <Layout.Section>
            <div className="ca-auth-hero ca-fade-in">
              <BrandMark
                subtitle="Shopify intelligence operating system"
                size={36}
              />
              <h2>Welcome back.</h2>
              <p>
                Sign in to continue with store claims, dashboards, and
                campaigns.
              </p>
            </div>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap="300" inlineAlign="start">
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
                    disabled={!canSubmit || isSubmitting}
                    onClick={() => {
                      handleLogin().catch(() => undefined);
                    }}
                  >
                    Sign in
                  </Button>
                </FormLayout>
                {error ? <Banner tone="critical">{error}</Banner> : null}
                <Text as="p" variant="bodyMd">
                  Need an account?{" "}
                  <Link className="ca-link" href={signupHref}>
                    Create one
                  </Link>
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </PolarisProvider>
  );
}
