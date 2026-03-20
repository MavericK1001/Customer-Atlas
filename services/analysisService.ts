import { randomUUID } from "crypto";

import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai";
import { crawlWebsite } from "@/lib/crawler";
import { scoreWebsiteSignals } from "@/lib/scoring";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  aiAnalysisSchema,
  type AIAnalysis,
  type AnalysisListItem,
  type AnalysisRecord,
  type CrawlResult,
  type HeuristicScores
} from "@/types/analysis";

interface PersistedRow {
  id: string;
  user_id: string | null;
  url: string;
  website_overview: string;
  first_impression: string;
  what_visitor_thinks: string;
  trust_level_summary: string;
  trust_score: number;
  clarity_score: number;
  conversion_score: number;
  likelihood_of_leaving: number;
  confusion_points: string[];
  improvement_suggestions: string[];
  persona_feedback: AIAnalysis["personaFeedback"];
  journey_simulation: AIAnalysis["journeySimulation"];
  raw_crawl: Omit<CrawlResult, "screenshotBase64">;
  created_at: string;
}

function buildAnalysisPrompt(crawl: CrawlResult, heuristic: HeuristicScores) {
  return [
    "Act like a first-time website visitor evaluating a SaaS product.",
    "Be concrete, skeptical, and conversion-focused.",
    "Return JSON only using the requested schema.",
    "",
    `URL: ${crawl.url}`,
    `Page Title: ${crawl.title}`,
    `Headings: ${crawl.headings.join(" | ") || "None found"}`,
    `Paragraphs: ${crawl.paragraphs.join(" | ") || "None found"}`,
    `Navigation Links: ${crawl.navigationLinks.join(" | ") || "None found"}`,
    `Buttons / CTAs: ${crawl.buttons.join(" | ") || "None found"}`,
    "",
    `Heuristic Trust Score: ${heuristic.trustScore}`,
    `Heuristic Clarity Score: ${heuristic.clarityScore}`,
    `Heuristic Conversion Score: ${heuristic.conversionScore}`,
    `Heuristic Confusion Points: ${heuristic.confusionPoints.join(" | ") || "None"}`,
    `Heuristic Suggestions: ${heuristic.improvementSuggestions.join(" | ") || "None"}`,
    "",
    "Respond with JSON using these keys:",
    "websiteOverview, firstImpression, whatVisitorThinks, trustLevelSummary, trustScore, clarityScore, conversionScore, likelihoodOfLeaving, confusionPoints, improvementSuggestions, personaFeedback, journeySimulation",
    "",
    "personaFeedback must be an array of 3 objects with keys persona, sentiment, summary, concerns.",
    "journeySimulation must be an array of 4 to 6 objects with keys step, reaction, friction, opportunity."
  ].join("\n");
}

async function generateAnalysisWithOpenAI(crawl: CrawlResult, heuristic: HeuristicScores) {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are FirstVisit AI, an expert in first-impression UX analysis. Evaluate websites like a real first-time customer and output strict JSON only."
      },
      {
        role: "user",
        content: buildAnalysisPrompt(crawl, heuristic)
      }
    ]
  });

  const rawContent = completion.choices[0]?.message?.content;

  if (!rawContent) {
    throw new Error("OpenAI returned an empty response.");
  }

  return aiAnalysisSchema.parse(JSON.parse(rawContent));
}

