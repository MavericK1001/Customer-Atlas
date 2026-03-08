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
  iconSrc = "/logo/customeratlas-icon.svg",
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
        priority
        style={{
          borderRadius: "8px",
          objectFit: "cover",
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
