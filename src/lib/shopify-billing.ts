import { env, requiredEnv } from "@/lib/env";

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

async function shopifyAdminGraphQL<T>(input: {
  shop: string;
  accessToken: string;
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  const response = await fetch(
    `https://${input.shop}/admin/api/2025-01/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": input.accessToken,
      },
      body: JSON.stringify({
        query: input.query,
        variables: input.variables,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Shopify GraphQL request failed: ${response.status}`);
  }

  const payload = (await response.json()) as GraphQLResponse<T>;

  if (payload.errors && payload.errors.length > 0) {
    throw new Error(payload.errors.map((error) => error.message).join(", "));
  }

  if (!payload.data) {
    throw new Error("Shopify GraphQL response missing data.");
  }

  return payload.data;
}

export async function createProSubscription(input: {
  shop: string;
  accessToken: string;
}): Promise<{ confirmationUrl: string; subscriptionId: string }> {
  const mutation = `
    mutation appSubscriptionCreate(
      $name: String!
      $lineItems: [AppSubscriptionLineItemInput!]!
      $returnUrl: URL!
      $test: Boolean
      $trialDays: Int
    ) {
      appSubscriptionCreate(
        name: $name
        returnUrl: $returnUrl
        lineItems: $lineItems
        test: $test
        trialDays: $trialDays
      ) {
        confirmationUrl
        appSubscription {
          id
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const returnUrl = new URL("/api/billing/confirm", requiredEnv("SHOPIFY_APP_URL"));
  returnUrl.searchParams.set("shop", input.shop);

  const trialDaysParsed = Number.parseInt(env.SHOPIFY_BILLING_TRIAL_DAYS, 10);
  const trialDays = Number.isFinite(trialDaysParsed) && trialDaysParsed > 0
    ? trialDaysParsed
    : 0;

  const data = await shopifyAdminGraphQL<{
    appSubscriptionCreate: {
      confirmationUrl: string | null;
      appSubscription: { id: string; status: string } | null;
      userErrors: Array<{ message: string }>;
    };
  }>({
    shop: input.shop,
    accessToken: input.accessToken,
    query: mutation,
    variables: {
      name: env.SHOPIFY_BILLING_PRO_PLAN_NAME,
      returnUrl: returnUrl.toString(),
      trialDays,
      test: process.env.NODE_ENV !== "production",
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              price: {
                amount: env.SHOPIFY_BILLING_PRO_PLAN_PRICE,
                currencyCode: env.SHOPIFY_BILLING_PRO_PLAN_CURRENCY,
              },
            },
          },
        },
      ],
    },
  });

  const userErrors = data.appSubscriptionCreate.userErrors ?? [];
  if (userErrors.length > 0) {
    throw new Error(userErrors.map((error) => error.message).join(", "));
  }

  const confirmationUrl = data.appSubscriptionCreate.confirmationUrl;
  const subscriptionId = data.appSubscriptionCreate.appSubscription?.id;

  if (!confirmationUrl || !subscriptionId) {
    throw new Error("Shopify did not return a valid billing confirmation URL.");
  }

  return { confirmationUrl, subscriptionId };
}

export async function getActiveSubscriptions(input: {
  shop: string;
  accessToken: string;
}): Promise<Array<{ id: string; status: string; name: string }>> {
  const query = `
    query {
      currentAppInstallation {
        activeSubscriptions {
          id
          name
          status
        }
      }
    }
  `;

  const data = await shopifyAdminGraphQL<{
    currentAppInstallation: {
      activeSubscriptions: Array<{ id: string; status: string; name: string }>;
    } | null;
  }>({
    shop: input.shop,
    accessToken: input.accessToken,
    query,
  });

  return data.currentAppInstallation?.activeSubscriptions ?? [];
}

export async function cancelSubscription(input: {
  shop: string;
  accessToken: string;
  subscriptionId: string;
}): Promise<void> {
  const mutation = `
    mutation AppSubscriptionCancel($id: ID!, $prorate: Boolean) {
      appSubscriptionCancel(id: $id, prorate: $prorate) {
        appSubscription {
          id
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyAdminGraphQL<{
    appSubscriptionCancel: {
      userErrors: Array<{ message: string }>;
    };
  }>({
    shop: input.shop,
    accessToken: input.accessToken,
    query: mutation,
    variables: {
      id: input.subscriptionId,
      prorate: false,
    },
  });

  const userErrors = data.appSubscriptionCancel.userErrors ?? [];
  if (userErrors.length > 0) {
    throw new Error(userErrors.map((error) => error.message).join(", "));
  }
}
