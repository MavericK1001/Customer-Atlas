import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";
import { LandingScrollSystem } from "@/components/landing/LandingScrollSystem";

const NAV_ITEMS = [
  { href: "/product", label: "Product" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
];

type MarketingPageFrameProps = {
  children: React.ReactNode;
};

type MarketingHeaderProps = {
  dark?: boolean;
};

export function MarketingPageFrame({
  children,
}: MarketingPageFrameProps): JSX.Element {
  return (
    <main className="ca-marketing-root">
      <LandingScrollSystem />
      <div className="ca-scroll-progress" aria-hidden="true" />
      <a href="#main-content" className="ca-skip-link">
        Skip to main content
      </a>
      {children}
    </main>
  );
}

export function MarketingHeader({ dark = false }: MarketingHeaderProps) {
  const navLinkClassName = dark
    ? "rounded-full px-3 py-2 text-sm font-semibold text-white/84 transition hover:bg-white/10"
    : "rounded-full px-3 py-2 text-sm font-semibold text-[#16345f] transition hover:bg-[#0d4a9612]";

  return (
    <header className="sticky top-4 z-40 px-4 sm:px-6 lg:px-8" data-reveal>
      <div
        className={`ca-marketing-shell flex flex-wrap items-center justify-between gap-3 rounded-[28px] border px-4 py-3 backdrop-blur-xl ${
          dark
            ? "border-white/12 bg-[#081a34e8] shadow-[0_24px_80px_rgba(3,10,24,0.38)]"
            : "border-[#0e356212] bg-white/82 shadow-[0_24px_70px_rgba(7,20,44,0.08)]"
        }`}
      >
        <Link href="/" className="no-underline">
          <BrandMark subtitle="Shopify Revenue Intelligence" size={34} />
        </Link>

        <nav className="flex flex-wrap items-center gap-1" aria-label="Primary">
          <Link href="/#platform" className={navLinkClassName}>
            Platform
          </Link>
          <Link href="/#proof" className={navLinkClassName}>
            Proof
          </Link>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={navLinkClassName}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={`rounded-full border px-4 py-2 text-sm font-semibold no-underline transition ${
              dark
                ? "border-white/14 bg-white/6 text-white hover:bg-white/10"
                : "border-[#123f7424] bg-white text-[#123b74] hover:-translate-y-0.5"
            }`}
          >
            Sign in
          </Link>
          <Link href="/install" className="ca-button-primary">
            Install app
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter(): JSX.Element {
  return (
    <footer className="px-4 pb-10 pt-8 sm:px-6 lg:px-8" data-reveal>
      <div className="ca-marketing-shell rounded-[32px] border border-[#102b4f12] bg-white px-6 py-8 shadow-[0_30px_90px_rgba(7,20,44,0.08)]">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_repeat(3,0.8fr)]">
          <div className="grid gap-3">
            <BrandMark subtitle="Shopify Revenue Intelligence" size={32} />
            <p className="max-w-[34ch] text-sm leading-6 text-[#546a88]">
              CustomerAtlas helps Shopify teams understand customer value,
              prioritize revenue moves, and run partner operations from one
              premium operating layer.
            </p>
          </div>

          <div className="grid gap-2 text-sm text-[#16345f]">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#6880a1]">
              Product
            </h4>
            <Link href="/product" className="ca-footer-link">
              Product Overview
            </Link>
            <Link href="/#platform" className="ca-footer-link">
              Platform
            </Link>
            <Link href="/#proof" className="ca-footer-link">
              Proof
            </Link>
          </div>

          <div className="grid gap-2 text-sm text-[#16345f]">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#6880a1]">
              Resources
            </h4>
            <Link href="/pricing" className="ca-footer-link">
              Pricing
            </Link>
            <Link href="/docs" className="ca-footer-link">
              Documentation
            </Link>
            <Link href="/install" className="ca-footer-link">
              Install Guide
            </Link>
          </div>

          <div className="grid gap-2 text-sm text-[#16345f]">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#6880a1]">
              Access
            </h4>
            <Link href="/login" className="ca-footer-link">
              Sign in
            </Link>
            <Link href="/account/signup" className="ca-footer-link">
              Create account
            </Link>
            <Link href="/account" className="ca-footer-link">
              Account portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
