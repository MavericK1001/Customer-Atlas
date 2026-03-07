import crypto from "crypto";
import { env, requiredEnv } from "@/lib/env";

export function buildShopifyInstallUrl(shop: string, state: string): string {
  const redirectUri = `${requiredEnv("SHOPIFY_APP_URL")}/api/auth/callback`;
  const params = new URLSearchParams({
    client_id: requiredEnv("SHOPIFY_API_KEY"),
    scope: env.SHOPIFY_SCOPES,
    redirect_uri: redirectUri,
    state,
  });

  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}

export async function exchangeShopifyCodeForToken(input: {
  shop: string;
  code: string;
}): Promise<string> {
  const response = await fetch(`https://${input.shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: requiredEnv("SHOPIFY_API_KEY"),
      client_secret: requiredEnv("SHOPIFY_API_SECRET"),
      code: input.code,
    }),
  });

  if (!response.ok) {
    throw new Error(`OAuth token exchange failed: ${response.status}`);
  }

  const data = (await response.json()) as { access_token?: string };

  if (!data.access_token) {
    throw new Error("Missing access token in OAuth response.");
  }

  return data.access_token;
}

export function verifyShopifyOAuthCallback(queryParams: URLSearchParams): boolean {
  const hmac = queryParams.get("hmac");

  if (!hmac) {
    return false;
  }

  const message = [...queryParams.entries()]
    .filter(([key]) => key !== "hmac" && key !== "signature")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const digest = crypto
    .createHmac("sha256", requiredEnv("SHOPIFY_API_SECRET"))
    .update(message)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
}

export function verifyShopifyWebhookHmac(payload: string, hmacHeader: string): boolean {
  const computed = crypto
    .createHmac("sha256", requiredEnv("SHOPIFY_API_SECRET"))
    .update(payload, "utf8")
    .digest("base64");

  const provided = Buffer.from(hmacHeader);
  const expected = Buffer.from(computed);

  if (provided.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(provided, expected);
}

export async function registerWebhookSubscription(input: {
  shop: string;
  accessToken: string;
  topic: "orders/create" | "orders/updated" | "customers/create" | "customers/update";
}): Promise<void> {
  const endpoint = `${requiredEnv("SHOPIFY_APP_URL")}/api/webhooks/shopify`;

  const mutation = `
    mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $callbackUrl: URL!) {
      webhookSubscriptionCreate(topic: $topic, webhookSubscription: {callbackUrl: $callbackUrl, format: JSON}) {
        userErrors {
          field
          message
        }
      }
    }
  `;

  const topicMap: Record<string, string> = {
    "orders/create": "ORDERS_CREATE",
    "orders/updated": "ORDERS_UPDATED",
    "customers/create": "CUSTOMERS_CREATE",
    "customers/update": "CUSTOMERS_UPDATE",
  };

  const response = await fetch(`https://${input.shop}/admin/api/2025-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": input.accessToken,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        topic: topicMap[input.topic],
        callbackUrl: endpoint,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Webhook subscription failed for ${input.topic}.`);
  }

  const json = (await response.json()) as {
    data?: { webhookSubscriptionCreate?: { userErrors?: Array<{ message: string }> } };
  };

  const errors = json.data?.webhookSubscriptionCreate?.userErrors ?? [];
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join(", "));
  }
}
