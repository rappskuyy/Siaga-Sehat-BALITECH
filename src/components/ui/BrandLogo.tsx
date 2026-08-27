import { Link } from "@tanstack/react-router";
import logoSvg from "@/assets/siaga-sehat-logo.svg?url";

export function BrandLogo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const logoHeightClass =
    size === "sm"
      ? "h-9 sm:h-11"
      : size === "lg"
      ? "h-14 sm:h-20 md:h-24"
      : "h-12 sm:h-16 md:h-20";

  return (
    <Link to="/" className={`inline-flex items-center gap-2 shrink-0 ${className}`}>
      <img
        src={logoSvg}
        alt="SiagaSehat Logo"
        className={`${logoHeightClass} max-w-[260px] sm:max-w-[340px] w-auto object-contain filter drop-shadow-2xs`}
      />
    </Link>
  );
}
