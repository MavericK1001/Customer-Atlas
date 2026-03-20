import { Badge } from "@/components/ui/badge";
import { cn, toPercent } from "@/lib/utils";

function getVariant(
  score: number,
): "success" | "warning" | "danger" | "default" {
  if (score >= 75) {
    return "success";
  }

  if (score >= 55) {
    return "warning";
  }

  return "danger";
}

export function ScoreBadge({
  label,
  score,
  className,
}: {
  label: string;
  score: number;
  className?: string;
}) {
  return (
    <Badge variant={getVariant(score)} className={cn("gap-2", className)}>
      <span>{label}</span>
      <span>{toPercent(score)}</span>
    </Badge>
  );
}
