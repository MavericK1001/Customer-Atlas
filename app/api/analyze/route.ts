import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/supabase";
import { assertCanAnalyze, logUsage } from "@/lib/usage";
import { analyzeWebsite } from "@/services/analysisService";
import { analysisRequestSchema } from "@/types/analysis";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = analysisRequestSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request payload." },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Sign in to run an analysis." },
        { status: 401 }
      );
    }

    // Check usage limit before running (throws 429 if exceeded)
    await assertCanAnalyze(user.id);

    const analysisId = await analyzeWebsite({
      url: parsed.data.url,
      userId: user.id
    });

    // Log the usage event after successful analysis
    await logUsage(user.id, "analysis", { url: parsed.data.url, analysisId });

    return NextResponse.json({ analysisId }, { status: 201 });
  } catch (error) {
    const status = (error as any)?.status ?? 500;
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Analysis failed unexpectedly."
      },
      { status }
    );
  }
}