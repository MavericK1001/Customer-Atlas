import Image from "next/image";

type BrandMarkProps = {
  compact?: boolean;
  size?: number;
  subtitle?: string;
};

export function BrandMark({
  compact = false,
  size = 32,
  subtitle,
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
        src="/logo/customeratlaslogo.png"
        alt="CustomerAtlas logo"
        width={size}
        height={size}
        priority
        style={{
          borderRadius: "8px",
          objectFit: "cover",
        }}
      />
      <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.1 }}>
        <span style={{ fontWeight: 700, letterSpacing: "-0.02em", color: "#0b1c36" }}>
          CustomerAtlas
        </span>
        {!compact && subtitle ? (
          <span style={{ fontSize: "0.75rem", color: "#4a5f78", letterSpacing: "0.02em" }}>
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}