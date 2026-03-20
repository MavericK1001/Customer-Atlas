import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-[0_0_20px_-4px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_-4px_rgba(139,92,246,0.65)] hover:-translate-y-0.5",
        secondary:
          "bg-white text-gray-950 shadow-soft hover:-translate-y-0.5 hover:bg-white/90",
        outline:
          "border border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.06] hover:text-white hover:border-white/20",
        ghost: "text-white/60 hover:bg-white/[0.04] hover:text-white/90",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4",
        lg: "h-12 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);

Button.displayName = "Button";

export { Button, buttonVariants };
