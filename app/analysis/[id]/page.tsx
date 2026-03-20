import { notFound } from "next/navigation";

import { FeedbackCard } from "@/components/analysis/feedback-card";
import { JourneyTimeline } from "@/components/analysis/journey-timeline";
import { PersonaCard } from "@/components/analysis/persona-card";
import { ScoreCard } from "@/components/analysis/score-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getAnalysisById } from "@/services/analysisService";

export default async function AnalysisPage({
  params,
}: {
  params: { id: string };
}) {
  const analysis = await getAnalysisById(params.id);

  if (!analysis) {
    notFound();
  }

  return (
    <main className="section-shell py-10 sm:py-14">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
              Website overview
            </p>
            <CardTitle className="text-4xl leading-tight">
              {analysis.url}
            </CardTitle>
            <p className="max-w-2xl text-base leading-relaxed text-white/40">
              {analysis.websiteOverview}
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <ScoreCard
              label="Trust Score"
              score={analysis.trustScore}
              description={analysis.trustLevelSummary}
            />
            <ScoreCard
              label="Clarity Score"
              score={analysis.clarityScore}
              description={analysis.whatVisitorThinks}
            />
            <ScoreCard
              label="Conversion Score"
              score={analysis.conversionScore}
              description={`Estimated leaving likelihood: ${analysis.likelihoodOfLeaving}%`}
            />
          </CardContent>
        </Card>

        <Card className="border-violet-500/20 bg-gradient-to-b from-violet-500/[0.08] to-transparent">
          <CardHeader className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-widest text-violet-300">
              First impression
            </p>
            <CardTitle className="text-3xl">
              {analysis.firstImpression}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-white/40">
              Generated {formatDate(analysis.createdAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="mt-10 grid gap-6 xl:grid-cols-2">
        <FeedbackCard
          title="Confusion Points"
          items={analysis.confusionPoints}
        />
        <FeedbackCard
          title="Improvement Suggestions"
          items={analysis.improvementSuggestions}
        />
      </section>

      <section className="mt-10 space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
            AI personas feedback
          </p>
          <h2 className="font-display text-3xl font-bold text-white">
            How different visitors react
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {analysis.personaFeedback.map((persona) => (
            <PersonaCard key={persona.persona} persona={persona} />
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
            Simulated user journey
          </p>
          <h2 className="font-display text-3xl font-bold text-white">
            A step-by-step first-visit path
          </h2>
        </div>
        <JourneyTimeline steps={analysis.journeySimulation} />
      </section>
    </main>
  );
}
