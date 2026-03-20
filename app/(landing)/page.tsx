import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CtaSection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="noise-overlay" />

      <Reveal variant="fade" className="section-shell relative z-10" delay={60}>
        <header className="flex items-center justify-between py-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-display text-xl font-semibold text-white transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </div>
            FirstVisit
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-white/50 md:flex">
            <Link
              className="transition-colors duration-300 hover:text-white"
              href="#features"
            >
              Features
            </Link>
            <Link
              className="transition-colors duration-300 hover:text-white"
              href="#pricing"
            >
              Pricing
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Dashboard
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </nav>
        </header>
      </Reveal>

      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <CtaSection />

      {/* Footer */}
      <footer className="section-shell relative z-10 border-t border-white/[0.04] py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5 font-display text-lg font-semibold text-white/60">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/50 to-cyan-400/50">
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 text-white/80"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </div>
            FirstVisit
          </div>
          <p className="text-sm text-white/30">
            &copy; {new Date().getFullYear()} FirstVisit AI. Ship better first
            impressions.
          </p>
        </div>
      </footer>
    </main>
  );
}
