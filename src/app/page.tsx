import Link from "next/link";
import Image from "next/image";
import { BrandMark } from "@/components/brand/BrandMark";
import { LandingScrollSystem } from "@/components/landing/LandingScrollSystem";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 pb-16 pt-5">
      <LandingScrollSystem />
      <div className="ca-scroll-progress" aria-hidden="true" />

      <a href="#hero" className="ca-skip-link">
        Skip to main content
      </a>

      <header
        className="sticky top-3 z-20 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#0b316617] bg-white/95 px-4 py-3 shadow-[0_18px_36px_rgba(8,30,69,0.09)] backdrop-blur"
        data-reveal
      >
        <Link href="/" className="no-underline">
          <BrandMark subtitle="Revenue Intelligence for Shopify" size={34} />
        </Link>
        <nav className="flex flex-wrap items-center gap-2" aria-label="Primary">
          <a
            className="rounded-full px-3 py-2 text-sm font-semibold text-[#153a72] transition hover:bg-[#124a951c]"
            href="#models"
          >
            Models
          </a>
          <a
            className="rounded-full px-3 py-2 text-sm font-semibold text-[#153a72] transition hover:bg-[#124a951c]"
            href="#showcase"
          >
            Showcase
          </a>
          <a
            className="rounded-full px-3 py-2 text-sm font-semibold text-[#153a72] transition hover:bg-[#124a951c]"
            href="#pricing"
          >
            Pricing
          </a>
          <a
            className="rounded-full px-3 py-2 text-sm font-semibold text-[#153a72] transition hover:bg-[#124a951c]"
            href="#faq"
          >
            FAQ
          </a>
          <a
            className="rounded-full px-3 py-2 text-sm font-semibold text-[#153a72] transition hover:bg-[#124a951c]"
            href="#contact"
          >
            Contact
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full border border-[#0d3c772f] bg-white px-3 py-2 text-sm font-semibold text-[#123b74] no-underline"
          >
            Sign in
          </Link>
          <Link
            href="/install"
            className="rounded-full bg-gradient-to-br from-[#0b3f84] to-[#0e2f62] px-4 py-2 text-sm font-semibold text-white no-underline shadow-[0_12px_24px_rgba(10,39,84,0.34)] transition hover:-translate-y-0.5"
          >
            Install app
          </Link>
        </div>
      </header>

      <section
        className="grid gap-4 rounded-3xl border border-[#0b2c621f] bg-gradient-to-br from-white to-[#f6faff] p-6 shadow-[0_22px_48px_rgba(8,35,76,0.12)] md:grid-cols-[1.2fr_0.8fr]"
        id="hero"
        aria-labelledby="hero-title"
        data-reveal
      >
        <div className="grid gap-3">
          <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-[#0d4a96]">
            CustomerAtlas Intelligence Stack
          </p>
          <h1
            className="m-0 max-w-[15ch] text-[clamp(2rem,4.4vw,3.35rem)] font-bold leading-[1] tracking-[-0.04em] text-[#081f43]"
            id="hero-title"
          >
            One command center for customer signals, growth decisions, and
            execution.
          </h1>
          <p className="m-0 max-w-[56ch] leading-relaxed text-[#304d73]">
            Built for Shopify teams that need fast, defensible actions. Analyze
            behavior, rank opportunities, and launch segmented campaigns from
            the same workspace.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[#0d3c7633] bg-white px-3 py-1 text-xs tracking-[0.05em] text-[#12345f]">
              Predictive customer models
            </span>
            <span className="rounded-full border border-[#0d3c7633] bg-white px-3 py-1 text-xs tracking-[0.05em] text-[#12345f]">
              Audience activation
            </span>
            <span className="rounded-full border border-[#0d3c7633] bg-white px-3 py-1 text-xs tracking-[0.05em] text-[#12345f]">
              Affiliate and payout controls
            </span>
          </div>
          <div
            className="grid gap-2 sm:grid-cols-3"
            aria-label="Performance proof points"
          >
            <article className="rounded-xl border border-[#0c386e29] bg-white px-3 py-2">
              <strong className="block text-base tracking-tight text-[#0b356d]">
                40%
              </strong>
              <span className="mt-1 block text-[0.68rem] uppercase tracking-[0.08em] text-[#45658e]">
                faster campaign planning
              </span>
            </article>
            <article className="rounded-xl border border-[#0c386e29] bg-white px-3 py-2">
              <strong className="block text-base tracking-tight text-[#0b356d]">
                $18.4k
              </strong>
              <span className="mt-1 block text-[0.68rem] uppercase tracking-[0.08em] text-[#45658e]">
                projected monthly lift
              </span>
            </article>
            <article className="rounded-xl border border-[#0c386e29] bg-white px-3 py-2">
              <strong className="block text-base tracking-tight text-[#0b356d]">
                99.95%
              </strong>
              <span className="mt-1 block text-[0.68rem] uppercase tracking-[0.08em] text-[#45658e]">
                automation uptime
              </span>
            </article>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/install"
              className="rounded-full bg-gradient-to-br from-[#0b3f84] to-[#0e2f62] px-4 py-2 text-sm font-semibold text-white no-underline shadow-[0_12px_24px_rgba(10,39,84,0.34)] transition hover:-translate-y-0.5"
            >
              Install on Shopify
            </Link>
            <Link
              href="/docs"
              className="rounded-full border border-[#0d396f47] bg-white px-4 py-2 text-sm font-semibold text-[#0d2f5b] no-underline transition hover:-translate-y-0.5"
            >
              Explore documentation
            </Link>
          </div>
        </div>

        <div className="relative grid gap-3 overflow-hidden rounded-2xl border border-[#0b326938] bg-[#0b2f63] p-4 text-[#e6f0ff]">
          <div className="absolute -right-8 -top-14 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(168,204,255,0.38),rgba(168,204,255,0))]" />
          <div className="flex items-center gap-3 rounded-xl border border-[#97c2ff4d] bg-[#0b2952cc] px-3 py-2">
            <BrandMark iconOnly size={74} />
            <div>
              <p className="m-0 text-[0.73rem] uppercase tracking-[0.07em] opacity-80">
                Live workspace
              </p>
              <strong className="mt-1 block text-sm tracking-tight">
                northstar-goods-lab.myshopify.com
              </strong>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-[#a0c7ff42] bg-[#09244aa6] p-2">
              <p className="m-0 text-[0.68rem] uppercase tracking-[0.08em] opacity-75">
                Churn-risk model
              </p>
              <strong className="mt-1 block">94.1% confidence</strong>
            </div>
            <div className="rounded-xl border border-[#a0c7ff42] bg-[#09244aa6] p-2">
              <p className="m-0 text-[0.68rem] uppercase tracking-[0.08em] opacity-75">
                Likely repeat buyers
              </p>
              <strong className="mt-1 block">1,248 profiles</strong>
            </div>
            <div className="rounded-xl border border-[#a0c7ff42] bg-[#09244aa6] p-2">
              <p className="m-0 text-[0.68rem] uppercase tracking-[0.08em] opacity-75">
                Projected lift
              </p>
              <strong className="mt-1 block">$18.4k / month</strong>
            </div>
            <div className="rounded-xl border border-[#a0c7ff42] bg-[#09244aa6] p-2">
              <p className="m-0 text-[0.68rem] uppercase tracking-[0.08em] opacity-75">
                Automation health
              </p>
              <strong className="mt-1 block">All systems ready</strong>
            </div>
          </div>
        </div>
      </section>

      <section
        className="ca-section ca-section-dark"
        id="models"
        aria-labelledby="models-title"
        data-reveal
      >
        <div className="ca-section-heading-wrap">
          <p className="ca-section-kicker">Rotating Models</p>
          <h2 id="models-title">
            Always-on model stream for high-signal decisions.
          </h2>
        </div>
        <div className="ca-model-rotator" aria-live="polite">
          <div className="ca-model-track">
            <article className="ca-model-card">
              <h3>Churn Prediction</h3>
              <p>Flags customers likely to drop off in the next 30 days.</p>
              <span>Refresh cadence: hourly</span>
            </article>
            <article className="ca-model-card">
              <h3>High-LTV Discovery</h3>
              <p>Finds profiles with underutilized repeat potential.</p>
              <span>Refresh cadence: every 2 hours</span>
            </article>
            <article className="ca-model-card">
              <h3>Offer Affinity</h3>
              <p>Ranks incentives by likelihood of conversion per segment.</p>
              <span>Refresh cadence: daily</span>
            </article>
            <article className="ca-model-card">
              <h3>Campaign Readiness</h3>
              <p>Scores whether a segment is ready for activation right now.</p>
              <span>Refresh cadence: every 30 minutes</span>
            </article>
            <article className="ca-model-card" aria-hidden="true">
              <h3>Churn Prediction</h3>
              <p>Flags customers likely to drop off in the next 30 days.</p>
              <span>Refresh cadence: hourly</span>
            </article>
            <article className="ca-model-card" aria-hidden="true">
              <h3>High-LTV Discovery</h3>
              <p>Finds profiles with underutilized repeat potential.</p>
              <span>Refresh cadence: every 2 hours</span>
            </article>
            <article className="ca-model-card" aria-hidden="true">
              <h3>Offer Affinity</h3>
              <p>Ranks incentives by likelihood of conversion per segment.</p>
              <span>Refresh cadence: daily</span>
            </article>
            <article className="ca-model-card" aria-hidden="true">
              <h3>Campaign Readiness</h3>
              <p>Scores whether a segment is ready for activation right now.</p>
              <span>Refresh cadence: every 30 minutes</span>
            </article>
          </div>
        </div>
        <div className="ca-model-meta" aria-hidden="true">
          <span className="ca-model-dot ca-model-dot-active" />
          <span className="ca-model-dot" />
          <span className="ca-model-dot" />
          <span className="ca-model-dot" />
        </div>
      </section>

      <section
        className="ca-section ca-section-showcase"
        id="showcase"
        aria-labelledby="showcase-title"
        data-reveal
      >
        <div className="ca-section-heading-wrap">
          <p className="ca-section-kicker">App Showcase</p>
          <h2 id="showcase-title">Your dashboard at a glance.</h2>
          <p>
            This frame is pre-wired for your product screenshot. Replace the
            image path below to publish your final marketing visual.
          </p>
        </div>
        <div className="ca-screenshot-frame">
          <Image
            src="/images/landing/app-screenshot.svg"
            alt="CustomerAtlas app screenshot"
            width={1400}
            height={880}
            unoptimized
            priority
          />
          <p className="ca-screenshot-caption">
            Screenshot slot: replace /images/landing/app-screenshot.svg with
            your product capture. Recommended export: 1400x880 PNG or WebP.
          </p>
        </div>
        <div className="ca-showcase-detail-grid">
          <article>
            <h3>Operator-first workspace</h3>
            <p>
              Every major action is measurable, attributable, and review-ready.
            </p>
          </article>
          <article>
            <h3>Built for team velocity</h3>
            <p>
              From model signals to execution in minutes, not reporting cycles.
            </p>
          </article>
        </div>
      </section>

      <section
        className="ca-section ca-section-dark ca-feature-section"
        id="features"
        aria-labelledby="features-title"
        data-reveal
      >
        <div className="ca-section-heading-wrap">
          <p className="ca-section-kicker">Core Platform</p>
          <h2 id="features-title">
            Designed for operators, not dashboards for dashboard&apos;s sake.
          </h2>
        </div>
        <div className="ca-feature-grid-modern">
          <article className="ca-feature-card-modern">
            <span className="ca-feature-eyebrow">Priority</span>
            <h3>Decision Priority Engine</h3>
            <p>Ranks growth tasks by predicted return and execution effort.</p>
          </article>
          <article className="ca-feature-card-modern">
            <span className="ca-feature-eyebrow">Audiences</span>
            <h3>Segment Builder</h3>
            <p>
              Compose campaign audiences with instant preview and clear logic.
            </p>
          </article>
          <article className="ca-feature-card-modern">
            <span className="ca-feature-eyebrow">Partnerships</span>
            <h3>Affiliate Intelligence</h3>
            <p>Track referrals, payouts, and key activity from one place.</p>
          </article>
          <article className="ca-feature-card-modern">
            <span className="ca-feature-eyebrow">Reliability</span>
            <h3>Reliability Controls</h3>
            <p>Keep sync, billing, and automations visible and healthy.</p>
          </article>
        </div>
      </section>

      <section
        className="ca-section"
        id="how-it-works"
        aria-labelledby="steps-title"
        data-reveal
      >
        <div className="ca-section-heading-wrap">
          <p className="ca-section-kicker">How It Works</p>
          <h2 id="steps-title">
            From install to measurable lift in three steps.
          </h2>
        </div>
        <div className="ca-steps-grid">
          <article>
            <span>01</span>
            <h3>Connect Store</h3>
            <p>Install once and sync customer, order, and behavior history.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Model and Segment</h3>
            <p>
              CustomerAtlas rotates model insights and builds target audiences.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Activate and Track</h3>
            <p>
              Launch actions and monitor conversion, payout, and health
              outcomes.
            </p>
          </article>
        </div>
      </section>

      <section
        className="ca-section ca-section-dark ca-testimonial-section"
        id="testimonials"
        aria-labelledby="testimonials-title"
        data-reveal
      >
        <div className="ca-section-heading-wrap">
          <p className="ca-section-kicker">Social Proof</p>
          <h2 id="testimonials-title">
            Teams use CustomerAtlas to move faster with confidence.
          </h2>
        </div>
        <div className="ca-testimonial-grid">
          <article>
            <span className="ca-testimonial-avatar">NG</span>
            <p>
              &ldquo;We cut campaign planning time by 40% and had clearer
              priority queues in week one.&rdquo;
            </p>
            <strong>Head of Growth, Northstar Goods</strong>
          </article>
          <article>
            <span className="ca-testimonial-avatar">HS</span>
            <p>
              &ldquo;The model stream made it obvious where revenue was leaking.
              We fixed churn before it showed up in reports.&rdquo;
            </p>
            <strong>Lifecycle Manager, Harbor Supply</strong>
          </article>
          <article>
            <span className="ca-testimonial-avatar">UB</span>
            <p>
              &ldquo;Affiliate payout ops and key controls are finally
              centralized. No more spreadsheet handoffs.&rdquo;
            </p>
            <strong>Partnership Lead, Urban Bloom</strong>
          </article>
        </div>
      </section>

      <section
        className="ca-section ca-pricing-section"
        id="pricing"
        aria-labelledby="pricing-title"
        data-reveal
      >
        <div className="ca-section-heading-wrap">
          <p className="ca-section-kicker">Pricing</p>
          <h2 id="pricing-title">
            Start free. Scale with Pro when your team is ready.
          </h2>
        </div>
        <div className="ca-pricing-grid-modern">
          <article className="ca-pricing-card-modern">
            <h3>Starter</h3>
            <p className="ca-price">$0</p>
            <ul>
              <li>Dashboard and customer timeline</li>
              <li>Core insights and sync monitoring</li>
              <li>Install and onboarding support</li>
            </ul>
            <Link href="/install" className="ca-landing-cta-secondary">
              Start free
            </Link>
          </article>
          <article className="ca-pricing-card-modern ca-pricing-card-featured">
            <span className="ca-pricing-badge">Most popular</span>
            <h3>Pro</h3>
            <p className="ca-price">$49</p>
            <ul>
              <li>Advanced segmentation and exports</li>
              <li>Affiliate portal and API key controls</li>
              <li>Automation and model-driven priorities</li>
            </ul>
            <Link href="/install" className="ca-landing-cta-primary">
              Upgrade to Pro
            </Link>
          </article>
        </div>
        <p className="ca-pricing-footnote">
          All plans include onboarding support. Upgrade or downgrade anytime
          from your billing panel.
        </p>
      </section>

      <section
        className="ca-section ca-section-dark"
        id="faq"
        aria-labelledby="faq-title"
        data-reveal
      >
        <div className="ca-section-heading-wrap">
          <p className="ca-section-kicker">FAQ</p>
          <h2 id="faq-title">Common questions from Shopify teams.</h2>
        </div>
        <div className="ca-faq-list">
          <details open>
            <summary>How long does setup take?</summary>
            <p>
              Most stores complete setup and first sync in under 15 minutes.
            </p>
          </details>
          <details>
            <summary>Can we use it with existing campaign tools?</summary>
            <p>
              Yes. CustomerAtlas is built to feed audience and priority
              decisions into your existing workflows.
            </p>
          </details>
          <details>
            <summary>Do you support affiliates and payouts?</summary>
            <p>
              Yes. You can manage applications, referral links, API keys, and
              payout lifecycle tracking in-app.
            </p>
          </details>
        </div>
      </section>

      <section
        className="ca-section ca-final-cta"
        id="contact"
        aria-labelledby="contact-title"
        data-reveal
      >
        <h2 id="contact-title">
          Ready to run growth on signal instead of guesswork?
        </h2>
        <p>
          Install CustomerAtlas and give your team one workspace for insight,
          activation, and measurable lift.
        </p>
        <div className="ca-landing-cta-row">
          <Link href="/install" className="ca-landing-cta-primary">
            Install now
          </Link>
          <Link href="/docs" className="ca-landing-cta-secondary">
            View docs
          </Link>
        </div>
      </section>

      <footer
        className="ca-site-footer"
        id="support"
        aria-label="Footer"
        data-reveal
      >
        <div>
          <BrandMark compact size={28} />
          <p>Revenue intelligence platform for modern Shopify operators.</p>
        </div>
        <div>
          <h4>Product</h4>
          <a href="#models">Models</a>
          <a href="#showcase">Showcase</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div>
          <h4>Resources</h4>
          <Link href="/docs">Documentation</Link>
          <Link href="/install">Install guide</Link>
          <Link href="/account">Account</Link>
        </div>
        <div>
          <h4>Company</h4>
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact</a>
          <Link href="/login">Sign in</Link>
        </div>
      </footer>
    </main>
  );
}
