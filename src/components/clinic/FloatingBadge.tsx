import type { ReactNode } from "react";

export function FloatingBadge({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-float pointer-events-none absolute rounded-full bg-white/70 px-4 py-2 text-xs font-medium text-[color:var(--color-clinic-ink)] shadow-[0_10px_30px_rgba(0,0,0,0.10)] backdrop-blur-md ring-1 ring-white/60 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}