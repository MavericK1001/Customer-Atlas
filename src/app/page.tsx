import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";

export default function HomePage() {
  return (
    <main className="ca-landing-root">
      <header className="ca-site-header ca-fade-in">
        <Link href="/" className="ca-site-brand">
          <BrandMark subtitle="Shopify Intelligence Platform" size={34} />
        </Link>
        <nav className="ca-site-nav">
          <a href="#product">Product</a>
          <a href="#pricing">Pricing</a>
          <Link href="/docs">Docs</Link>
          <a href="#support">Support</a>
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

      <section className="ca-landing-hero ca-fade-in" id="product">
        <div className="ca-landing-hero-left">
          <p className="ca-landing-kicker">CustomerAtlas Growth OS</p>
          <h1 className="ca-landing-title">
            Your Shopify customer intelligence command center.
          </h1>
          <p className="ca-landing-subtitle">
            Convert customer data into ranked actions, campaign-ready segments,
            and measurable revenue lifts from one interface built for operators.
          </p>
          <div className="ca-landing-pill-row">
            <span className="ca-landing-pill">Action-ranked priorities</span>
            <span className="ca-landing-pill">Live audience builder</span>
            <span className="ca-landing-pill">Reliable sync health</span>
          </div>
          <div className="ca-landing-cta-row">
            <Link href="/install" className="ca-landing-cta-primary">
              Install on Shopify
            </Link>
            <Link href="/docs" className="ca-landing-cta-secondary">
              Read documentation
            </Link>
          </div>
        </div>

        <div className="ca-landing-signal-card">
          <div className="ca-landing-logo-panel">
            <BrandMark iconOnly size={78} />
            <div>
              <p>Primary workspace</p>
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
              <p>Projected monthly lift</p>
              <strong>$12.8k</strong>
            </div>
            <div>
              <p>Sync freshness</p>
              <strong>Healthy</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="ca-landing-feature-grid" id="features">
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

      <section className="ca-landing-docs-strip ca-fade-in">
        <div>
          <p className="ca-dashboard-kicker">Documentation</p>
          <h2>Implementation guides your team can use today.</h2>
          <p>
            Setup checklists, route references, and operator playbooks for
            install, sync, segmentation, and troubleshooting.
          </p>
        </div>
        <div className="ca-landing-docs-actions">
          <Link href="/docs" className="ca-landing-cta-primary">
            Open docs
          </Link>
          <Link href="/signup" className="ca-site-link">
            Create account
          </Link>
        </div>
      </section>

      <section className="ca-landing-pricing" id="pricing">
        <article className="ca-landing-pricing-card ca-fade-in">
          <h3>Starter</h3>
          <p className="ca-price">$0</p>
          <ul>
            <li>Dashboard and customer overview</li>
            <li>Basic sync health</li>
            <li>Standard insights</li>
          </ul>
        </article>
        <article className="ca-landing-pricing-card ca-fade-in">
          <h3>Pro</h3>
          <p className="ca-price">$49</p>
          <ul>
            <li>Advanced segment create/edit/delete</li>
            <li>CSV export and email copy workflows</li>
            <li>Priority automation playbooks</li>
          </ul>
        </article>
      </section>

      <footer className="ca-site-footer" id="support">
        <div>
          <BrandMark compact size={28} />
          <p>
            Built for Shopify operators who want clearer priorities and faster
            wins.
          </p>
        </div>
        <div>
          <h4>Product</h4>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/customers">Customers</Link>
          <Link href="/segments">Segments</Link>
        </div>
        <div>
          <h4>Resources</h4>
          <Link href="/docs">Documentation</Link>
          <Link href="/install">Install guide</Link>
          <Link href="/settings">Sync settings</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link href="/login">Sign in</Link>
          <Link href="/signup">Create account</Link>
        </div>
      </footer>
    </main>
  );
}
