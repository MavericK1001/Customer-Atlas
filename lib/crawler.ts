import { chromium } from "playwright";

import type { CrawlResult } from "@/types/analysis";

function normalizeUrl(input: string) {
  const candidate = input.trim();
  return candidate.startsWith("http://") || candidate.startsWith("https://")
    ? candidate
    : `https://${candidate}`;
}

export async function crawlWebsite(url: string): Promise<CrawlResult> {
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1080 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    });
    const page = await context.newPage();
    const normalizedUrl = normalizeUrl(url);

    await page.goto(normalizedUrl, {
      timeout: 45_000,
      waitUntil: "networkidle"
    });

    const extracted = await page.evaluate(() => {
      const textFromElements = (selector: string, limit: number) =>
        Array.from(document.querySelectorAll(selector))
          .map((element) => element.textContent?.trim() ?? "")
          .filter(Boolean)
          .slice(0, limit);

      const navigationLinks = Array.from(document.querySelectorAll("nav a, header a"))
        .map((element) => element.textContent?.trim() ?? "")
        .filter(Boolean)
        .slice(0, 12);

      return {
        title: document.title?.trim() ?? "Untitled page",
        headings: textFromElements("h1, h2, h3", 16),
        paragraphs: textFromElements("p", 18),
        buttons: textFromElements("button, a[role='button'], input[type='submit']", 12),
        navigationLinks
      };
    });

    const screenshot = await page.screenshot({ fullPage: true, type: "jpeg", quality: 70 });

    return {
      url: normalizedUrl,
      title: extracted.title,
      headings: extracted.headings,
      paragraphs: extracted.paragraphs,
      navigationLinks: extracted.navigationLinks,
      buttons: extracted.buttons,
      screenshotBase64: screenshot.toString("base64")
    };
  } finally {
    await browser.close();
  }
}