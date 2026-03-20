"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type RevealVariant = "up" | "fade" | "scale";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  once?: boolean;
  threshold?: number;
  variant?: RevealVariant;
}

export function Reveal({
  children,
  className,
  delay = 0,
  once = true,
  threshold = 0.18,
  variant = "up",
  style,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);

          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [once, threshold]);

  return (
    <div
      ref={ref}
      className={cn(
        "motion-reveal",
        variant === "up" && "motion-reveal-up",
        variant === "fade" && "motion-reveal-fade",
        variant === "scale" && "motion-reveal-scale",
        isVisible && "motion-visible",
        className,
      )}
      style={{
        transitionDelay: `${delay}ms`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
