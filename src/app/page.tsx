import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing-root">
      <section className="landing-hero landing-fade-up">
        <p className="landing-kicker">CustomerAtlas for Shopify</p>
        <h1 className="landing-title">
          Turn raw customer data into daily revenue decisions.
        </h1>
        <p className="landing-subtitle">
          Detect churn risk, launch high-impact segments, and prioritize actions
          with clear upside before your next campaign goes live.
        </p>
        <div className="landing-cta-row">
          <Link
            href="/install"
            className="landing-button-link landing-button-primary"
          >
            Install on Shopify
          </Link>
          <Link
            href="/dashboard"
            className="landing-button-link landing-button-secondary"
          >
            Open Dashboard
          </Link>
        </div>
      </section>

      <section className="landing-grid">
        <article
          className="landing-card landing-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          <h2>Revenue Priorities</h2>
          <p>
            Every morning starts with ranked opportunities, confidence signals,
            and expected impact so your team knows where to focus first.
          </p>
        </article>
        <article
          className="landing-card landing-fade-up"
          style={{ animationDelay: "140ms" }}
        >
          <h2>Segment Intelligence</h2>
          <p>
            Build and preview segments instantly using spend, frequency, and
            inactivity rules. Save, tune, and deploy without spreadsheet loops.
          </p>
        </article>
        <article
          className="landing-card landing-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          <h2>Sync Confidence</h2>
          <p>
            Keep your team aligned with visible sync freshness, webhook-backed
            updates, and one-click recovery when data health drops.
          </p>
        </article>
      </section>

      <section
        className="landing-footnote landing-fade-up"
        style={{ animationDelay: "240ms" }}
      >
        <p>Built for merchants who want momentum, not more dashboards.</p>
      </section>
    </main>
  );
}
