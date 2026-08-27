import { useEffect, useState } from "react";
import { Activity, Award, Clock, Target, type LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";
import { useInView } from "@/hooks/use-in-view";

interface StatItem {
  n: string;
  t: string;
  d: string;
  icon: LucideIcon;
  accent: string;
}

// Unified to the site's two signature accents (Scan cyan / Konsultasi violet) plus the
// primary clinic blue in two shades — no off-brand hues.
const STATS: StatItem[] = [
  {
    n: "10+",
    t: "Tahun pengalaman",
    d: "Kami telah beroperasi sejak 2012, meningkatkan kualitas layanan setiap hari.",
    icon: Clock,
    accent: "var(--color-clinic-blue-dark)",
  },
  {
    n: "15+",
    t: "Bidang spesialisasi",
    d: "Ruang lingkup klinis luas ditambah laboratorium lengkap dalam satu bangunan.",
    icon: Award,
    accent: "var(--color-siaga-consult-dim)",
  },
  {
    n: "98%",
    t: "Akurasi diagnostik",
    d: "Skor akurasi triase awal Scan AI, dievaluasi berkala oleh tim medis.",
    icon: Target,
    accent: "var(--color-siaga-scan-dim)",
  },
  {
    n: "95%",
    t: "Pasien puas",
    d: "Menurut survei internal terhadap pengguna aktif tahun lalu.",
    icon: Activity,
    accent: "var(--color-clinic-blue)",
  },
];

const AUTO_ADVANCE_MS = 3800;

function StatNumber({ value, color }: { value: string; color: string }) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? Number.parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : "";
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <span
      className="font-display text-3xl font-extrabold tabular-nums md:text-4xl"
      style={{ color }}
    >
      {count}
      {suffix}
    </span>
  );
}

/** A single looping ECG trace — two copies laid side by side and scrolled for a seamless loop. */
function EcgTrace({ color }: { color: string }) {
  const path =
    "M0,40 L60,40 L80,40 L95,10 L110,70 L125,20 L140,40 L200,40 L260,40 L280,40 L295,10 L310,70 L325,20 L340,40 L400,40";

  return (
    <div className="relative h-16 w-full overflow-hidden">
      <div className="animate-vitals-scroll absolute inset-y-0 left-0 flex w-[200%]">
        {[0, 1].map((i) => (
          <svg key={i} viewBox="0 0 400 80" preserveAspectRatio="none" className="h-full w-1/2">
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-[stroke] duration-500"
            />
          </svg>
        ))}
      </div>
      {/* fade edges so the loop seam is invisible */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#0a0e18] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#0a0e18] to-transparent" />
    </div>
  );
}

export function WhyChooseUs() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const { ref, inView } = useInView<HTMLDivElement>();

  useEffect(() => {
    if (paused || !inView) return;
    const t = setInterval(() => setActive((a) => (a + 1) % STATS.length), AUTO_ADVANCE_MS);
    return () => clearInterval(t);
  }, [paused, inView]);

  const activeStat = STATS[active];

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-white px-6 py-16 md:px-10 md:py-24"
    >
      <span className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-[color:var(--color-siaga-scan)]/[0.06] blur-3xl" />
      <span className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-[color:var(--color-siaga-consult)]/[0.07] blur-3xl" />

      <Reveal className="relative mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-3 py-1 text-xs uppercase tracking-[0.25em] text-[color:var(--color-clinic-blue)]">
          [ Keunggulan ]
        </span>
        <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-[color:var(--color-clinic-ink)] md:text-5xl">
          Mengapa memilih kami
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[color:var(--color-clinic-muted)]">
          Empat angka yang jadi alasan orang mempercayakan kesehatannya pada kami — dipantau
          langsung seperti tanda vital.
        </p>
      </Reveal>

      {/* Signature element: a "vitals monitor" panel, grounded in the clinic's own instruments */}
      <Reveal delay="0.08s" className="relative mx-auto mt-12 max-w-4xl">
        <div className="overflow-hidden rounded-[28px] bg-[#0a0e18] p-5 shadow-[0_30px_70px_rgba(10,14,24,0.35)] md:p-7">
          {/* Monitor header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="animate-vitals-blink h-2 w-2 rounded-full"
                style={{ backgroundColor: activeStat.accent }}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                SiagaSehat · Live Trust Index
              </span>
            </div>
            <span
              key={active}
              className="animate-fade-up font-mono text-[10px] text-white/40"
              style={{ animationDuration: "0.3s" }}
            >
              {activeStat.t}
            </span>
          </div>

          {/* Waveform, tinted to the active stat */}
          <div className="mt-3">
            <EcgTrace color={activeStat.accent} />
          </div>

          {/* Readout tiles */}
          <div
            className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3"
            onMouseLeave={() => setPaused(false)}
          >
            {STATS.map((s, i) => {
              const isActive = i === active;
              return (
                <button
                  key={s.t}
                  type="button"
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setPaused(true)}
                  className="group relative flex flex-col items-start gap-1.5 rounded-2xl border p-3 text-left transition-all duration-300 md:p-4"
                  style={{
                    borderColor: isActive ? s.accent : "rgba(255,255,255,0.08)",
                    backgroundColor: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                  }}
                >
                  <s.icon
                    className="h-4 w-4 transition-colors"
                    style={{ color: isActive ? s.accent : "rgba(255,255,255,0.4)" }}
                  />
                  <StatNumber value={s.n} color={isActive ? s.accent : "white"} />
                  <span className="text-[10px] leading-tight text-white/45 md:text-[11px]">
                    {s.t}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* Active stat detail — crossfades beneath the monitor */}
      <Reveal
        key={`desc-${active}`}
        delay="0.05s"
        className="mx-auto mt-6 max-w-2xl rounded-2xl border border-black/5 p-4 text-center text-xs leading-relaxed text-[color:var(--color-clinic-muted)] md:text-sm"
      >
        <span className="font-semibold" style={{ color: activeStat.accent }}>
          {activeStat.t}:
        </span>{" "}
        {activeStat.d}
      </Reveal>
    </section>
  );
}
