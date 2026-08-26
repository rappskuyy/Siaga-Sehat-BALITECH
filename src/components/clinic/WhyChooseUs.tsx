import { useEffect, useState } from "react";
import { ArrowUpRight, Award, Clock, Smile, Target } from "lucide-react";
import { Reveal } from "./Reveal";
import { useInView } from "@/hooks/use-in-view";

const STATS = [
  {
    n: "10+",
    t: "Tahun pengalaman",
    d: "Kami telah beroperasi sejak 2012, meningkatkan kualitas layanan setiap hari.",
    icon: Clock,
  },
  {
    n: "15+",
    t: "Bidang spesialisasi",
    d: "Ruang lingkup klinis luas ditambah laboratorium lengkap dalam satu bangunan.",
    icon: Award,
  },
  { n: "95%", t: "Pasien puas", d: "Menurut survei internal tahun lalu.", icon: Smile },
  {
    n: "98%",
    t: "Akurasi diagnostik",
    d: "Berkat peralatan modern.",
    tag: "Faktanya:",
    icon: Target,
  },
];

function StatNumber({ value, className }: { value: string; className?: string }) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? Number.parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : "";
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1100;
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
  }, [inView, target]);

  return (
    <span ref={ref} className={className}>
      {count}
      {suffix}
    </span>
  );
}

export function WhyChooseUs() {
  return (
    <section className="relative w-full overflow-hidden bg-[color:var(--color-clinic-blue-soft)] px-6 py-16 md:px-10 md:py-24 lg:px-16">
      <div className="absolute right-0 top-0 h-full w-1/3 bg-[color:var(--color-clinic-blue)]/[0.06]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--color-clinic-blue)]">Kenapa SiagaSehat</span>
            <h2 className="mt-5 max-w-md font-display text-5xl font-extrabold leading-[0.98] tracking-tight text-[color:var(--color-clinic-ink)] md:text-6xl">Kesehatan dimulai dari rasa ingin tahu.</h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-[color:var(--color-clinic-muted)]">Kami membantu kamu membaca sinyal tubuh dengan lebih jernih, sebelum memutuskan langkah yang tepat.</p>
            <a href="#faq" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[color:var(--color-clinic-blue)] transition hover:gap-3">Kenali lebih dekat <ArrowUpRight className="h-4 w-4" /></a>
          </Reveal>

          <div className="border-t border-[color:var(--color-clinic-blue)]/25">
            {[
              ["01", "Berbasis informasi", "Penjelasan disusun dari keluhan, foto, dan konteks yang kamu berikan."],
              ["02", "Dibuat untuk langkah awal", "Skrining membantu kamu memahami kapan cukup memantau dan kapan perlu mencari bantuan."],
              ["03", "Tetap mengutamakan manusia", "Teknologi memberi arah, tenaga medis tetap menjadi tujuan untuk keputusan klinis."],
            ].map(([number, title, description], index) => (
              <Reveal key={number} delay={`${index * 0.1}s`}>
                <div className="group grid grid-cols-[52px_1fr] gap-5 border-b border-[color:var(--color-clinic-blue)]/25 py-6 md:grid-cols-[72px_1fr] md:gap-8 md:py-8">
                  <span className="font-display text-sm font-bold text-[color:var(--color-clinic-blue)]">{number}</span>
                  <div><h3 className="font-display text-xl font-extrabold text-[color:var(--color-clinic-ink)] transition group-hover:text-[color:var(--color-clinic-blue)] md:text-2xl">{title}</h3><p className="mt-2 max-w-lg text-sm leading-relaxed text-[color:var(--color-clinic-muted)]">{description}</p></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 border-y border-[color:var(--color-clinic-blue)]/25 md:grid-cols-4">
          {STATS.map((stat, index) => (
            <Reveal key={stat.n} delay={`${index * 0.08}s`}>
              <div className="border-r border-[color:var(--color-clinic-blue)]/25 px-4 py-6 first:pl-0 last:border-r-0 md:px-7 md:py-8">
                <div className="flex items-center gap-2 text-[color:var(--color-clinic-blue)]"><stat.icon className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-widest">Terukur</span></div>
                <StatNumber value={stat.n} className="mt-3 block font-display text-3xl font-extrabold text-[color:var(--color-clinic-ink)] md:text-4xl" />
                <p className="mt-1 text-xs font-semibold text-[color:var(--color-clinic-muted)]">{stat.t}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
