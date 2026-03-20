import { AnalysisCard } from "@/components/dashboard/analysis-card";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalysisListItem } from "@/types/analysis";

export function RecentAnalyses({ analyses }: { analyses: AnalysisListItem[] }) {
  if (!analyses.length) {
    return (
      <Card className="border-dashed border-white/10">
        <CardContent className="p-8 text-center">
          <p className="font-display text-2xl font-semibold text-white">
            No analyses yet
          </p>
          <p className="mt-3 text-white/40">
            Run your first website audit from the URL input above to build a
            history of first-visit reports.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {analyses.map((analysis) => (
        <AnalysisCard key={analysis.id} analysis={analysis} />
      ))}
    </div>
  );
}
