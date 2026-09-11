import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

type Segment =
  { type: "text"; text: string; className?: string } | { type: "node"; node: ReactNode };

const SEGMENTS: Segment[] = [
  { type: "text", text: "Kami menggabungkan " },
  { type: "text", text: "teknologi inovatif", className: "font-extrabold" },
<<<<<<< Updated upstream
=======
  { type: "text", text: " " },
  {
    type: "node",
    node: (
      <span className="mx-1 inline-flex h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 -translate-y-0.5 sm:-translate-y-1 items-center justify-center rounded-full bg-[color:var(--color-clinic-blue-soft)] align-middle text-[color:var(--color-clinic-blue)] shadow-2xs">
        <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
      </span>
    ),
  },
>>>>>>> Stashed changes
  { type: "text", text: " dengan pendekatan manusiawi untuk membuat setiap pasien " },
  { type: "text", text: "merasa percaya diri dan tenang.", className: "font-extrabold" },
];

function useTypewriter(segments: Segment[], active: boolean, speed = 16) {
  const [segIndex, setSegIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active || done) return;
    if (segIndex >= segments.length) {
      setDone(true);
      return;
    }
    const seg = segments[segIndex];
    if (seg.type === "node") {
      const t = setTimeout(() => {
        setSegIndex((i) => i + 1);
        setCharIndex(0);
      }, 200);
      return () => clearTimeout(t);
    }
    if (charIndex < seg.text.length) {
      const t = setTimeout(() => setCharIndex((c) => c + 1), speed);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setSegIndex((i) => i + 1);
      setCharIndex(0);
    }, 40);
    return () => clearTimeout(t);
  }, [active, done, segIndex, charIndex, segments, speed]);

  return { segIndex, charIndex, done };
}

export function Statement() {
  const { ref, inView } = useInView<HTMLParagraphElement>();
  const { segIndex, charIndex, done } = useTypewriter(SEGMENTS, inView);

  return (
    <section
      id="about"
      className="w-full bg-white px-4 py-10 text-center sm:px-6 md:px-8 md:py-14 lg:px-10"
    >
      <p
        ref={ref}
        className="mx-auto max-w-4xl font-display text-[clamp(1.35rem,5.8vw,2rem)] font-medium leading-snug text-[color:var(--color-clinic-ink)] md:text-3xl lg:text-[32px]"
      >
        {SEGMENTS.map((seg, i) => {
          if (i > segIndex) return null;
          if (seg.type === "node") {
            return (
              <span
                key={i}
                className="animate-fade-up inline-block"
                style={{ animationDuration: "0.4s" }}
              >
                {seg.node}
              </span>
            );
          }
          const text = i < segIndex ? seg.text : seg.text.slice(0, charIndex);
          return (
            <span key={i} className={seg.className}>
              {text}
            </span>
          );
        })}
        {!done && (
          <span className="ml-0.5 inline-block h-[0.9em] w-[3px] translate-y-[2px] animate-pulse bg-[color:var(--color-clinic-blue)]" />
        )}
      </p>

      <p className="mx-auto mt-3 max-w-xl text-sm text-[color:var(--color-clinic-muted)]">
        Dipercaya oleh masyarakat sejak 2026.
      </p>

      <Link
        to="/dev"
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/15 py-2 pl-6 pr-2 text-sm font-medium text-[color:var(--color-clinic-ink)] transition hover:bg-black/5"
      >
        Lebih lanjut tentang kami
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--color-clinic-ink)] text-white">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </Link>
    </section>
  );
}
