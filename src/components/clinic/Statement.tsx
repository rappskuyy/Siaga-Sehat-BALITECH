import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

const AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=60&h=60&fit=crop&crop=faces",
];

type Segment =
  { type: "text"; text: string; className?: string } | { type: "node"; node: ReactNode };

const SEGMENTS: Segment[] = [
  { type: "text", text: "Kami menggabungkan " },
  { type: "text", text: "teknologi inovatif", className: "font-extrabold" },
  { type: "text", text: " " },
  {
    type: "node",
    node: (
      <span className="mx-1 inline-flex h-9 w-9 -translate-y-1 items-center justify-center rounded-full bg-[color:var(--color-clinic-blue-soft)] align-middle text-[color:var(--color-clinic-blue)]">
        <Sparkles className="h-4 w-4" />
      </span>
    ),
  },
  { type: "text", text: " dengan pendekatan manusiawi untuk membuat setiap pasien " },
  {
    type: "node",
    node: (
      <span className="mx-1 inline-flex -translate-y-1 items-center align-middle">
        <span className="flex -space-x-2">
          {AVATARS.map((a) => (
            <img
              key={a}
              src={a}
              alt=""
              className="h-8 w-8 rounded-full border-2 border-white object-cover"
            />
          ))}
        </span>
      </span>
    ),
  },
  { type: "text", text: " " },
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
      className="w-full bg-white px-5 py-10 text-center sm:px-6 md:px-8 md:py-14 lg:px-10"
    >
      <p
        ref={ref}
        className="mx-auto max-w-4xl font-display text-2xl font-medium leading-snug text-[color:var(--color-clinic-ink)] md:text-3xl lg:text-[32px]"
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
        Dipercaya oleh masyarakat sejak 2020.
      </p>

      <a
        href="#about"
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/15 py-2 pl-6 pr-2 text-sm font-medium text-[color:var(--color-clinic-ink)] transition hover:bg-black/5"
      >
        Lebih lanjut tentang kami
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--color-clinic-ink)] text-white">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </a>
    </section>
  );
}
