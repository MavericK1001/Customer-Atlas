import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ScoreBadge } from "@/components/dashboard/score-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { AnalysisListItem } from "@/types/analysis";

export function AnalysisCard({ analysis }: { analysis: AnalysisListItem }) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-violet-400">
              Website analysis
            </p>
            <CardTitle className="line-clamp-2 text-xl leading-8">
              {analysis.url}
            </CardTitle>
          </div>
          <Link
            href={`/analysis/${analysis.id}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:border-violet-500/30 hover:text-violet-400"
            aria-label="Open analysis"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="line-clamp-3 text-sm leading-relaxed text-white/40">
          {analysis.firstImpression}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <ScoreBadge label="Trust" score={analysis.trustScore} />
          <ScoreBadge label="Clarity" score={analysis.clarityScore} />
          <ScoreBadge label="Conversion" score={analysis.conversionScore} />
        </div>
        <p className="text-sm text-white/25">
          Generated {formatDate(analysis.createdAt)}
        </p>
      </CardContent>
    </Card>
  );
}
