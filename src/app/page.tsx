import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";

export default function HomePage() {
  return (
    <main className="ca-landing-root">
      <section className="ca-landing-hero ca-fade-in">
        <div className="ca-landing-hero-left">
          <div className="ca-landing-brand-chip">
            <BrandMark subtitle="Shopify Intelligence Platform" size={40} />
          </div>
          <p className="ca-landing-kicker">CustomerAtlas Growth OS</p>
          <h1 className="ca-landing-title">
            Make every customer signal immediately actionable.
          </h1>
          <p className="ca-landing-subtitle">
            CustomerAtlas turns raw Shopify behavior into ranked priorities,
            high-value cohorts, and campaign-ready exports your team can execute
            this week.
          </p>
          <div className="ca-landing-pill-row">
            <span className="ca-landing-pill">Revenue-ranked priorities</span>
            <span className="ca-landing-pill">Live segment previews</span>
            <span className="ca-landing-pill">Store sync confidence</span>
          </div>
          <div className="ca-landing-cta-row">
            <Link href="/install" className="ca-landing-cta-primary">
              Install on Shopify
            </Link>
            <Link href="/dashboard" className="ca-landing-cta-secondary">
              Explore dashboard
            </Link>
          </div>
        </div>

        <div className="ca-landing-signal-card">
          <div className="ca-landing-logo-panel">
            <BrandMark iconOnly size={78} />
            <div>
              <p>Active Store</p>
              <strong>northstar-goods-lab.myshopify.com</strong>
            </div>
          </div>
          <div className="ca-landing-signal-grid">
            <div>
              <p>Opportunity score</p>
              <strong>86 / 100</strong>
            </div>
            <div>
              <p>At-risk customers</p>
              <strong>142 profiles</strong>
            </div>
            <div>
              <p>Projected revenue lift</p>
              <strong>$12.8k</strong>
            </div>
            <div>
              <p>Sync freshness</p>
              <strong>Healthy</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="ca-landing-feature-grid">
        <article className="ca-landing-feature-card ca-fade-in">
          <h2>Priority Engine</h2>
          <p>
            CustomerAtlas scores tasks by expected impact, confidence, and time
            to value, so your team moves from list view to action quickly.
          </p>
        </article>
        <article className="ca-landing-feature-card ca-fade-in">
          <h2>Segment Workbench</h2>
          <p>
            Build audience logic in minutes, preview matches instantly, and
            activate campaigns without spreadsheet detours.
          </p>
        </article>
        <article className="ca-landing-feature-card ca-fade-in">
          <h2>Reliability Layer</h2>
          <p>
            Monitor sync health, ownership status, and freshness so teams trust
            every number before they launch changes.
          </p>
        </article>
      </section>

      <p className="ca-landing-footnote">
        Built for Shopify operators who want clearer priorities and faster wins.
      </p>
    </main>
  );
}
