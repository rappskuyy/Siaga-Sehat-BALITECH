import type { ReactNode } from "react";

export function FloatingCard({
  children,
  className = "",
  delay = "0s",
}: {
  children: ReactNode;
  className?: string;
  delay?: string;
}) {
  return (
    <div
      className={`animate-float pointer-events-none absolute rounded-2xl border border-black/5 bg-white/90 p-3.5 shadow-[0_16px_40px_rgba(17,17,17,0.10)] backdrop-blur-md ${className}`}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );
}
