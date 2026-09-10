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
      ? "h-12 sm:h-14 md:h-16 lg:h-18"
      : size === "lg"
        ? "h-24 sm:h-28 md:h-32 lg:h-36"
        : "h-16 sm:h-20 md:h-24 lg:h-28";

  return (
    <Link to="/" className={`inline-flex items-center gap-2 shrink-0 ${className}`}>
      <img
        src={logoSvg}
        alt="Siaga Sehat Logo"
        loading="eager"
        decoding="async"
        className={`${logoHeightClass} w-auto object-contain drop-shadow-sm ${inverted ? "brightness-0 invert" : ""}`}
      />
    </Link>
  );
}
