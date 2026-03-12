"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand/BrandMark";
import { LandingScrollSystem } from "@/components/landing/LandingScrollSystem";

const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/product", label: "Product" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
];

const FOOTER_SECTIONS = [
  {
    title: "Platform",
    links: [
      { href: "/product", label: "Product overview" },
      { href: "/#platform", label: "Platform" },
      { href: "/#proof", label: "Proof" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/docs", label: "Documentation" },
      { href: "/install", label: "Install guide" },
    ],
  },
  {
    title: "Workspace",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/segments", label: "Segments" },
      { href: "/account", label: "Account portal" },
    ],
  },
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
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const shellClassName = dark
    ? "ca-marketing-header-shell ca-marketing-header-shell-dark"
    : "ca-marketing-header-shell";
  const navLinkClassName = dark
    ? "ca-marketing-nav-link ca-marketing-nav-link-dark"
    : "ca-marketing-nav-link";
  const signInClassName = dark
    ? "ca-marketing-signin ca-marketing-signin-dark"
    : "ca-marketing-signin";

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function getNavLinkClassName(href: string): string {
    const isActive = href === pathname;

    if (!isActive) {
      return navLinkClassName;
    }

    return dark
      ? `${navLinkClassName} ca-marketing-nav-link-active-dark`
      : `${navLinkClassName} ca-marketing-nav-link-active`;
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-4 z-40 px-4 sm:px-6 lg:px-8" data-reveal>
      <div className={`ca-marketing-shell ${shellClassName}`}>
        <div className="ca-marketing-header-brand">
          <Link href="/" className="no-underline">
            <BrandMark subtitle="Shopify Revenue Intelligence" size={34} />
          </Link>
          <div className="ca-header-meta">
            <span className="ca-header-badge">Built for Shopify operators</span>
            <span className="ca-header-microcopy">
              Revenue signal, segmentation, and partner ops in one surface.
            </span>
          </div>
        </div>

        <div
          className={`ca-marketing-header-panel ${
            mobileMenuOpen ? "ca-marketing-header-panel-open" : ""
          }`}
        >
          <nav
            id="marketing-primary-nav"
            className="ca-marketing-nav"
            aria-label="Primary"
          >
            <Link
              href="/#platform"
              className={navLinkClassName}
              onClick={closeMobileMenu}
            >
              Platform
            </Link>
            <Link
              href="/#proof"
              className={navLinkClassName}
              onClick={closeMobileMenu}
            >
              Proof
            </Link>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={getNavLinkClassName(item.href)}
                onClick={closeMobileMenu}
                aria-current={item.href === pathname ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ca-marketing-header-actions">
            <Link
              href="/login"
              className={signInClassName}
              onClick={closeMobileMenu}
            >
              Sign in
            </Link>
            <Link
              href="/install"
              className="ca-button-primary"
              onClick={closeMobileMenu}
            >
              Install app
            </Link>
          </div>
        </div>

        <button
          type="button"
          className="ca-marketing-menu-button"
          aria-expanded={mobileMenuOpen}
          aria-controls="marketing-primary-nav"
          aria-label={
            mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span className="ca-marketing-menu-button-label">
            {mobileMenuOpen ? "Close" : "Menu"}
          </span>
          <span className="ca-marketing-menu-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>
    </header>
  );
}

export function MarketingFooter(): JSX.Element {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="px-4 pb-10 pt-8 sm:px-6 lg:px-8" data-reveal>
      <div className="ca-marketing-shell ca-marketing-footer-shell">
        <div className="ca-marketing-footer-cta">
          <div className="grid gap-3">
            <span className="ca-eyebrow">Ready to operate faster</span>
            <h2 className="text-[clamp(1.8rem,3vw,2.8rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[#081b36]">
              Give the team one customer-growth workspace instead of six tabs.
            </h2>
            <p className="max-w-[56ch] text-base leading-7 text-[#546a88]">
              CustomerAtlas connects customer value, revenue priorities,
              segmentation, and partner workflows in a single operating layer.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/install" className="ca-button-primary">
              Install app
            </Link>
            <Link href="/pricing" className="ca-button-secondary">
              View pricing
            </Link>
          </div>
        </div>

        <div className="ca-marketing-footer-grid">
          <div className="grid gap-4">
            <BrandMark subtitle="Shopify Revenue Intelligence" size={32} />
            <p className="max-w-[34ch] text-sm leading-6 text-[#546a88]">
              CustomerAtlas helps Shopify teams understand customer value,
              prioritize revenue moves, and run partner operations from one
              premium operating layer.
            </p>
            <div className="ca-footer-pill-row">
              <span className="ca-footer-pill">Revenue command center</span>
              <span className="ca-footer-pill">Predictive signals</span>
              <span className="ca-footer-pill">Partner ops</span>
            </div>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div
              key={section.title}
              className="grid gap-2 text-sm text-[#16345f]"
            >
              <h4 className="ca-footer-heading">{section.title}</h4>
              {section.links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="ca-footer-link"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="ca-marketing-footer-bottom">
          <p className="text-sm leading-6 text-[#5b7291]">
            © {currentYear} CustomerAtlas. Premium revenue intelligence for
            Shopify teams.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <Link href="/login" className="ca-footer-link">
              Sign in
            </Link>
            <Link href="/account/signup" className="ca-footer-link">
              Create account
            </Link>
            <Link href="/install" className="ca-footer-link">
              Install flow
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
