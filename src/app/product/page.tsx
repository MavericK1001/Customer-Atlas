import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  platformModules,
  productLayers,
  useCases,
} from "@/components/marketing/marketing-data";
import {
  MarketingFooter,
  MarketingHeader,
  MarketingPageFrame,
} from "@/components/marketing/MarketingChrome";

export const metadata: Metadata = {
  title: "Product | CustomerAtlas",
  description:
    "Explore the CustomerAtlas product: command center, predictive customer signals, segmentation, affiliate operations, and reliability controls.",
};

export default function ProductPage() {
  return (
    <MarketingPageFrame>
      <div className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_54%,#ffffff_100%)]">
        <div
          className="ca-marketing-orb ca-marketing-orb-top"
          aria-hidden="true"
        />
        <MarketingHeader />

        <section className="px-4 pb-14 pt-8 sm:px-6 lg:px-8">
          <div
            className="ca-marketing-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr]"
            id="main-content"
          >
            <div className="grid gap-5 self-center" data-reveal>
              <span className="ca-eyebrow">Product</span>
              <h1 className="max-w-[11ch] text-[clamp(3rem,6vw,5.4rem)] font-bold leading-[0.96] tracking-[-0.06em] text-[#081b36]">
                One platform for customer intelligence and revenue operations.
              </h1>
              <p className="max-w-[56ch] text-lg leading-8 text-[#506684]">
                Product pages in this category work best when they explain the
                system, the modules, and the team workflows. This page is built
                around that structure.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/install" className="ca-button-primary">
                  Install app
                </Link>
                <Link href="/pricing" className="ca-button-secondary">
                  View pricing
                </Link>
              </div>
            </div>

            <div className="ca-hero-panel" data-reveal>
              <div className="grid gap-4 md:grid-cols-2">
                {platformModules.slice(0, 4).map((module) => (
                  <article
                    key={module.title}
                    className="ca-panel-card ca-panel-card-light"
                  >
                    <span>{module.eyebrow}</span>
                    <strong>{module.title}</strong>
                    <p>{module.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="ca-marketing-shell grid gap-4">
            {platformModules.map((module, index) => (
              <article
                key={module.title}
                className={`grid gap-6 rounded-[32px] border border-[#0f345910] bg-white p-6 shadow-[0_30px_90px_rgba(7,20,44,0.07)] lg:grid-cols-[0.8fr_1.2fr] ${
                  index % 2 === 1 ? "lg:grid-cols-[1.2fr_0.8fr]" : ""
                }`}
                data-reveal
              >
                <div className="grid gap-4">
                  <span className="ca-card-eyebrow">{module.eyebrow}</span>
                  <h2 className="text-[clamp(1.8rem,3vw,2.7rem)] font-bold leading-[1] tracking-[-0.05em] text-[#081b36]">
                    {module.title}
                  </h2>
                </div>
                <div className="grid gap-4 text-base leading-7 text-[#58708d]">
                  <p>{module.description}</p>
                  <div className="ca-inline-callout">
                    <p className="text-sm uppercase tracking-[0.16em] text-[#6b84a7]">
                      What this means in practice
                    </p>
                    <p className="mt-3 text-base leading-7 text-[#244669]">
                      Teams get a cleaner handoff from data to decision. The
                      module is designed to be usable in the cadence of real
                      ecommerce operations, not just visible in a dashboard.
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="ca-dark-section px-4 py-24 sm:px-6 lg:px-8">
          <div className="ca-marketing-shell grid gap-12">
            <div className="max-w-[56rem]" data-reveal>
              <span className="ca-eyebrow ca-eyebrow-dark">System view</span>
              <h2 className="mt-5 text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[0.98] tracking-[-0.05em] text-white">
                The product architecture is simple enough to understand and rich
                enough to scale.
              </h2>
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

        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="ca-marketing-shell grid gap-12 lg:grid-cols-[1fr_1fr]">
            <div className="grid gap-4" data-reveal>
              <span className="ca-eyebrow">Workspace preview</span>
              <div className="ca-screenshot-stage">
                <Image
                  src="/images/landing/app-screenshot.svg"
                  alt="CustomerAtlas product interface"
                  width={1400}
                  height={880}
                  unoptimized
                  className="h-auto w-full rounded-[24px]"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {useCases.map((item) => (
                <article
                  key={item.title}
                  className="ca-surface-card"
                  data-reveal
                >
                  <span className="ca-card-eyebrow">{item.role}</span>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#0b2143]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-[#5a708d]">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-8 pt-2 sm:px-6 lg:px-8">
          <div className="ca-marketing-shell ca-cta-panel" data-reveal>
            <div>
              <span className="ca-eyebrow ca-eyebrow-dark">Next step</span>
              <h2 className="mt-4 text-[clamp(2rem,4vw,3.3rem)] font-bold leading-[1] tracking-[-0.05em] text-white">
                See the plan options or go straight to install.
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/pricing" className="ca-button-primary">
                Compare plans
              </Link>
              <Link href="/install" className="ca-button-dark-secondary">
                Install app
              </Link>
            </div>
          </div>
        </section>

        <MarketingFooter />
      </div>
    </MarketingPageFrame>
  );
}
