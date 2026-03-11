"use client";

import { useState } from "react";
import {
  BlockStack,
  Banner,
  Button,
  Card,
  FormLayout,
  Layout,
  Page,
  TextField,
} from "@shopify/polaris";
import { BrandMark } from "@/components/brand/BrandMark";
import { PolarisProvider } from "@/components/providers/PolarisProvider";

function normalizeShopDomain(input: string): string {
  const candidate = input.trim();

  if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
    try {
      return new URL(candidate).hostname.toLowerCase();
    } catch {
      return "";
    }
  }

  return candidate.toLowerCase();
}

export default function InstallPage() {
  const [shop, setShop] = useState("");
  const normalizedShop = normalizeShopDomain(shop);
  const isValidShop = normalizedShop.endsWith(".myshopify.com");

  return (
    <PolarisProvider>
      <Page title="Install CustomerAtlas">
        <Layout>
          <Layout.Section>
            <div className="ca-auth-hero ca-fade-in">
              <BrandMark
                subtitle="Connect your Shopify store in under a minute"
                size={40}
              />
              <h2>Bring your customer data into one command center.</h2>
              <p>
                Install CustomerAtlas to unlock retention signals, growth
                opportunities, and actionable segments for your team.
              </p>
            </div>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <FormLayout>
                  <TextField
                    label="Shop domain"
                    autoComplete="off"
                    value={shop}
                    onChange={setShop}
                    helpText="Example: your-store.myshopify.com"
                    error={
                      shop.trim().length > 0 && !isValidShop
                        ? "Shop domain must end with .myshopify.com"
                        : undefined
                    }
                  />
                  <Button
                    variant="primary"
                    disabled={!isValidShop}
                    onClick={() => {
                      if (!isValidShop) {
                        return;
                      }

                      const installUrl = `/api/auth/shopify?shop=${encodeURIComponent(normalizedShop)}`;
                      window.location.href = installUrl;
                    }}
                  >
                    Connect Shopify Store
                  </Button>
                  {shop.trim().length > 0 && !isValidShop ? (
                    <Banner tone="critical">
                      Enter a valid Shopify domain before continuing.
                    </Banner>
                  ) : null}
                </FormLayout>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </PolarisProvider>
  );
}
