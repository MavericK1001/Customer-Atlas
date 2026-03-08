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

function buildOAuthMessage(rawSearch: string): { hmac: string | null; message: string } {
  const source = rawSearch.startsWith("?") ? rawSearch.slice(1) : rawSearch;
  const pairs = source
    .split("&")
    .filter((segment) => segment.length > 0)
    .map((segment) => {
      const separatorIndex = segment.indexOf("=");
      if (separatorIndex === -1) {
        return { key: segment, value: "" };
      }

      return {
        key: segment.slice(0, separatorIndex),
        value: segment.slice(separatorIndex + 1),
      };
    });

  const hmacPair = pairs.find((pair) => pair.key === "hmac");
  const message = pairs
    .filter((pair) => pair.key !== "hmac" && pair.key !== "signature")
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((pair) => `${pair.key}=${pair.value}`)
    .join("&");

  return {
    hmac: hmacPair?.value ?? null,
    message,
  };
}

export function verifyShopifyOAuthCallback(rawSearch: string): boolean {
  const { hmac, message } = buildOAuthMessage(rawSearch);

  if (!hmac) {
    return false;
  }

  const digest = crypto
    .createHmac("sha256", requiredEnv("SHOPIFY_API_SECRET"))
    .update(message)
    .digest("hex");

  const provided = Buffer.from(hmac, "utf8");
  const expected = Buffer.from(digest, "utf8");
  if (provided.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, provided);
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
  topic:
    | "orders/create"
    | "orders/updated"
    | "customers/create"
    | "customers/update"
    | "app_subscriptions/update"
    | "customers/data_request"
    | "customers/redact"
    | "shop/redact";
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
    "app_subscriptions/update": "APP_SUBSCRIPTIONS_UPDATE",
    "customers/data_request": "CUSTOMERS_DATA_REQUEST",
    "customers/redact": "CUSTOMERS_REDACT",
    "shop/redact": "SHOP_REDACT",
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
