"use client";

import { useRef } from "react";
import {
  AlertTriangle,
  ChartSpline,
  Eye,
  MousePointerClick,
  ScanSearch,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";

const scores = [
  { label: "Trust", value: 78, color: "from-violet-500 to-violet-400" },
  { label: "Clarity", value: 71, color: "from-cyan-500 to-cyan-400" },
  { label: "Conversion", value: 64, color: "from-emerald-500 to-emerald-400" },
];

const issues = [
  {
    icon: AlertTriangle,
    text: "CTA appears before enough trust is established",
    severity: "high",
  },
  {
    icon: Eye,
    text: "Product promise is implied, not clearly stated",
    severity: "medium",
  },
  {
    icon: MousePointerClick,
    text: "Too many competing actions in viewport",
    severity: "medium",
  },
];

const journey = [
  { step: "1", label: "Land", desc: "Scans headline", icon: ScanSearch },
  { step: "2", label: "Evaluate", desc: "Seeks proof", icon: ShieldCheck },
  { step: "3", label: "Decide", desc: "CTA or leave", icon: TrendingUp },
];

export function HeroScene() {
  const sceneRef = useRef<HTMLDivElement | null>(null);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const el = sceneRef.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    const x = ((event.clientX - b.left) / b.width - 0.5) * 2;
    const y = ((event.clientY - b.top) / b.height - 0.5) * 2;
    el.style.setProperty("--scene-rotate-x", `${(-y * 2.5).toFixed(2)}deg`);
    el.style.setProperty("--scene-rotate-y", `${(x * 4).toFixed(2)}deg`);
    el.style.setProperty("--scene-shift-x", `${(x * 8).toFixed(2)}px`);
    el.style.setProperty("--scene-shift-y", `${(y * 8).toFixed(2)}px`);
  }

  function resetScene() {
    const el = sceneRef.current;
    if (!el) return;
    el.style.setProperty("--scene-rotate-x", "0deg");
    el.style.setProperty("--scene-rotate-y", "0deg");
    el.style.setProperty("--scene-shift-x", "0px");
    el.style.setProperty("--scene-shift-y", "0px");
  }

  return (
    <div
      ref={sceneRef}
      className="hero-scene group relative isolate overflow-hidden rounded-2xl border border-white/[0.08] bg-surface p-1"
      style={{
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.03), 0 40px 100px -40px rgba(139,92,246,0.2), 0 0 80px -30px rgba(6,182,212,0.1)",
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetScene}
    >
      {/* Top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-2/3 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="hero-layer hero-layer--panel rounded-xl bg-surface-light">
        {/* Browser chrome */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-white/10" />
            <span className="h-3 w-3 rounded-full bg-white/10" />
            <span className="h-3 w-3 rounded-full bg-white/10" />
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs text-white/30">
            <ChartSpline className="h-3.5 w-3.5" />
            firstvisit.ai/analysis — Live simulation
          </div>
          <div className="w-16" />
        </div>

        {/* Content area */}
        <div className="grid gap-px bg-white/[0.03] lg:grid-cols-[1.3fr_0.7fr]">
          {/* Left panel — main analysis */}
          <div className="relative overflow-hidden p-6 sm:p-8">
            {/* Subtle radial glow */}
            <div className="pointer-events-none absolute -top-20 left-1/2 h-60 w-80 -translate-x-1/2 rounded-full bg-violet-500/[0.07] blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                <Eye className="h-3.5 w-3.5" />
                First Impression Score
              </div>

              <p className="mt-5 text-2xl font-semibold leading-snug text-white sm:text-3xl">
                &ldquo;Premium enough to explore. Not yet clear enough to trust
                immediately.&rdquo;
              </p>

              <p className="mt-3 text-sm leading-relaxed text-white/40">
                The layout creates a strong first look, but the product story
                needs sharper clarity and faster proof.
              </p>

              {/* Score cards */}
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {scores.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
                  >
                    <p className="text-xs font-medium uppercase tracking-widest text-white/40">
                      {s.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-white">
                      {s.value}
                    </p>
                    <div className="mt-3 h-1 rounded-full bg-white/[0.06]">
                      <div
                        className={cn(
                          "h-1 rounded-full bg-gradient-to-r",
                          s.color,
                        )}
                        style={{ width: `${s.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel — issues + journey */}
          <div className="flex flex-col border-l border-white/[0.04]">
            {/* Issues */}
            <div className="border-b border-white/[0.04] p-5 sm:p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-rose-400/80">
                Issues detected
              </p>
              <div className="mt-4 space-y-3">
                {issues.map((issue) => {
                  const Icon = issue.icon;
                  return (
                    <div
                      key={issue.text}
                      className="flex items-start gap-3 rounded-lg bg-white/[0.02] p-3"
                    >
                      <div
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                          issue.severity === "high"
                            ? "bg-rose-500/15 text-rose-400"
                            : "bg-amber-500/15 text-amber-400",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-sm leading-snug text-white/60">
                        {issue.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Journey */}
            <div className="flex-1 p-5 sm:p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-cyan-400/80">
                Visitor journey
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {journey.map((j) => {
                  const Icon = j.icon;
                  return (
                    <div
                      key={j.step}
                      className="hero-layer flex items-center gap-3 rounded-lg bg-white/[0.02] p-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-xs font-bold text-white/70">
                        {j.step}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white/80">
                          {j.label}
                        </p>
                        <p className="text-xs text-white/35">{j.desc}</p>
                      </div>
                      <Icon className="h-4 w-4 text-white/20" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
