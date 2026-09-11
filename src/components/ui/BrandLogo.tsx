import { Link } from "@tanstack/react-router";
import logoSvg from "@/assets/Siaga Sehat.svg";

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
      ? "h-14 sm:h-16 md:h-16 lg:h-18"
      : size === "lg"
        ? "h-26 sm:h-30 md:h-34 lg:h-38"
        : "h-18 sm:h-22 md:h-24 lg:h-28";

  return (
    <Link to="/" className={`inline-flex items-center gap-2 shrink-0 ${className}`}>
      <img
        src={logoSvg}
        alt="Siaga Sehat Logo"
        loading="eager"
        decoding="async"
        className={`${logoHeightClass} w-auto object-contain drop-shadow-xs transition-transform duration-200 hover:scale-[1.02] ${
          inverted ? "brightness-0 invert" : ""
        }`}
      />
    </Link>
  );
}
