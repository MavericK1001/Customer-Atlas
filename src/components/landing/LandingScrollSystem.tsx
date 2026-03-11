"use client";

import { useEffect } from "react";

export function LandingScrollSystem(): null {
  useEffect(() => {
    const root = document.documentElement;
    let ticking = false;

    const updateProgress = (): void => {
      const scrollTop = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      root.style.setProperty("--ca-scroll-progress", percent.toFixed(2));
      ticking = false;
    };

    const onScroll = (): void => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(updateProgress);
    };

    const revealNodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          entry.target.classList.add("ca-in-view");
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    for (const node of revealNodes) {
      observer.observe(node);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return null;
}
