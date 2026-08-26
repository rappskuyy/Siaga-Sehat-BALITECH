import type { ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";

export function Reveal({
  children,
  delay = "0s",
  className = "",
}: {
  children: ReactNode;
  delay?: string;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`${inView ? "animate-fade-up" : "opacity-0"} ${className}`}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );
}
