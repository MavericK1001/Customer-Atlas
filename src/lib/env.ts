export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET,
  APP_SESSION_SECRET: process.env.APP_SESSION_SECRET,
  SHOPIFY_SCOPES: process.env.SHOPIFY_SCOPES ?? "read_customers,read_orders",
  SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL,
  SHOPIFY_BILLING_PRO_PLAN_NAME:
    process.env.SHOPIFY_BILLING_PRO_PLAN_NAME ?? "CustomerAtlas Pro",
  SHOPIFY_BILLING_PRO_PLAN_PRICE:
    process.env.SHOPIFY_BILLING_PRO_PLAN_PRICE ?? "29.00",
  SHOPIFY_BILLING_PRO_PLAN_CURRENCY:
    process.env.SHOPIFY_BILLING_PRO_PLAN_CURRENCY ?? "USD",
  SHOPIFY_BILLING_TRIAL_DAYS:
    process.env.SHOPIFY_BILLING_TRIAL_DAYS ?? "14",
  BILLING_RECONCILE_SECRET: process.env.BILLING_RECONCILE_SECRET,
  AFFILIATE_PAYOUT_AUTOMATION_SECRET: process.env.AFFILIATE_PAYOUT_AUTOMATION_SECRET,
  ACCOUNT_AUTH_BASE_URL: process.env.ACCOUNT_AUTH_BASE_URL,
  EXTERNAL_ACCOUNT_AUTH_ENABLED:
    process.env.EXTERNAL_ACCOUNT_AUTH_ENABLED ??
    process.env.NEXT_PUBLIC_EXTERNAL_ACCOUNT_AUTH_ENABLED ??
    "true",
  REDIS_URL: process.env.REDIS_URL,
};

export function requiredEnv(name: keyof typeof env): string {
  const value = env[name];

  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
