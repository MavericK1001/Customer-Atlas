"use client";

import { useState } from "react";
import {
  BlockStack,
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

  const installUrl = isValidShop
    ? `/api/auth/shopify?shop=${encodeURIComponent(normalizedShop)}`
    : "#";

  return (
    <PolarisProvider>
      <Page title="Install CustomerAtlas">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <BrandMark subtitle="Connect your Shopify store in seconds" size={40} />
                <FormLayout>
                  <TextField
                    label="Shop domain"
                    autoComplete="off"
                    value={shop}
                    onChange={setShop}
                    helpText="Example: your-store.myshopify.com"
                  />
                  <a href={installUrl}>
                    <Button variant="primary" disabled={!isValidShop}>
                      Connect Shopify Store
                    </Button>
                  </a>
                </FormLayout>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </PolarisProvider>
  );
}
