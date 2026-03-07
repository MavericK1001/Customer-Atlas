export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET,
  APP_SESSION_SECRET: process.env.APP_SESSION_SECRET,
  SHOPIFY_SCOPES: process.env.SHOPIFY_SCOPES ?? "read_customers,read_orders",
  SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL,
  REDIS_URL: process.env.REDIS_URL,
};

export function requiredEnv(name: keyof typeof env): string {
  const value = env[name];

  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
