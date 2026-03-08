"use client";

import { useEffect } from "react";
import { Page, Text } from "@shopify/polaris";
import { PolarisProvider } from "@/components/providers/PolarisProvider";
import { buildAccountAuthUrl } from "@/lib/account-auth-url";

export default function AccountSignupPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop") ?? "";
    const host = params.get("host") ?? "";
    const returnTo = params.get("returnTo") ?? "/dashboard";

    const authUrl = buildAccountAuthUrl({
      intent: "signup",
      shop,
      host,
      returnPath: returnTo,
    });

    window.location.replace(authUrl);
  }, []);

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
