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
  accentSoft: string;
}

// Unified to the site's two signature accents (Scan cyan / Konsultasi blue) plus the
// primary clinic blue in two shades — no off-brand hues.
const STATS: StatItem[] = [
  {
    n: "10+",
    t: "Tahun pengalaman",
    d: "Beroperasi sejak 2012, meningkatkan kualitas layanan setiap hari.",
    icon: Clock,
    accent: "var(--color-clinic-blue-dark)",
    accentSoft: "var(--color-clinic-blue-soft)",
  },
  {
    n: "15+",
    t: "Bidang spesialisasi",
    d: "Ruang lingkup klinis luas ditambah laboratorium lengkap dalam satu gedung.",
    icon: Award,
    accent: "var(--color-siaga-consult-dim)",
    accentSoft: "color-mix(in srgb, var(--color-siaga-consult) 14%, white)",
  },
  {
    n: "98%",
    t: "Akurasi diagnostik",
    d: "Skor akurasi triase awal Scan AI, dievaluasi berkala oleh tim medis.",
    icon: Target,
    accent: "var(--color-siaga-scan-dim)",
    accentSoft: "color-mix(in srgb, var(--color-siaga-scan) 14%, white)",
  },
  {
    n: "95%",
    t: "Pasien puas",
    d: "Berdasarkan survei internal terhadap pengguna aktif tahun lalu.",
    icon: Activity,
    accent: "var(--color-clinic-blue)",
    accentSoft: "var(--color-clinic-blue-soft)",
  },
];

function StatNumber({ value, color, start }: { value: string; color: string; start: boolean }) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? Number.parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : "";
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    setCount(0);
    const duration = 900;
    const startTime = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start]);

  return (
    <span className="font-display text-3xl font-extrabold tabular-nums" style={{ color }}>
      {count}
      {suffix}
    </span>
  );
}

export function WhyChooseUs() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section
      id="doctors"
      ref={ref}
      className="relative w-full overflow-hidden bg-white px-5 py-14 sm:px-6 md:px-8 md:py-20 lg:px-10"
    >
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-clinic-blue)]">
            Keunggulan Kami
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-[color:var(--color-clinic-ink)] md:text-4xl">
            Mengapa memilih kami
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[color:var(--color-clinic-muted)]">
            Beberapa angka yang menjadi alasan orang mempercayakan kesehatannya pada kami.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mt-12">
          {STATS.map((s, i) => (
            <Reveal key={s.t} delay={`${i * 0.06}s`}>
              <div className="group h-full rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-clinic)]">
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl"
                  style={{ backgroundColor: s.accentSoft }}
                >
                  <s.icon className="h-5 w-5" style={{ color: s.accent }} />
                </span>
                <div className="mt-4">
                  <StatNumber value={s.n} color={s.accent} start={inView} />
                </div>
                <p className="mt-1.5 text-sm font-bold text-[color:var(--color-clinic-ink)]">
                  {s.t}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[color:var(--color-clinic-muted)]">
                  {s.d}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
