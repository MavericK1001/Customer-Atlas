import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing-root">
      <section className="landing-hero landing-fade-up">
        <p className="landing-kicker">CustomerAtlas Control Plane</p>
        <h1 className="landing-title">
          A technical growth console for Shopify customer intelligence.
        </h1>
        <p className="landing-subtitle">
          Stream customer and order signals into one workspace, rank revenue
          moves by expected impact, and keep campaigns synced to live behavior.
        </p>
        <div className="landing-signal-row">
          <div className="landing-signal-pill">Realtime sync health</div>
          <div className="landing-signal-pill">Smart segment builder</div>
          <div className="landing-signal-pill">Action-ranked insights</div>
        </div>
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
        <div className="landing-tech-panel">
          <div className="landing-tech-head">
            <span>shopify://northstar-goods-lab</span>
            <span className="landing-tech-status">pipeline healthy</span>
          </div>
          <div className="landing-tech-grid">
            <div>
              <p>event throughput</p>
              <strong>12.4k / day</strong>
            </div>
            <div>
              <p>at-risk cohort</p>
              <strong>142 customers</strong>
            </div>
            <div>
              <p>next best action</p>
              <strong>win-back flow v3</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-grid">
        <article
          className="landing-card landing-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          <h2>Priority Engine</h2>
          <p>
            Score opportunities by potential revenue and confidence so teams act
            on leverage, not guesswork.
          </p>
        </article>
        <article
          className="landing-card landing-fade-up"
          style={{ animationDelay: "140ms" }}
        >
          <h2>Segment Workbench</h2>
          <p>
            Compose rule-based audiences with instant preview counts and iterate
            without exporting to spreadsheets.
          </p>
        </article>
        <article
          className="landing-card landing-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          <h2>Data Reliability</h2>
          <p>
            Monitor freshness and recovery signals to keep dashboards aligned
            with live store behavior.
          </p>
        </article>
      </section>

      <section
        className="landing-footnote landing-fade-up"
        style={{ animationDelay: "240ms" }}
      >
        <p>Built for teams that ship experiments fast and learn even faster.</p>
      </section>
    </main>
  );
}
