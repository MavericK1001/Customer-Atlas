import type { Metadata } from "next";
import Link from "next/link";
import {
  MarketingFooter,
  MarketingHeader,
  MarketingPageFrame,
} from "@/components/marketing/MarketingChrome";

export const metadata: Metadata = {
  title: "Docs | CustomerAtlas",
  description:
    "Documentation for installing, validating, and operating CustomerAtlas in production.",
};

export default function DocsPage() {
  return (
    <MarketingPageFrame>
      <div className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#fbfcff_0%,#f0f5ff_48%,#ffffff_100%)]">
        <div
          className="ca-marketing-orb ca-marketing-orb-top"
          aria-hidden="true"
        />
        <MarketingHeader />

        <section className="px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div
            className="ca-marketing-shell grid gap-5"
            id="main-content"
            data-reveal
          >
            <span className="ca-eyebrow">Documentation</span>
            <h1 className="max-w-[10ch] text-[clamp(3rem,6vw,5.1rem)] font-bold leading-[0.95] tracking-[-0.06em] text-[#081b36]">
              Install quickly. Operate cleanly.
            </h1>
            <p className="max-w-[58ch] text-lg leading-8 text-[#506684]">
              Public docs should feel like part of the same premium site. This
              page keeps the information dense, but the presentation consistent
              with the new marketing surface.
            </p>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="ca-marketing-shell grid gap-4 lg:grid-cols-3">
            <article
              className="ca-surface-card"
              id="getting-started"
              data-reveal
            >
              <span className="ca-card-eyebrow">Getting started</span>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#0b2143]">
                Setup path
              </h2>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#203e65]">
                <li className="ca-list-check">
                  Install the app and authenticate your Shopify store
                </li>
                <li className="ca-list-check">
                  Run the first sync to populate dashboards
                </li>
                <li className="ca-list-check">
                  Confirm billing state and sync health in Settings
                </li>
              </ul>
            </article>

            <article className="ca-surface-card" id="features" data-reveal>
              <span className="ca-card-eyebrow">Core features</span>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#0b2143]">
                What ships today
              </h2>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#203e65]">
                <li className="ca-list-check">
                  Dashboard with priorities and revenue opportunities
                </li>
                <li className="ca-list-check">
                  Customers portfolio with value-based filters
                </li>
                <li className="ca-list-check">
                  Segment builder with preview and export
                </li>
                <li className="ca-list-check">
                  Affiliate, payout, and sync health workflows
                </li>
              </ul>
            </article>

            <article className="ca-surface-card" id="guides" data-reveal>
              <span className="ca-card-eyebrow">Validation</span>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#0b2143]">
                Build checks
              </h2>
              <div className="mt-4 rounded-[22px] border border-[#0c4da31a] bg-[linear-gradient(180deg,#f9fbff,#eef5ff)] p-4">
                <pre className="overflow-x-auto text-sm leading-7 text-[#183b63]">{`npm install\nnpm run dev\n\nnpm run lint\nnpm run build`}</pre>
              </div>
            </article>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="ca-marketing-shell grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="ca-surface-card" data-reveal>
              <span className="ca-card-eyebrow">Reference</span>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#0b2143]">
                Production checklist
              </h2>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#203e65]">
                <li className="ca-list-check">
                  Set the Shopify app URL and callback domain correctly
                </li>
                <li className="ca-list-check">
                  Run database migrations during release
                </li>
                <li className="ca-list-check">
                  Confirm webhook registration after deploy
                </li>
                <li className="ca-list-check">
                  Validate billing upgrade and redirect flow
                </li>
                <li className="ca-list-check">
                  Review affiliate payout automation schedule and secret
                  configuration
                </li>
              </ul>
            </article>

            <article className="ca-surface-card" id="faq" data-reveal>
              <span className="ca-card-eyebrow">Quick links</span>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#0b2143]">
                Useful routes
              </h2>
              <div className="mt-4 grid gap-3 text-sm">
                <Link href="/product" className="ca-footer-link">
                  Product overview
                </Link>
                <Link href="/pricing" className="ca-footer-link">
                  Pricing
                </Link>
                <Link href="/install" className="ca-footer-link">
                  Install flow
                </Link>
                <Link href="/dashboard" className="ca-footer-link">
                  Dashboard
                </Link>
              </div>
            </article>
          </div>
        </section>

        <MarketingFooter />
      </div>
    </MarketingPageFrame>
  );
}
