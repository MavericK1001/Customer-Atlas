import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/supabase";
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
    const analysisId = await analyzeWebsite({
      url: parsed.data.url,
      userId: user?.id
    });

    return NextResponse.json({ analysisId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Analysis failed unexpectedly."
      },
      { status: 500 }
    );
  }
}