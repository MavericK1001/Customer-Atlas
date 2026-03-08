"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  InlineStack,
  Layout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [highValueOnly, setHighValueOnly] = useState(false);

  const shop = useMemo(() => {
    if (typeof window === "undefined") return "";
    return getShopFromSearchParams(new URLSearchParams(window.location.search));
  }, []);

  useEffect(() => {
    async function loadCustomers() {
      setIsLoading(true);
      setError(null);
      const query = shop ? `?shop=${encodeURIComponent(shop)}` : "";
      const response = await fetch(`/api/customers${query}`);
      if (!response.ok) {
        throw new Error("Unable to load customers.");
      }

      const json = (await response.json()) as { customers: Customer[] };
      setCustomers(json.customers);
    }

    loadCustomers()
      .catch((loadError) => {
        setError((loadError as Error).message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [shop]);

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const filteredCustomers = customers.filter((customer) => {
    const customerEmail = (customer.email ?? "").toLowerCase();
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 || customerEmail.includes(normalizedSearch);
    const matchesValue = !highValueOnly || customer.predictedLtv >= 500;
    return matchesSearch && matchesValue;
  });

  const highValueCount = customers.filter(
    (customer) => customer.predictedLtv >= 500,
  ).length;

  const averageLtv = customers.length
    ? customers.reduce((sum, customer) => sum + customer.predictedLtv, 0) /
      customers.length
    : 0;

  return (
    <AppShell>
      <Page title="Customers" subtitle="Prioritize your highest-value cohorts">
        <div className="ca-page-hero ca-fade-in">
          <p className="ca-dashboard-kicker">Customer Portfolio</p>
          <h2>Turn your customer list into action-ready segments.</h2>
          <p>
            Scan revenue potential, recency, and order depth without digging into
            raw rows.
          </p>
          <div className="ca-hero-metrics">
            <div className="ca-hero-metric-pill">
              <span>Profiles</span>
              <strong>{customers.length}</strong>
            </div>
            <div className="ca-hero-metric-pill">
              <span>High-value</span>
              <strong>{highValueCount}</strong>
            </div>
            <div className="ca-hero-metric-pill">
              <span>Avg predicted LTV</span>
              <strong>{currency.format(averageLtv)}</strong>
            </div>
          </div>
        </div>
        <Layout>
          <Layout.Section>
            <Card>
              <div className="ca-filter-bar">
                <div className="ca-filter-input">
                  <TextField
                    label="Search customers"
                    labelHidden
                    placeholder="Search by email"
                    value={searchTerm}
                    autoComplete="off"
                    onChange={setSearchTerm}
                  />
                </div>
                <Button
                  variant={highValueOnly ? "primary" : "secondary"}
                  onClick={() => {
                    setHighValueOnly((value) => !value);
                  }}
                >
                  {highValueOnly ? "Showing LTV $500+" : "Filter LTV $500+"}
                </Button>
              </div>
            </Card>
          </Layout.Section>
          <Layout.Section>
            {error ? (
              <Card>
                <Text as="p" tone="critical">
                  {error}
                </Text>
              </Card>
            ) : null}
            {isLoading ? (
              <Card>
                <Text as="p" tone="subdued">
                  Loading customer profiles...
                </Text>
              </Card>
            ) : null}
            {!isLoading && filteredCustomers.length === 0 ? (
              <Card>
                <Text as="p" tone="subdued">
                  No customers match the current filters.
                </Text>
              </Card>
            ) : null}
            <div className="ca-customer-grid">
              {filteredCustomers.map((customer) => {
                const lastOrderText = customer.lastOrderDate
                  ? new Date(customer.lastOrderDate).toLocaleDateString()
                  : "No recent order";

                const valueTier =
                  customer.predictedLtv >= 1200
                    ? "VIP"
                    : customer.predictedLtv >= 500
                      ? "Growth"
                      : "Emerging";

                return (
                  <Card key={customer.id}>
                    <div className="ca-customer-card ca-fade-in">
                      <InlineStack align="space-between" blockAlign="center">
                        <Text as="h3" variant="headingSm">
                          {customer.email ?? "No email available"}
                        </Text>
                        <Badge tone="info">{valueTier}</Badge>
                      </InlineStack>
                      <div className="ca-customer-metrics">
                        <div>
                          <p>Total spent</p>
                          <strong>{currency.format(customer.totalSpent)}</strong>
                        </div>
                        <div>
                          <p>Orders</p>
                          <strong>{customer.totalOrders}</strong>
                        </div>
                        <div>
                          <p>Predicted LTV</p>
                          <strong>{currency.format(customer.predictedLtv)}</strong>
                        </div>
                        <div>
                          <p>AOV</p>
                          <strong>{currency.format(customer.averageOrderValue)}</strong>
                        </div>
                      </div>
                      <div className="ca-muted">
                        <Text as="p">Last order: {lastOrderText}</Text>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Layout.Section>
        </Layout>
      </Page>
    </AppShell>
  );
}
