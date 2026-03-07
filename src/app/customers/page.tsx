"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Layout, Page, Text } from "@shopify/polaris";
import { AppShell } from "@/components/layout/AppShell";
import { getShopFromSearchParams } from "@/lib/shop";

type Customer = {
  id: number;
  email: string | null;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  predictedLtv: number;
  lastOrderDate: string | null;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const shop = useMemo(() => {
    if (typeof window === "undefined") return "";
    return getShopFromSearchParams(new URLSearchParams(window.location.search));
  }, []);

  useEffect(() => {
    async function loadCustomers() {
      const query = shop ? `?shop=${encodeURIComponent(shop)}` : "";
      const response = await fetch(`/api/customers${query}`);
      if (!response.ok) return;
      const json = (await response.json()) as { customers: Customer[] };
      setCustomers(json.customers);
    }

    loadCustomers().catch(() => undefined);
  }, [shop]);

  return (
    <AppShell>
      <Page title="Customers">
        <Layout>
          <Layout.Section>
            {customers.map((customer) => (
              <Card key={customer.id}>
                <Text as="h3" variant="headingSm">
                  {customer.email ?? "No email"}
                </Text>
                <Text as="p">Total Orders: {customer.totalOrders}</Text>
                <Text as="p">Total Spent: ${customer.totalSpent}</Text>
                <Text as="p">AOV: ${customer.averageOrderValue}</Text>
                <Text as="p">Predicted LTV: ${customer.predictedLtv}</Text>
                <Text as="p">
                  Last Order:{" "}
                  {customer.lastOrderDate
                    ? new Date(customer.lastOrderDate).toLocaleDateString()
                    : "N/A"}
                </Text>
              </Card>
            ))}
          </Layout.Section>
        </Layout>
      </Page>
    </AppShell>
  );
}
