import { getCurrentUser } from "@/lib/supabase";
import { getRecentAnalyses } from "@/services/analysisService";
import { RecentAnalyses } from "@/components/dashboard/recent-analyses";
import { ScoreBadge } from "@/components/dashboard/score-badge";
import { AuthPanel } from "@/components/dashboard/auth-panel";
import { URLInput } from "@/components/dashboard/url-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const analyses = await getRecentAnalyses(user?.id);

  const averageScores = analyses.length
    ? {
        trust: Math.round(
          analyses.reduce((sum, item) => sum + item.trustScore, 0) /
            analyses.length,
        ),
        clarity: Math.round(
          analyses.reduce((sum, item) => sum + item.clarityScore, 0) /
            analyses.length,
        ),
        conversion: Math.round(
          analyses.reduce((sum, item) => sum + item.conversionScore, 0) /
            analyses.length,
        ),
      }
    : { trust: 0, clarity: 0, conversion: 0 };

  return (
    <main className="section-shell py-10 sm:py-14">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
              Dashboard
            </p>
            <CardTitle className="text-4xl">
              Run a new first-visit analysis
            </CardTitle>
            <p className="max-w-2xl text-base leading-relaxed text-white/40">
              Submit any public website and receive an AI-generated report with
              first-impression feedback, trust signals, confusion points, and
              journey simulation.
            </p>
          </CardHeader>
          <CardContent>
            <URLInput />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-violet-500/20 bg-gradient-to-b from-violet-500/[0.08] to-transparent">
            <CardHeader className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-widest text-violet-300">
                Score summary
              </p>
              <CardTitle className="text-3xl">
                Recent analysis averages
              </CardTitle>
              <p className="text-sm leading-relaxed text-white/40">
                {user
                  ? "Based on your latest stored reports."
                  : "Guest mode. Sign in to keep a personal history."}
              </p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <ScoreBadge label="Trust" score={averageScores.trust} />
              <ScoreBadge label="Clarity" score={averageScores.clarity} />
              <ScoreBadge label="Conversion" score={averageScores.conversion} />
            </CardContent>
          </Card>
          <AuthPanel userEmail={user?.email} />
        </div>
      </div>

      <section className="mt-12 space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
            History
          </p>
          <h2 className="font-display text-3xl font-bold text-white">
            Previous analyses
          </h2>
        </div>
        <RecentAnalyses analyses={analyses} />
      </section>
    </main>
  );
}
