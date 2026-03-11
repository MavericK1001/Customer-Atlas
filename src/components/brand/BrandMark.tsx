"use client";

import Image from "next/image";

type BrandMarkProps = {
  compact?: boolean;
  size?: number;
  subtitle?: string;
  iconOnly?: boolean;
  iconSrc?: string;
};

export function BrandMark({
  compact = false,
  size = 32,
  subtitle,
  iconOnly = false,
  iconSrc = "/logo/CustomerAtlasLogo.png",
}: BrandMarkProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? "8px" : "10px",
      }}
    >
      <Image
        src={iconSrc}
        alt="CustomerAtlas logo"
        width={size}
        height={size}
        sizes={`${size}px`}
        unoptimized
        priority
        onError={(event) => {
          const target = event.currentTarget;
          if (target.dataset.fallbackApplied === "1") {
            return;
          }

          target.dataset.fallbackApplied = "1";
          target.src = "/favicon.ico";
        }}
        style={{
          display: "block",
          borderRadius: "8px",
          objectFit: "contain",
          background: "linear-gradient(140deg, #eaf4ff, #d0e6ff)",
          border: "1px solid rgba(11, 106, 207, 0.2)",
          boxShadow: "0 8px 18px rgba(11, 106, 207, 0.28)",
        }}
      />
      {iconOnly ? null : (
        <span
          style={{
            display: "inline-flex",
            flexDirection: "column",
            lineHeight: 1.1,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#0b1c36",
            }}
          >
            CustomerAtlas
          </span>
          {!compact && subtitle ? (
            <span
              style={{
                fontSize: "0.75rem",
                color: "#4a5f78",
                letterSpacing: "0.02em",
              }}
            >
              {subtitle}
            </span>
          ) : null}
        </span>
      )}
    </span>
  );
}
