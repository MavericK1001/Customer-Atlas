import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

const plans = [
  {
    name: "Free",
    price: "$0",
    cadence: "/month",
    description: "Try the workflow — no credit card required.",
    features: [
      "3 analyses per month",
      "Core trust & clarity scores",
      "Single persona summary",
    ],
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$29",
    cadence: "/month",
    description: "For teams iterating on their website weekly.",
    features: [
      "30 analyses per month",
      "Full journey simulation",
      "Multi-persona feedback",
      "Export-ready PDF reports",
    ],
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$99",
    cadence: "/month",
    description: "For agencies auditing multiple client sites.",
    features: [
      "Unlimited analyses",
      "Team workspace & sharing",
      "Priority AI processing",
      "Advanced report history",
      "Custom persona profiles",
    ],
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="section-shell relative z-10 py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
          Pricing
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Start free, scale when you&apos;re ready
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-white/40">
          Every plan includes AI-powered analysis. Upgrade for more volume,
          richer reports, and team features.
        </p>
      </Reveal>

      <div className="mx-auto mt-16 grid max-w-5xl gap-4 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <Reveal key={plan.name} delay={index * 100} variant="scale">
            <div
              className={`relative flex h-full flex-col rounded-2xl border p-6 transition-all duration-500 ${
                plan.highlighted
                  ? "border-violet-500/30 bg-gradient-to-b from-violet-500/[0.08] to-transparent shadow-glow"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-1 text-xs font-semibold text-white">
                  Most popular
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-white/60">{plan.name}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm text-white/30">{plan.cadence}</span>
                </div>
                <p className="mt-3 text-sm text-white/40">{plan.description}</p>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-white/60"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/dashboard" className="mt-8 block">
                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                >
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