function generateFallbackAnalysis(crawl: CrawlResult, heuristic: HeuristicScores): AIAnalysis {
  const firstHeading = crawl.headings[0] ?? crawl.title;

  return {
    websiteOverview: `${crawl.title} appears to position itself around ${firstHeading.toLowerCase()}, with emphasis on ${crawl.buttons[0]?.toLowerCase() ?? "guiding the visitor toward the next step"}.`,
    firstImpression:
      heuristic.clarityScore >= 65
        ? "The offer feels fairly understandable on first glance, although sharper differentiation would still help."
        : "The page gives some signal about the product, but a first-time visitor would still need to work to understand the core value.",
    whatVisitorThinks: `A new visitor is likely to think this site is about ${firstHeading.toLowerCase()}, but may still question who it is specifically for and what outcome it promises.`,
    trustLevelSummary:
      heuristic.trustScore >= 65
        ? "The page has enough structure and trust cues to feel credible, though stronger proof points could deepen confidence."
        : "The page does not yet deliver enough trust-building detail for a cautious buyer to feel fully confident.",
    trustScore: heuristic.trustScore,
    clarityScore: heuristic.clarityScore,
    conversionScore: heuristic.conversionScore,
    likelihoodOfLeaving: Math.max(10, 100 - heuristic.conversionScore),
    confusionPoints: heuristic.confusionPoints,
    confusingElements: heuristic.confusionPoints,
    improvementSuggestions: heuristic.improvementSuggestions,
    personaFeedback: [
      {
        persona: "Busy decision-maker",
        sentiment: heuristic.clarityScore >= 60 ? "neutral" : "negative",
        summary: "Needs the value proposition to land immediately and will abandon if the page feels vague.",
        concerns: heuristic.confusionPoints.slice(0, 2)
      },
      {
        persona: "Risk-aware buyer",
        sentiment: heuristic.trustScore >= 60 ? "neutral" : "negative",
        summary: "Looks for proof, legitimacy, and evidence before taking any next step.",
        concerns: [
          "Wants testimonials, recognisable brands, or trust assurances.",
          ...heuristic.confusionPoints.slice(0, 1)
        ]
      },
      {
        persona: "Action-oriented evaluator",
        sentiment: heuristic.conversionScore >= 60 ? "positive" : "neutral",
        summary: "Will convert if the CTA is obvious, low-friction, and tied to a clear outcome.",
        concerns: [
          "Needs a more explicit next step and expected result.",
          ...heuristic.confusionPoints.slice(1, 2)
        ].filter(Boolean)
      }
    ],
    journeySimulation: [
      {
        step: "Landing on the homepage",
        reaction: "The visitor scans the headline, hero copy, and top navigation to understand the offer.",
        friction: heuristic.confusionPoints[0],
        opportunity: "Clarify the product promise within the first screen."
      },
      {
        step: "Evaluating trust",
        reaction: "The visitor looks for proof that the business is credible and established.",
        friction: heuristic.confusionPoints[1],
        opportunity: "Place trust signals adjacent to the main CTA."
      },
      {
        step: "Comparing options",
        reaction: "The visitor checks whether the site explains why this solution is better than alternatives.",
        opportunity: "Add sharper differentiation with customer outcomes and benefits."
      },
      {
        step: "Deciding whether to act",
        reaction: "The visitor decides based on CTA clarity, perceived risk, and how much effort the next step requires.",
        friction: "Any ambiguity around pricing, outcomes, or the next step increases bounce risk.",
        opportunity: "Reduce friction with one high-confidence CTA and supportive proof." 
      }
    ]
  };
}

function mapRowToAnalysis(row: PersistedRow): AnalysisRecord {
  return {
    id: row.id,
    userId: row.user_id,
    url: row.url,
    websiteOverview: row.website_overview,
    firstImpression: row.first_impression,
    whatVisitorThinks: row.what_visitor_thinks,
    trustLevelSummary: row.trust_level_summary,
    trustScore: row.trust_score,
    clarityScore: row.clarity_score,
    conversionScore: row.conversion_score,
    likelihoodOfLeaving: row.likelihood_of_leaving,
    confusionPoints: row.confusion_points,
    improvementSuggestions: row.improvement_suggestions,
    personaFeedback: row.persona_feedback,
    journeySimulation: row.journey_simulation,
    createdAt: row.created_at,
    rawCrawl: row.raw_crawl
  };
}

export async function analyzeWebsite(input: { url: string; userId?: string | null }) {
  const crawl = await crawlWebsite(input.url);
  const heuristic = scoreWebsiteSignals(crawl);
  const analysis = process.env.OPENAI_API_KEY
    ? await generateAnalysisWithOpenAI(crawl, heuristic)
    : generateFallbackAnalysis(crawl, heuristic);

  const row: Omit<PersistedRow, "created_at"> = {
    id: randomUUID(),
    user_id: input.userId ?? null,
    url: crawl.url,
    website_overview: analysis.websiteOverview,
    first_impression: analysis.firstImpression,
    what_visitor_thinks: analysis.whatVisitorThinks,
    trust_level_summary: analysis.trustLevelSummary,
    trust_score: analysis.trustScore,
    clarity_score: analysis.clarityScore,
    conversion_score: analysis.conversionScore,
    likelihood_of_leaving: analysis.likelihoodOfLeaving,
    confusion_points: analysis.confusionPoints,
    improvement_suggestions: analysis.improvementSuggestions,
    persona_feedback: analysis.personaFeedback,
    journey_simulation: analysis.journeySimulation,
    raw_crawl: {
      url: crawl.url,
      title: crawl.title,
      headings: crawl.headings,
      paragraphs: crawl.paragraphs,
      navigationLinks: crawl.navigationLinks,
      buttons: crawl.buttons
    }
  };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("analyses").insert(row);

  if (error) {
    throw new Error(`Failed to persist analysis: ${error.message}`);
  }

  return row.id;
}

export async function getAnalysisById(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("analyses").select("*").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(`Failed to fetch analysis: ${error.message}`);
  }

  return mapRowToAnalysis(data as PersistedRow);
}

export async function getRecentAnalyses(userId?: string | null): Promise<AnalysisListItem[]> {
  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("analyses")
      .select("id, url, trust_score, clarity_score, conversion_score, first_impression, created_at")
      .order("created_at", { ascending: false })
      .limit(6);

    if (userId) {
      query = query.eq("user_id", userId);
    } else {
      query = query.is("user_id", null);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []).map((item) => ({
      id: item.id,
      url: item.url,
      trustScore: item.trust_score,
      clarityScore: item.clarity_score,
      conversionScore: item.conversion_score,
      firstImpression: item.first_impression,
      createdAt: item.created_at
    }));
  } catch {
    return [];
  }
}