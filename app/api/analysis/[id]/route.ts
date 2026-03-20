import { NextResponse } from "next/server";
import { z } from "zod";

import { getAnalysisById } from "@/services/analysisService";

const paramsSchema = z.object({
  id: z.string().uuid("Analysis id must be a valid UUID.")
});

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: { id: string } }) {
  try {
    const parsed = paramsSchema.safeParse(context.params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid id." },
        { status: 400 }
      );
    }

    const analysis = await getAnalysisById(parsed.data.id);

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to fetch analysis."
      },
      { status: 500 }
    );
  }
}