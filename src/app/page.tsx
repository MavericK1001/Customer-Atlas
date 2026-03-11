import Link from "next/link";
import Image from "next/image";
import { BrandMark } from "@/components/brand/BrandMark";

export default function HomePage() {
  return (
    <main className="ca-landing-root">
      <a href="#hero" className="ca-skip-link">
        Skip to main content
      </a>

      <header className="ca-site-header ca-fade-in">
        <Link href="/" className="ca-site-brand">
          <BrandMark subtitle="Revenue Intelligence for Shopify" size={34} />
        </Link>
        <nav className="ca-site-nav" aria-label="Primary">
          <a href="#models">Models</a>
          <a href="#showcase">Showcase</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="ca-site-cta">
          <Link href="/login" className="ca-site-link">
            Sign in
          </Link>
          <Link href="/install" className="ca-landing-cta-primary">
            Install app
          </Link>
        </div>
      </header>

      <section
        className="ca-landing-hero ca-fade-in ca-stagger-1"
        id="hero"
        aria-labelledby="hero-title"
      >
        <div className="ca-landing-hero-left">
          <p className="ca-landing-kicker">CustomerAtlas Intelligence Stack</p>
          <h1 className="ca-landing-title" id="hero-title">
            One command center for customer signals, growth decisions, and
            execution.
          </h1>
          <p className="ca-landing-subtitle">
            Built for Shopify teams that need fast, defensible actions. Analyze
            behavior, rank opportunities, and launch segmented campaigns from
            the same workspace.
          </p>
          <div className="ca-landing-pill-row">
            <span className="ca-landing-pill">Predictive customer models</span>
            <span className="ca-landing-pill">Audience activation</span>
            <span className="ca-landing-pill">
              Affiliate and payout controls
            </span>
          </div>
          <div className="ca-landing-cta-row">
            <Link href="/install" className="ca-landing-cta-primary">
              Install on Shopify
            </Link>
            <Link href="/docs" className="ca-landing-cta-secondary">
              Explore documentation
            </Link>
          </div>
        </div>

        <div className="ca-landing-hero-panel">
          <div className="ca-landing-logo-panel">
            <BrandMark iconOnly size={74} />
            <div>
              <p>Live workspace</p>
              <strong>northstar-goods-lab.myshopify.com</strong>
            </div>
          </div>
          <div className="ca-landing-signal-grid">
            <div>
              <p>Churn-risk model</p>
              <strong>94.1% confidence</strong>
            </div>
            <div>
              <p>Likely repeat buyers</p>
              <strong>1,248 profiles</strong>
            </div>
            <div>
              <p>Projected lift</p>
              <strong>$18.4k / month</strong>
            </div>
            <div>
              <p>Automation health</p>
              <strong>All systems ready</strong>
            </div>
          </div>
        </div>
      </section>

      <section
        className="ca-section ca-section-dark ca-fade-in ca-stagger-2"
        id="models"
        aria-labelledby="models-title"
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
      </section>

      <section
        className="ca-section ca-section-showcase ca-fade-in ca-stagger-3"
        id="showcase"
        aria-labelledby="showcase-title"
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
      </section>

      <section
        className="ca-section ca-section-dark ca-feature-section ca-fade-in ca-stagger-4"
        id="features"
        aria-labelledby="features-title"
      >
        <div className="ca-section-heading-wrap">
          <p className="ca-section-kicker">Core Platform</p>
          <h2 id="features-title">
            Designed for operators, not dashboards for dashboard&apos;s sake.
          </h2>
        </div>
        <div className="ca-feature-grid-modern">
          <article className="ca-feature-card-modern">
            <h3>Decision Priority Engine</h3>
            <p>Ranks growth tasks by predicted return and execution effort.</p>
          </article>
          <article className="ca-feature-card-modern">
            <h3>Segment Builder</h3>
            <p>
              Compose campaign audiences with instant preview and clear logic.
            </p>
          </article>
          <article className="ca-feature-card-modern">
            <h3>Affiliate Intelligence</h3>
            <p>Track referrals, payouts, and key activity from one place.</p>
          </article>
          <article className="ca-feature-card-modern">
            <h3>Reliability Controls</h3>
            <p>Keep sync, billing, and automations visible and healthy.</p>
          </article>
        </div>
      </section>

      <section
        className="ca-section ca-fade-in ca-stagger-1"
        id="how-it-works"
        aria-labelledby="steps-title"
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
        className="ca-section ca-section-dark ca-testimonial-section ca-fade-in ca-stagger-2"
        id="testimonials"
        aria-labelledby="testimonials-title"
      >
        <div className="ca-section-heading-wrap">
          <p className="ca-section-kicker">Social Proof</p>
          <h2 id="testimonials-title">
            Teams use CustomerAtlas to move faster with confidence.
          </h2>
        </div>
        <div className="ca-testimonial-grid">
          <article>
            <p>
              &ldquo;We cut campaign planning time by 40% and had clearer
              priority queues in week one.&rdquo;
            </p>
            <strong>Head of Growth, Northstar Goods</strong>
          </article>
          <article>
            <p>
              &ldquo;The model stream made it obvious where revenue was leaking.
              We fixed churn before it showed up in reports.&rdquo;
            </p>
            <strong>Lifecycle Manager, Harbor Supply</strong>
          </article>
          <article>
            <p>
              &ldquo;Affiliate payout ops and key controls are finally
              centralized. No more spreadsheet handoffs.&rdquo;
            </p>
            <strong>Partnership Lead, Urban Bloom</strong>
          </article>
        </div>
      </section>

      <section
        className="ca-section ca-pricing-section ca-fade-in ca-stagger-3"
        id="pricing"
        aria-labelledby="pricing-title"
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
      </section>

      <section
        className="ca-section ca-section-dark ca-fade-in ca-stagger-4"
        id="faq"
        aria-labelledby="faq-title"
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
        className="ca-section ca-final-cta ca-fade-in ca-stagger-1"
        id="contact"
        aria-labelledby="contact-title"
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

      <footer className="ca-site-footer" id="support" aria-label="Footer">
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
