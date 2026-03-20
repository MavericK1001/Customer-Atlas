import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase";
import { getUserUsage } from "@/lib/usage";
import { getRecentAnalyses } from "@/services/analysisService";
import { RecentAnalyses } from "@/components/dashboard/recent-analyses";
import { ScoreBadge } from "@/components/dashboard/score-badge";
import { UsageMeter } from "@/components/dashboard/usage-meter";
import { URLInput } from "@/components/dashboard/url-input";
import { UserNav } from "@/components/dashboard/user-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const [analyses, usage] = await Promise.all([
    getRecentAnalyses(user.id),
    getUserUsage(user.id),
  ]);

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
      {/* Dashboard header with user nav */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-display text-xl font-semibold text-white transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </div>
            FirstVisit
          </Link>
        </div>
        <UserNav email={user.email ?? ""} />
      </div>

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
          <UsageMeter usage={usage} />

          <Card className="border-violet-500/20 bg-gradient-to-b from-violet-500/[0.08] to-transparent">
            <CardHeader className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-widest text-violet-300">
                Score summary
              </p>
              <CardTitle className="text-3xl">Recent analysis averages</CardTitle>
              <p className="text-sm leading-relaxed text-white/40">
                Based on your latest stored reports.
              </p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <ScoreBadge label="Trust" score={averageScores.trust} />
              <ScoreBadge label="Clarity" score={averageScores.clarity} />
              <ScoreBadge label="Conversion" score={averageScores.conversion} />
            </CardContent>
          </Card>
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
