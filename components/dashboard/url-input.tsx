"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, WandSparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analysisRequestSchema } from "@/types/analysis";

export function URLInput() {
  const router = useRouter();
  const [url, setUrl] = useState("https://");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function submitAnalysis() {
    const parsed = analysisRequestSchema.safeParse({ url });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid URL.");
      return;
    }

    setError(null);

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
    });

    const payload = (await response.json()) as {
      analysisId?: string;
      error?: string;
    };

    if (!response.ok || !payload.analysisId) {
      setError(payload.error ?? "Analysis could not be completed.");
      return;
    }

    router.push(`/analysis/${payload.analysisId}`);
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(() => {
          void submitAnalysis();
        });
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="url"
          name="url"
          aria-label="Website URL"
          placeholder="https://yourwebsite.com"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className="sm:flex-1"
        />
        <Button
          type="submit"
          size="lg"
          className="sm:min-w-[220px]"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <WandSparkles className="mr-2 h-4 w-4" />
          )}
          Start analysis
        </Button>
      </div>
      <p className="text-sm text-white/30">
        Enter a public homepage URL to generate a first-visit report.
      </p>
      {error ? (
        <p className="text-sm font-medium text-rose-400">{error}</p>
      ) : null}
    </form>
  );
}
