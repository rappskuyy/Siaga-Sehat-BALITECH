import { Link } from "@tanstack/react-router";
import logoSvg from "@/assets/siaga-sehat-logo.svg";

export function BrandLogo({
  className = "",
  size = "md",
  inverted = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
}) {
  const width = size === "sm" ? 140 : size === "lg" ? 220 : 180;
  const height = size === "sm" ? 36 : size === "lg" ? 56 : 46;

  const logoHeightClass =
    size === "sm"
      ? "h-9 sm:h-10 md:h-11"
      : size === "lg"
        ? "h-16 sm:h-20 md:h-24"
        : "h-12 sm:h-14 md:h-16";

  return (
    <Link to="/" className={`inline-flex items-center gap-2 shrink-0 ${className}`}>
      <img
        src={logoSvg}
        alt="Siaga Sehat Logo"
        width={width}
        height={height}
        loading="eager"
        decoding="async"
        className={`${logoHeightClass} max-w-[380px] sm:max-w-[480px] w-auto object-contain drop-shadow-sm ${inverted ? "brightness-0 invert" : ""}`}
      />
    </Link>
  );
}
