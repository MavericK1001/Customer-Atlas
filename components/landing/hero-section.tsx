import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

import { HeroScene } from "@/components/landing/hero-scene";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

const socialProof = [
  "2,400+ websites analyzed",
  "Trusted by 80+ SaaS teams",
  "4.9/5 avg rating",
];

export function HeroSection() {
  return (
    <section className="section-shell relative z-10 pb-16 pt-16 sm:pt-24 lg:pt-32">
      {/* Background glow orbs */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(ellipse,rgba(139,92,246,0.18),transparent_70%)]" />
      <div className="pointer-events-none absolute right-0 top-20 -z-10 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.1),transparent_70%)]" />

      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center">
          {/* Pill badge */}
          <Reveal delay={80}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-white/60 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              AI-powered website analysis is live
            </div>
          </Reveal>

          {/* Headline */}
          <Reveal delay={160} className="mt-8">
            <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl xl:text-[5.2rem]">
              Your website has <span className="text-gradient">8 seconds</span>{" "}
              to make a first impression
            </h1>
          </Reveal>

          {/* Subheadline */}
          <Reveal delay={240} className="mt-6">
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/50 sm:text-xl">
              FirstVisit AI simulates real visitors and tells you exactly what
              they think, what confuses them, and why they leave — before you
              lose another customer.
            </p>
          </Reveal>

          {/* CTA buttons */}
          <Reveal
            delay={320}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Link href="/dashboard">
              <Button size="lg" className="group w-full sm:w-auto">
                Analyze your website free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                See how it works
              </Button>
            </Link>
          </Reveal>

          {/* Social proof */}
          <Reveal delay={400} className="mt-10">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/35">
              {socialProof.map((item, i) => (
                <div key={item} className="flex items-center gap-2">
                  {i === 2 ? (
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ) : (
                    <div className="h-1 w-1 rounded-full bg-white/20" />
                  )}
                  {item}
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Hero visual */}
        <Reveal delay={300} variant="scale" className="mt-16 sm:mt-20">
          <HeroScene />
        </Reveal>
      </div>
    </section>
  );
}
