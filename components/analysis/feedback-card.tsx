import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FeedbackCard({
  title,
  body,
  items,
}: {
  title: string;
  body?: string;
  items?: string[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {body ? (
          <p className="text-sm leading-relaxed text-white/40">{body}</p>
        ) : null}
        {items?.length ? (
          <ul className="space-y-3 text-sm leading-relaxed text-white/50">
            {items.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
