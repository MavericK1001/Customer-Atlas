import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  faqs,
  headlineStats,
  platformModules,
  pricingPlans,
  productLayers,
  proofRibbonItems,
  testimonials,
  useCases,
} from "@/components/marketing/marketing-data";
import {
  MarketingFooter,
  MarketingHeader,
  MarketingPageFrame,
} from "@/components/marketing/MarketingChrome";

export const metadata: Metadata = {
  title: "CustomerAtlas | Shopify Revenue Intelligence",
  description:
    "CustomerAtlas gives Shopify teams one premium operating layer for customer intelligence, segments, affiliate workflows, and revenue priorities.",
};

export default function HomePage() {
  return (
    <MarketingPageFrame>
      <div className="relative isolate overflow-hidden">
        <div
          className="ca-marketing-orb ca-marketing-orb-top"
          aria-hidden="true"
        />
        <div
          className="ca-marketing-orb ca-marketing-orb-left"
          aria-hidden="true"
        />
        <MarketingHeader />

        <section className="px-4 pb-10 pt-8 sm:px-6 lg:px-8">
          <div
            className="ca-marketing-shell grid gap-10 lg:grid-cols-[1.02fr_0.98fr]"
            id="main-content"
          >
            <div className="grid gap-6 self-center" data-reveal>
              <div className="flex flex-wrap gap-2">
                <span className="ca-eyebrow">Shopify Revenue Intelligence</span>
                <span className="ca-eyebrow ca-eyebrow-muted">
                  Full-stack signal to action
                </span>
              </div>

              <div className="grid gap-4">
                <h1 className="max-w-[11ch] text-[clamp(3rem,7vw,6.2rem)] font-bold leading-[0.94] tracking-[-0.06em] text-[#081b36]">
                  The premium operating layer for customer growth.
                </h1>
                <p className="max-w-[60ch] text-lg leading-8 text-[#475f7d]">
                  CustomerAtlas unifies revenue priorities, customer value,
                  segmentation, and affiliate workflows so Shopify teams can act
                  faster with better signal and less tool sprawl.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link href="/install" className="ca-button-primary">
                  Install on Shopify
                </Link>
                <Link href="/product" className="ca-button-secondary">
                  Explore the product
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {headlineStats.map((item) => (
                  <article key={item.label} className="ca-stat-card">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </article>
                ))}
              </div>
            </div>

            <div className="relative" data-reveal>
              <div className="ca-hero-panel">
                <div className="ca-hero-panel-top">
                  <div>
                    <p className="ca-hero-panel-kicker">Live command center</p>
                    <h2 className="ca-hero-panel-title">
                      northstar-goods-lab.myshopify.com
                    </h2>
                  </div>
                  <span className="ca-status-pill">healthy sync</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <article className="ca-panel-card">
                    <span>Predicted LTV</span>
                    <strong>$186 avg</strong>
                    <p>Modeled from live customer and order history.</p>
                  </article>
                  <article className="ca-panel-card">
                    <span>Today&apos;s priority</span>
                    <strong>Win back churn risk</strong>
                    <p>642 profiles mapped to the next retention motion.</p>
                  </article>
                  <article className="ca-panel-card">
                    <span>Segment velocity</span>
                    <strong>3 exports ready</strong>
                    <p>
                      VIP, one-time buyers, and high-intent shoppers queued.
                    </p>
                  </article>
                  <article className="ca-panel-card">
                    <span>Affiliate operations</span>
                    <strong>12 payouts in review</strong>
                    <p>
                      Applications, links, keys, and monthly workflows aligned.
                    </p>
                  </article>
                </div>

                <div className="ca-surface-card overflow-hidden rounded-[24px] border border-white/10 bg-[#081c38] p-3">
                  <Image
                    src="/images/landing/app-screenshot.svg"
                    alt="CustomerAtlas dashboard preview"
                    width={1400}
                    height={880}
                    priority
                    unoptimized
                    className="h-auto w-full rounded-[18px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-6 sm:px-6 lg:px-8" data-reveal>
          <div className="ca-marketing-shell ca-marketing-band">
            <div className="ca-marquee">
              <div className="ca-marquee-track">
                {[...proofRibbonItems, ...proofRibbonItems].map(
                  (item, index) => (
                    <span key={`${item}-${index}`} className="ca-ribbon-pill">
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6 lg:px-8" id="platform">
          <div className="ca-marketing-shell grid gap-12">
            <div className="max-w-[58rem]" data-reveal>
              <span className="ca-eyebrow">Platform</span>
              <h2 className="mt-5 text-[clamp(2rem,4vw,3.8rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[#081b36]">
                Structured like the best ecommerce SaaS sites: narrative first,
                product proof immediately after.
              </h2>
              <p className="mt-5 max-w-[60ch] text-lg leading-8 text-[#506684]">
                The market leaders in this category use full-width storytelling,
                high-signal product surfaces, and a tight color system. This
                redesign follows that pattern while staying specific to what
                CustomerAtlas actually ships.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {platformModules.map((module) => (
                <article
                  key={module.title}
                  className="ca-surface-card"
                  data-reveal
                >
                  <span className="ca-card-eyebrow">{module.eyebrow}</span>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#0b2143]">
                    {module.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-[#5a708d]">
                    {module.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ca-dark-section px-4 py-24 sm:px-6 lg:px-8">
          <div className="ca-marketing-shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="grid gap-5" data-reveal>
              <span className="ca-eyebrow ca-eyebrow-dark">
                Operating model
              </span>
              <h2 className="text-[clamp(2rem,4vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.05em] text-white">
                From raw Shopify activity to an action your team can justify.
              </h2>
              <p className="max-w-[48ch] text-lg leading-8 text-white/72">
                What premium commerce sites do well is explain the system, not
                just list features. CustomerAtlas follows the same logic by
                showing how data becomes a next move.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {productLayers.map((layer, index) => (
                <article key={layer.title} className="ca-dark-card" data-reveal>
                  <span className="ca-dark-card-index">0{index + 1}</span>
                  <h3>{layer.title}</h3>
                  <p>{layer.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6 lg:px-8" id="proof">
          <div className="ca-marketing-shell grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-6" data-reveal>
              <span className="ca-eyebrow">Product proof</span>
              <h2 className="text-[clamp(2rem,4vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[#081b36]">
                A full-width product story, not a stack of generic boxes.
              </h2>
              <p className="max-w-[58ch] text-lg leading-8 text-[#506684]">
                The screenshot area is treated like a premium hero surface, with
                supporting context about what operators actually do in the app:
                prioritize revenue, build segments, manage affiliates, and keep
                the system healthy.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {useCases.map((item) => (
                  <article
                    key={item.title}
                    className="ca-surface-card ca-surface-card-tight"
                  >
                    <span className="ca-card-eyebrow">{item.role}</span>
                    <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#0b2143]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-[#5a708d]">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="grid gap-4" data-reveal>
              <div className="ca-screenshot-stage">
                <Image
                  src="/images/landing/app-screenshot.svg"
                  alt="CustomerAtlas workspace screenshot"
                  width={1400}
                  height={880}
                  unoptimized
                  className="h-auto w-full rounded-[24px]"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <article className="ca-metric-tile">
                  <strong>Priority queue</strong>
                  <span>Revenue-ranked actions for today.</span>
                </article>
                <article className="ca-metric-tile">
                  <strong>Segment studio</strong>
                  <span>Clear logic with live count preview.</span>
                </article>
                <article className="ca-metric-tile">
                  <strong>Partner ops</strong>
                  <span>Applications, links, and payout review.</span>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="ca-marketing-shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-5" data-reveal>
              <span className="ca-eyebrow">Pricing</span>
              <h2 className="text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[#081b36]">
                Keep the homepage focused, then let pricing earn its own page.
              </h2>
              <p className="max-w-[52ch] text-lg leading-8 text-[#506684]">
                Premium SaaS sites rarely force every buyer decision into one
                scroll. CustomerAtlas now gives pricing a dedicated route, while
                this page stays focused on value, product, and proof.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/pricing" className="ca-button-primary">
                  View pricing
                </Link>
                <Link href="/docs" className="ca-button-secondary">
                  Read docs
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {pricingPlans.map((plan) => (
                <article
                  key={plan.name}
                  className={`ca-pricing-preview-card ${
                    plan.featured ? "ca-pricing-preview-card-featured" : ""
                  }`}
                  data-reveal
                >
                  {plan.featured ? (
                    <span className="ca-featured-badge">Most popular</span>
                  ) : null}
                  <h3>{plan.name}</h3>
                  <p className="ca-price-inline">
                    {plan.price}
                    <span>{plan.cadence}</span>
                  </p>
                  <p className="text-sm leading-7 text-[#607491]">
                    {plan.summary}
                  </p>
                  <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#203e65]">
                    {plan.features.map((feature) => (
                      <li key={feature} className="ca-list-check">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ca-dark-section px-4 py-24 sm:px-6 lg:px-8">
          <div className="ca-marketing-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="grid gap-5" data-reveal>
              <span className="ca-eyebrow ca-eyebrow-dark">
                Operator feedback
              </span>
              <h2 className="text-[clamp(2rem,4vw,3.3rem)] font-bold leading-[1] tracking-[-0.05em] text-white">
                Premium look, but still grounded in product reality.
              </h2>
              <p className="max-w-[48ch] text-lg leading-8 text-white/72">
                The visual treatment is richer now, but the story stays tied to
                what the app actually supports today: insights, segments,
                automations, partner ops, and health monitoring.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {testimonials.map((item) => (
                <article
                  key={item.quote}
                  className="ca-dark-testimonial"
                  data-reveal
                >
                  <p>{item.quote}</p>
                  <strong>{item.author}</strong>
                  <span>{item.company}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="ca-marketing-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-5" data-reveal>
              <span className="ca-eyebrow">FAQ</span>
              <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1] tracking-[-0.05em] text-[#081b36]">
                Common questions from teams evaluating the stack.
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

        <section className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          <div className="ca-marketing-shell ca-cta-panel" data-reveal>
            <div>
              <span className="ca-eyebrow ca-eyebrow-dark">Start now</span>
              <h2 className="mt-4 text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[0.98] tracking-[-0.05em] text-white">
                Replace guesswork with a customer operating system that looks as
                serious as the work.
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/install" className="ca-button-primary">
                Install CustomerAtlas
              </Link>
              <Link href="/pricing" className="ca-button-dark-secondary">
                Review plans
              </Link>
            </div>
          </div>
        </section>

        <MarketingFooter />
      </div>
    </MarketingPageFrame>
  );
}
