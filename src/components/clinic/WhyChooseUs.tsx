import { useEffect, useState } from "react";
import { Award, Clock, Smile, Target } from "lucide-react";
import { FloatingBadge } from "./FloatingBadge";
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
  const { ref: imageRef, inView: imageInView } = useInView<HTMLDivElement>();

  return (
    <section className="relative w-full overflow-hidden bg-[#f6efe6] p-6 md:p-10 lg:p-16">
      <span className="animate-float pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-[color:var(--color-clinic-blue)]/10 blur-3xl" />
      <span
        className="animate-float pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-[color:var(--color-clinic-blue)]/10 blur-3xl"
        style={{ animationDelay: "1.2s" }}
      />

      <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left: image */}
        <div ref={imageRef} className="relative overflow-hidden rounded-[24px] shadow-[var(--shadow-clinic-lg)]">
          <img
            src="https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=900&h=900&fit=crop"
            alt="Dua dokter"
            className={`h-[420px] w-full object-cover transition-transform duration-[1200ms] ease-out md:h-[540px] ${
              imageInView ? "scale-100" : "scale-110"
            }`}
          />
          <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur">
            Rasanya seperti
          </div>
          <FloatingBadge className="bottom-16 left-4">Dokter Berpengalaman</FloatingBadge>
          <FloatingBadge className="right-4 top-1/2 -translate-y-1/2" style={{ animationDelay: "0.7s" }}>
            Klinik Bersertifikat
          </FloatingBadge>
          <FloatingBadge className="bottom-24 right-4" style={{ animationDelay: "1.4s" }}>
            Peralatan Modern
          </FloatingBadge>
        </div>

        {/* Right: content */}
        <div className="flex flex-col text-[color:var(--color-clinic-ink)]">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.25em] text-[color:var(--color-clinic-muted)] shadow-sm backdrop-blur">
              [ Keunggulan ]
            </span>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-[56px]">
              Mengapa memilih kami
            </h2>
            <div className="mt-4 text-xs uppercase tracking-widest text-[color:var(--color-clinic-muted)]">
              Disediakan oleh
              <div className="mt-1 text-sm font-medium normal-case tracking-normal text-[color:var(--color-clinic-ink)]">
                Ahli medis berlisensi
              </div>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {STATS.map((s, i) => (
              <Reveal key={s.n} delay={`${i * 0.1}s`}>
                <div className="group h-full rounded-2xl bg-white/70 p-4 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-[var(--shadow-clinic)]">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-clinic-blue)] text-white transition group-hover:scale-110">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <StatNumber value={s.n} className="font-display text-4xl font-extrabold md:text-5xl" />
                  <div className="mt-2 text-sm font-semibold">{s.t}</div>
                  <p className="mt-1 text-xs leading-relaxed text-[color:var(--color-clinic-muted)]">
                    {s.tag && <span className="mr-1 font-semibold text-[color:var(--color-clinic-ink)]">{s.tag}</span>}
                    {s.d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
