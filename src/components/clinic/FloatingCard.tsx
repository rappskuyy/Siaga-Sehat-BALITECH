import type { CSSProperties, ReactNode } from "react";

export function FloatingCard({
  children,
  className = "",
  delay = "0s",
  style = {},
}: {
  children: ReactNode;
  className?: string;
  delay?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`animate-float pointer-events-none absolute rounded-2xl border border-black/5 bg-white/90 p-3 shadow-[0_16px_40px_rgba(17,17,17,0.10)] backdrop-blur-md sm:p-3.5 ${className}`}
      style={{ animationDelay: delay, ...style }}
    >
      {children}
    </div>
  );
}
