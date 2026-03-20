import type { CrawlResult, HeuristicScores } from "@/types/analysis";

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreWebsiteSignals(crawl: CrawlResult): HeuristicScores {
  const hasClearTitle = crawl.title.length >= 12;
  const hasPrimaryHeading = crawl.headings.length > 0;
  const hasSupportingCopy = crawl.paragraphs.length >= 3;
  const hasNavigation = crawl.navigationLinks.length >= 3;
  const hasButtons = crawl.buttons.length > 0;

  let trustScore = 42;
  let clarityScore = 36;
  let conversionScore = 34;

  const highlights: string[] = [];
  const confusionPoints: string[] = [];
  const improvementSuggestions: string[] = [];

  if (hasClearTitle) {
    trustScore += 10;
    clarityScore += 10;
    highlights.push("The page title gives visitors a stronger initial frame of reference.");
  } else {
    confusionPoints.push("The page title is too short or generic to explain the value proposition quickly.");
    improvementSuggestions.push("Rewrite the page title to reflect the core offer in plain language.");
  }

  if (hasPrimaryHeading) {
    trustScore += 8;
    clarityScore += 16;
    highlights.push("Visible headings help a first-time visitor scan the page faster.");
  } else {
    confusionPoints.push("There is no strong headline hierarchy for a new visitor to anchor on.");
    improvementSuggestions.push("Add a clear H1 and supporting section headings to improve scannability.");
  }

  if (hasSupportingCopy) {
    trustScore += 10;
    clarityScore += 12;
    highlights.push("Supporting copy gives visitors more context about the product and offer.");
  } else {
    confusionPoints.push("The page has limited descriptive copy, which makes the offer harder to trust.");
    improvementSuggestions.push("Introduce concise paragraphs that explain what the product is and who it is for.");
  }

  if (hasNavigation) {
    trustScore += 12;
    conversionScore += 10;
    highlights.push("A visible navigation structure increases perceived legitimacy.");
  } else {
    confusionPoints.push("Sparse navigation can make the site feel incomplete or difficult to explore.");
    improvementSuggestions.push("Add a focused navigation with the key information paths customers expect.");
  }

  if (hasButtons) {
    clarityScore += 8;
    conversionScore += 18;
    highlights.push("Action-oriented buttons create a more obvious path toward conversion.");
  } else {
    confusionPoints.push("The page lacks visible calls to action, so visitors may not know what to do next.");
    improvementSuggestions.push("Add a primary CTA above the fold and repeat it after persuasive sections.");
  }

  if (crawl.headings.length >= 4) {
    clarityScore += 8;
    conversionScore += 6;
  }

  if (crawl.buttons.length >= 2) {
    conversionScore += 8;
  }

  if (crawl.paragraphs.some((paragraph) => /testimonial|security|trusted|customers|case study/i.test(paragraph))) {
    trustScore += 10;
    highlights.push("Trust signals appear in the body copy, which can reduce skepticism.");
  } else {
    confusionPoints.push("There are limited explicit trust indicators such as testimonials, guarantees, or customer proof.");
    improvementSuggestions.push("Introduce social proof, client logos, testimonials, or guarantees near the main CTA.");
  }

  return {
    trustScore: clampScore(trustScore),
    clarityScore: clampScore(clarityScore),
    conversionScore: clampScore(conversionScore),
    highlights,
    confusionPoints,
    improvementSuggestions
  };
}