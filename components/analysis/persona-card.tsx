import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PersonaFeedback } from "@/types/analysis";

function mapSentiment(sentiment: PersonaFeedback["sentiment"]) {
  if (sentiment === "positive") {
    return "success" as const;
  }

  if (sentiment === "negative") {
    return "danger" as const;
  }

  return "warning" as const;
}

export function PersonaCard({ persona }: { persona: PersonaFeedback }) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{persona.persona}</CardTitle>
          <Badge variant={mapSentiment(persona.sentiment)}>
            {persona.sentiment}
          </Badge>
        </div>
        <p className="text-sm leading-relaxed text-white/40">{persona.summary}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm leading-relaxed text-white/50">
          {persona.concerns.map((concern) => (
            <li key={concern} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
              <span>{concern}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
