import { Card, CardContent } from "@/components/ui/card";
import { toPercent } from "@/lib/utils";

export function ScoreCard({
  label,
  score,
  description,
}: {
  label: string;
  score: number;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
          {label}
        </p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <p className="font-display text-5xl font-bold text-white">
            {toPercent(score)}
          </p>
          <div className="h-2 flex-1 rounded-full bg-white/[0.06]">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-white/40">{description}</p>
      </CardContent>
    </Card>
  );
}
