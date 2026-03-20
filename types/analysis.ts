import { z } from "zod";

export const analysisRequestSchema = z.object({
  url: z
    .string()
    .trim()
    .url("Enter a valid URL including https://")
    .refine((value) => /^https?:\/\//.test(value), {
      message: "URL must begin with http:// or https://"
    })
});

export const personaFeedbackSchema = z.object({
  persona: z.string(),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  summary: z.string(),
  concerns: z.array(z.string())
});

export const journeyStepSchema = z.object({
  step: z.string(),
  reaction: z.string(),
  friction: z.string().optional(),
  opportunity: z.string().optional()
});

export const aiAnalysisSchema = z.object({
  websiteOverview: z.string(),
  firstImpression: z.string(),
  whatVisitorThinks: z.string(),
  trustLevelSummary: z.string(),
  trustScore: z.number().min(0).max(100),
  clarityScore: z.number().min(0).max(100),
  conversionScore: z.number().min(0).max(100),
  likelihoodOfLeaving: z.number().min(0).max(100),
  confusionPoints: z.array(z.string()),
  confusingElements: z.array(z.string()).optional(),
  improvementSuggestions: z.array(z.string()),
  personaFeedback: z.array(personaFeedbackSchema),
  journeySimulation: z.array(journeyStepSchema)
});

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
export type PersonaFeedback = z.infer<typeof personaFeedbackSchema>;
export type JourneyStep = z.infer<typeof journeyStepSchema>;
export type AIAnalysis = z.infer<typeof aiAnalysisSchema>;

export interface CrawlResult {
  url: string;
  title: string;
  headings: string[];
  paragraphs: string[];
  navigationLinks: string[];
  buttons: string[];
  screenshotBase64: string;
}

export interface HeuristicScores {
  trustScore: number;
  clarityScore: number;
  conversionScore: number;
  highlights: string[];
  confusionPoints: string[];
  improvementSuggestions: string[];
}

export interface AnalysisRecord extends AIAnalysis {
  id: string;
  userId: string | null;
  url: string;
  createdAt: string;
  rawCrawl?: Omit<CrawlResult, "screenshotBase64">;
}

export interface AnalysisListItem {
  id: string;
  url: string;
  trustScore: number;
  clarityScore: number;
  conversionScore: number;
  firstImpression: string;
  createdAt: string;
}