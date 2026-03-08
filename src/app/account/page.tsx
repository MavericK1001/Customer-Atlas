"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";
import { PolarisProvider } from "@/components/providers/PolarisProvider";
import { buildAccountAuthUrl } from "@/lib/account-auth-url";
import { getShopFromSearchParams } from "@/lib/shop";

type AccountPayload = {
  ok: boolean;
  account: {
    id: number;
    email: string;
    name: string | null;
  } | null;
  stores: Array<{
    shopDomain: string;
    createdAt: string;
  }>;
};

export default function AccountPage() {
  const [accountData, setAccountData] = useState<AccountPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const shop = useMemo(() => {
    if (typeof window === "undefined") return "";
    return getShopFromSearchParams(new URLSearchParams(window.location.search));
  }, []);

  const host = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("host") ?? "";
  }, []);

  useEffect(() => {
    async function loadSession(): Promise<void> {
      const response = await fetch("/api/account/session");
      const payload = (await response.json()) as AccountPayload;
      setAccountData(payload);
    }

    loadSession().catch(() => setError("Unable to load account details."));
  }, []);

  async function handleLogout(): Promise<void> {
    try {
      setIsLoggingOut(true);
      const response = await fetch("/api/account/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Unable to sign out from account.");
      }

      window.location.href = buildAccountAuthUrl({
        intent: "login",
        shop,
        host,
        returnPath: "/account",
      });
    } catch (logoutError) {
      setError((logoutError as Error).message);
    } finally {
      setIsLoggingOut(false);
    }
  }

  const loginHref = buildAccountAuthUrl({
    intent: "login",
    shop,
    host,
    returnPath: "/account",
  });
  const signupHref = buildAccountAuthUrl({
    intent: "signup",
    shop,
    host,
    returnPath: "/account",
  });

  return (
    <PolarisProvider>
      <Page title="Account">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                {!accountData?.account ? (
                  <>
                    <Text as="p" variant="bodyMd">
                      Sign in to link and manage multiple Shopify stores in one
                      CustomerAtlas account.
                    </Text>
                    <BlockStack gap="200">
                      <a href={loginHref}>Sign in</a>
                      <a href={signupHref}>Create account</a>
                    </BlockStack>
                  </>
                ) : (
                  <>
                    <Text as="h3" variant="headingMd">
                      {accountData.account.name || accountData.account.email}
                    </Text>
                    <Text as="p" variant="bodyMd">
                      {accountData.account.email}
                    </Text>
                    <Text as="h4" variant="headingSm">
                      Linked stores ({accountData.stores.length})
                    </Text>
                    {accountData.stores.length === 0 ? (
                      <Text as="p" variant="bodyMd">
                        No stores linked yet. Install from Shopify or switch
                        stores in app navigation.
                      </Text>
                    ) : (
                      <BlockStack gap="100">
                        {accountData.stores.map((store) => (
                          <Text key={store.shopDomain} as="p" variant="bodyMd">
                            {store.shopDomain}
                          </Text>
                        ))}
                      </BlockStack>
                    )}
                    <Button
                      variant="tertiary"
                      loading={isLoggingOut}
                      onClick={() => {
                        handleLogout().catch(() => undefined);
                      }}
                    >
                      Sign out
                    </Button>
                  </>
                )}
                {error ? <Banner tone="critical">{error}</Banner> : null}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </PolarisProvider>
  );
}
