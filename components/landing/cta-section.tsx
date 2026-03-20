import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function CtaSection() {
  return (
    <section className="section-shell relative z-10 py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <Reveal variant="scale">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-violet-600/20 via-surface to-cyan-600/10 p-12 text-center sm:p-16">
          {/* Glow orbs */}
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-violet-500/20 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-cyan-500/15 blur-[60px]" />
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent" />

          <div className="relative">
            <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
              Ready to ship a better first impression?
            </p>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Stop guessing what visitors think.{" "}
              <span className="text-gradient">Start knowing.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/40">
              Join thousands of teams who use FirstVisit AI to catch UX problems
              before their visitors do.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/dashboard">
                <Button size="lg" className="group">
                  Start your free analysis
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <p className="text-sm text-white/30">
                No credit card required
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
