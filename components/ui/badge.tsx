import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-violet-500/15 text-violet-300 border border-violet-500/20",
        success:
          "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20",
        warning: "bg-amber-500/15 text-amber-300 border border-amber-500/20",
        danger: "bg-rose-500/15 text-rose-300 border border-rose-500/20",
        neutral: "bg-white/5 text-white/60 border border-white/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
