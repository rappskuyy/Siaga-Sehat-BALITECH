import { Link } from "@tanstack/react-router";
import logoSvg from "@/assets/siaga-sehat-logo.svg?url";

export function BrandLogo({
  className = "",
  size = "md",
  inverted = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
}) {
  const logoHeightClass =
    size === "sm"
      ? "h-20 sm:h-24 md:h-28"
      : size === "lg"
      ? "h-24 sm:h-32 md:h-36"
      : "h-20 sm:h-24 md:h-28";

  return (
    <Link to="/" className={`inline-flex items-center gap-2 shrink-0 ${className}`}>
      <img
        src={logoSvg}
        alt="SiagaSehat Logo"
        className={`${logoHeightClass} max-w-[380px] sm:max-w-[480px] w-auto object-contain drop-shadow-sm ${inverted ? "brightness-0 invert" : ""}`}
      />
    </Link>
  );
}
