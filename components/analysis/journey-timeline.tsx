import type { JourneyStep } from "@/types/analysis";

export function JourneyTimeline({ steps }: { steps: JourneyStep[] }) {
  return (
    <ol className="space-y-6">
      {steps.map((step, index) => (
        <li key={`${step.step}-${index}`} className="relative flex gap-5">
          <div className="relative flex flex-col items-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 font-display text-lg font-bold text-white">
              {index + 1}
            </span>
            {index < steps.length - 1 ? (
              <span className="mt-3 h-full w-px bg-white/[0.06]" />
            ) : null}
          </div>
          <div className="flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <h3 className="font-display text-xl font-semibold text-white">
              {step.step}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/40">
              {step.reaction}
            </p>
            {step.friction ? (
              <p className="mt-3 rounded-xl bg-rose-500/10 px-4 py-3 text-sm leading-relaxed text-rose-300 border border-rose-500/20">
                <strong>Friction:</strong> {step.friction}
              </p>
            ) : null}
            {step.opportunity ? (
              <p className="mt-3 rounded-xl bg-cyan-500/10 px-4 py-3 text-sm leading-relaxed text-cyan-300 border border-cyan-500/20">
                <strong>Opportunity:</strong> {step.opportunity}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
