# CustomerAtlas

CustomerAtlas is a Shopify embedded app built with Next.js, Prisma, and PostgreSQL.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Generate Prisma client and run local migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start the app:

```bash
npm run dev
```

5. Optional: run queue worker in a second terminal when using Redis:

```bash
npm run worker
```

## Production Build

1. Set all required environment variables (see `.env.example`).
2. Apply production migrations:

```bash
npx prisma migrate deploy
```

3. Validate and compile:

```bash
npm run lint
npm run build
```

4. Start production server:

```bash
npm run start
```

## Shopify Production Setup

1. Configure a stable HTTPS app URL (for example `https://customeratlas.app`).
2. Set Shopify app settings:
- App URL: `https://customeratlas.app`
- Redirect URL: `https://customeratlas.app/api/auth/callback`
3. Ensure app distribution is set to Public before using Shopify Billing API.
4. Configure reconcile cron to call:
- `POST /api/billing/reconcile`
- Header: `x-billing-reconcile-secret: <BILLING_RECONCILE_SECRET>`

## Verification Checklist

1. `npm run lint` and `npm run build` pass.
2. Install flow works from `/install`.
3. Webhooks are received at `/api/webhooks/shopify`.
4. Billing upgrade and confirmation redirect work.
5. Reconcile endpoint reports expected `reconciledCount`.
