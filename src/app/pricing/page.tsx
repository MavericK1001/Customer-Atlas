import type { Metadata } from "next";
import Link from "next/link";
import {
  faqs,
  pricingPlans,
  pricingRows,
} from "@/components/marketing/marketing-data";
import {
  MarketingFooter,
  MarketingHeader,
  MarketingPageFrame,
} from "@/components/marketing/MarketingChrome";

export const metadata: Metadata = {
  title: "Pricing | CustomerAtlas",
  description:
    "See CustomerAtlas pricing for Starter and Pro plans, plus feature comparison and rollout guidance.",
};

function renderCheck(value: boolean): string {
  return value ? "Included" : "Not included";
}

export default function PricingPage() {
  return (
    <MarketingPageFrame>
      <div className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#fbfcff_0%,#eef4ff_52%,#ffffff_100%)]">
        <div
          className="ca-marketing-orb ca-marketing-orb-top"
          aria-hidden="true"
        />
        <div
          className="ca-marketing-orb ca-marketing-orb-right"
          aria-hidden="true"
        />
        <MarketingHeader />

        <section className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="ca-marketing-shell grid gap-8" id="main-content">
            <div className="max-w-[58rem] grid gap-5" data-reveal>
              <span className="ca-eyebrow">Pricing</span>
              <h1 className="max-w-[10ch] text-[clamp(3rem,6vw,5.2rem)] font-bold leading-[0.95] tracking-[-0.06em] text-[#081b36]">
                Simple plans, premium product surface.
              </h1>
              <p className="max-w-[58ch] text-lg leading-8 text-[#506684]">
                Dedicated pricing pages in this market are usually clean,
                structured, and confidence-building. This one is designed the
                same way: tight plan story, feature comparison, and rollout
                clarity.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.15fr_1.15fr_0.7fr]">
              {pricingPlans.map((plan) => (
                <article
                  key={plan.name}
                  className={`ca-pricing-preview-card min-h-full ${
                    plan.featured ? "ca-pricing-preview-card-featured" : ""
                  }`}
                  data-reveal
                >
                  {plan.featured ? (
                    <span className="ca-featured-badge">Recommended</span>
                  ) : null}
                  <h2>{plan.name}</h2>
                  <p className="ca-price-inline">
                    {plan.price}
                    <span>{plan.cadence}</span>
                  </p>
                  <p className="text-sm leading-7 text-[#607491]">
                    {plan.summary}
                  </p>
                  <ul className="mt-5 grid gap-3 text-sm leading-6 text-[#203e65]">
                    {plan.features.map((feature) => (
                      <li key={feature} className="ca-list-check">
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Link
                      href="/install"
                      className={
                        plan.featured
                          ? "ca-button-primary"
                          : "ca-button-secondary"
                      }
                    >
                      {plan.featured ? "Upgrade to Pro" : "Start free"}
                    </Link>
                  </div>
                </article>
              ))}

              <aside
                className="ca-surface-card bg-[linear-gradient(180deg,#0a1d39,#0f2d58)] text-white"
                data-reveal
              >
                <span className="ca-eyebrow ca-eyebrow-dark">Rollout</span>
                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
                  Need help onboarding the team?
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/72">
                  For multi-store setups, internal enablement, or a more guided
                  rollout, start with Pro and pair it with your implementation
                  workflow.
                </p>
                <div className="mt-6 grid gap-3 text-sm text-white/86">
                  <div className="rounded-[20px] border border-white/12 bg-white/8 px-4 py-3">
                    Priority setup path
                  </div>
                  <div className="rounded-[20px] border border-white/12 bg-white/8 px-4 py-3">
                    Billing and sync guidance
                  </div>
                  <div className="rounded-[20px] border border-white/12 bg-white/8 px-4 py-3">
                    Team handoff docs
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="ca-marketing-shell grid gap-8">
            <div className="max-w-[48rem]" data-reveal>
              <span className="ca-eyebrow">Compare plans</span>
              <h2 className="mt-5 text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[#081b36]">
                What changes between Starter and Pro.
              </h2>
            </div>

            <div
              className="overflow-hidden rounded-[32px] border border-[#0f345910] bg-white shadow-[0_30px_90px_rgba(7,20,44,0.08)]"
              data-reveal
            >
              <table className="ca-pricing-table">
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th>Starter</th>
                    <th>Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingRows.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td>{renderCheck(row.starter)}</td>
                      <td>{renderCheck(row.pro)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="ca-dark-section px-4 py-24 sm:px-6 lg:px-8">
          <div className="ca-marketing-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-5" data-reveal>
              <span className="ca-eyebrow ca-eyebrow-dark">
                Why teams upgrade
              </span>
              <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1] tracking-[-0.05em] text-white">
                Pro is where CustomerAtlas becomes a real operating system.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <article className="ca-dark-card" data-reveal>
                <span className="ca-dark-card-index">01</span>
                <h3>Segments</h3>
                <p>Create and export audiences instead of just reading them.</p>
              </article>
              <article className="ca-dark-card" data-reveal>
                <span className="ca-dark-card-index">02</span>
                <h3>Partner ops</h3>
                <p>
                  Manage affiliate applications, keys, payouts, and reviews.
                </p>
              </article>
              <article className="ca-dark-card" data-reveal>
                <span className="ca-dark-card-index">03</span>
                <h3>Workflow speed</h3>
                <p>
                  Turn insight into action without leaving the product surface.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="ca-marketing-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-5" data-reveal>
              <span className="ca-eyebrow">FAQ</span>
              <h2 className="text-[clamp(2rem,4vw,3.1rem)] font-bold leading-[1] tracking-[-0.05em] text-[#081b36]">
                Pricing questions buyers usually ask.
              </h2>
            </div>

            <div className="grid gap-3" data-reveal>
              {faqs.map((item, index) => (
                <details
                  key={item.question}
                  className="ca-faq-card"
                  open={index === 0}
                >
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-8 pt-2 sm:px-6 lg:px-8">
          <div className="ca-marketing-shell ca-cta-panel" data-reveal>
            <div>
              <span className="ca-eyebrow ca-eyebrow-dark">
                Choose your plan
              </span>
              <h2 className="mt-4 text-[clamp(2rem,4vw,3.3rem)] font-bold leading-[1] tracking-[-0.05em] text-white">
                Start free, then unlock the workflows that make the system sing.
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/install" className="ca-button-primary">
                Start with Starter
              </Link>
              <Link href="/product" className="ca-button-dark-secondary">
                Explore product
              </Link>
            </div>
          </div>
        </section>

        <MarketingFooter />
      </div>
    </MarketingPageFrame>
  );
}
