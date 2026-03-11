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

## Affiliate Payout Automation

Use the payout automation endpoint to generate `calculated` affiliate payouts for a date range.

1. Set secret env var in production:

- `AFFILIATE_PAYOUT_AUTOMATION_SECRET=<long-random-secret>`

2. Schedule a cron job to call:

- `POST /api/admin/affiliate-payouts/automation`
- Header: `x-affiliate-payout-secret: <AFFILIATE_PAYOUT_AUTOMATION_SECRET>`
- JSON body fields:
	- `periodStart` (ISO datetime)
	- `periodEnd` (ISO datetime)
	- `minAmountUsd` (optional, default `10`)
	- `dryRun` (optional, default `false`)

Example dry run for previous month:

```bash
curl -X POST "https://customeratlas.app/api/admin/affiliate-payouts/automation" \
	-H "Content-Type: application/json" \
	-H "x-affiliate-payout-secret: $AFFILIATE_PAYOUT_AUTOMATION_SECRET" \
	-d '{
		"periodStart": "2026-02-01T00:00:00.000Z",
		"periodEnd": "2026-02-28T23:59:59.999Z",
		"minAmountUsd": 10,
		"dryRun": true
	}'
```

Example create run:

```bash
curl -X POST "https://customeratlas.app/api/admin/affiliate-payouts/automation" \
	-H "Content-Type: application/json" \
	-H "x-affiliate-payout-secret: $AFFILIATE_PAYOUT_AUTOMATION_SECRET" \
	-d '{
		"periodStart": "2026-02-01T00:00:00.000Z",
		"periodEnd": "2026-02-28T23:59:59.999Z",
		"minAmountUsd": 10,
		"dryRun": false
	}'
```

Recommended schedule:

- Run monthly on the 1st at 00:10 UTC with `dryRun: true` and alert on anomalies.
- Run monthly on the 1st at 00:20 UTC with `dryRun: false` after dry-run review.

## Verification Checklist

1. `npm run lint` and `npm run build` pass.
2. Install flow works from `/install`.
3. Webhooks are received at `/api/webhooks/shopify`.
4. Billing upgrade and confirmation redirect work.
5. Reconcile endpoint reports expected `reconciledCount`.
