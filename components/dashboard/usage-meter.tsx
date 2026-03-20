import Link from "next/link";
import { Zap } from "lucide-react";
import type { UsageInfo } from "@/lib/usage";

export function UsageMeter({ usage }: { usage: UsageInfo }) {
  const isUnlimited = usage.plan.analysesPerMonth === -1;
  const percentage = isUnlimited
    ? 0
    : Math.min(100, (usage.usedThisMonth / usage.plan.analysesPerMonth) * 100);
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = usage.limitReached;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              isAtLimit
                ? "bg-rose-500/20"
                : "bg-violet-500/20"
            }`}
          >
            <Zap
              className={`h-4 w-4 ${
                isAtLimit ? "text-rose-400" : "text-violet-400"
              }`}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {usage.plan.planName} plan
            </p>
            <p className="text-xs text-white/30">
              {isUnlimited
                ? `${usage.usedThisMonth} analyses this month`
                : `${usage.usedThisMonth} of ${usage.plan.analysesPerMonth} analyses used`}
            </p>
          </div>
        </div>

        {!isUnlimited && usage.plan.planId === "free" && (
          <Link
            href="#pricing"
            className="rounded-full bg-gradient-to-r from-violet-600 to-violet-500 px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            Upgrade
          </Link>
        )}
      </div>

      {/* Progress bar — hidden for unlimited */}
      {!isUnlimited && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAtLimit
                  ? "bg-rose-500"
                  : isNearLimit
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-violet-500 to-cyan-400"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          {isAtLimit && (
            <p className="mt-2 text-xs text-rose-400">
              Monthly limit reached. Upgrade to keep analyzing.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
