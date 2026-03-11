import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";

export default function DocsPage() {
  return (
    <main className="ca-docs-root">
      <header className="ca-site-header ca-fade-in">
        <Link href="/" className="ca-site-brand">
          <BrandMark subtitle="Documentation" size={32} />
        </Link>
        <nav className="ca-site-nav">
          <a href="#getting-started">Getting Started</a>
          <a href="#features">Features</a>
          <a href="#guides">Guides</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="ca-site-cta">
          <Link href="/install" className="ca-landing-cta-secondary">
            Install
          </Link>
        </div>
      </header>

      <section className="ca-page-hero ca-fade-in" id="getting-started">
        <p className="ca-dashboard-kicker">Getting Started</p>
        <h2>Set up CustomerAtlas in minutes.</h2>
        <p>
          Install the app, authenticate your Shopify store, and run your first
          sync to populate dashboards.
        </p>
      </section>

      <section className="ca-docs-grid" id="features">
        <article className="ca-docs-card">
          <h3>Core Features</h3>
          <ul>
            <li>Dashboard with priorities and revenue opportunities</li>
            <li>Customers portfolio with value-based filters</li>
            <li>Segment builder with preview and export</li>
            <li>Sync health monitoring and recovery guidance</li>
          </ul>
        </article>

        <article className="ca-docs-card" id="guides">
          <h3>How-To Guides</h3>
          <ul>
            <li>Create a custom segment and preview match count</li>
            <li>Export segment CSV or copy target emails</li>
            <li>Interpret opportunity score and confidence</li>
            <li>Troubleshoot stale sync or webhook issues</li>
          </ul>
        </article>

        <article className="ca-docs-card">
          <h3>Reference</h3>
          <ul>
            <li>
              Route aliases: <code>/login</code> and <code>/signup</code>
            </li>
            <li>
              App routes: <code>/dashboard</code>, <code>/customers</code>,{" "}
              <code>/segments</code>
            </li>
            <li>
              API routes under <code>/api/*</code> for auth, sync, insights, and
              segments
            </li>
            <li>Plan gating: custom segment actions require Pro plan</li>
          </ul>
        </article>
      </section>

      <section className="ca-docs-setup-card ca-fade-in">
        <h3>Local Setup</h3>
        <pre>{`npm install\nnpm run dev`}</pre>
        <h3>Build and Validation</h3>
        <pre>{`npm run lint\nnpm run build`}</pre>
        <h3>Production Checklist</h3>
        <ul>
          <li>Set Shopify app URL and callback domain correctly</li>
          <li>
            Run migrations during release: <code>prisma migrate deploy</code>
          </li>
          <li>Confirm webhook registration and sync health after deploy</li>
        </ul>
      </section>

      <section className="ca-docs-card" id="faq">
        <h3>FAQ</h3>
        <p>
          <strong>How often is data updated?</strong> Sync freshness depends on
          Shopify events plus manual sync actions from Settings.
        </p>
        <p>
          <strong>Why are segment actions disabled?</strong> Create, edit, and
          delete are available on Pro tier.
        </p>
        <p>
          <strong>Need support?</strong> Use in-app sync diagnostics first, then
          share logs and store domain with your support contact.
        </p>
      </section>

      <footer className="ca-site-footer">
        <div>
          <BrandMark compact size={26} />
          <p>CustomerAtlas documentation for operators and analysts.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <Link href="/">Home</Link>
          <Link href="/install">Install</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      </footer>
    </main>
  );
}
