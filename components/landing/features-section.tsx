import { Blocks, Eye, Map, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";

const features = [
  {
    icon: Eye,
    title: "AI Visitor Simulation",
    description:
      "A synthetic visitor browses your site and reports back what they understood, what confused them, and what made them want to leave.",
    gradient: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-400",
  },
  {
    icon: TrendingUp,
    title: "Conversion Prediction",
    description:
      "Get a data-backed estimate of how likely a first-time visitor is to convert, with specific friction points identified.",
    gradient: "from-cyan-500/20 to-cyan-500/5",
    iconColor: "text-cyan-400",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Clarity Scores",
    description:
      "Measure how trustworthy and clear your site appears in the first 8 seconds, based on 30+ UX signals.",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-400",
  },
  {
    icon: Map,
    title: "Journey Simulation",
    description:
      "See the exact steps a first-time visitor takes: where they look, what they click, and where they drop off.",
    gradient: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-400",
  },
  {
    icon: Sparkles,
    title: "Persona Feedback",
    description:
      "Get perspective from multiple AI personas — the skeptic buyer, the quick scanner, and the methodical researcher.",
    gradient: "from-rose-500/20 to-rose-500/5",
    iconColor: "text-rose-400",
  },
  {
    icon: Zap,
    title: "Instant Reports",
    description:
      "Full analysis in under 60 seconds. No browser extensions, no code changes, no waiting for human reviewers.",
    gradient: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-400",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="section-shell relative z-10 py-28">
      {/* Divider glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
          Features
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Everything you need to ship{" "}
          <span className="text-gradient">better first impressions</span>
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-white/40">
          From AI simulation to actionable scores — one workflow replaces hours
          of manual UX review.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Reveal key={feature.title} delay={index * 80}>
              <div className="group relative h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500 hover:border-white/[0.1] hover:bg-white/[0.04]">
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}
                >
                  <Icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
