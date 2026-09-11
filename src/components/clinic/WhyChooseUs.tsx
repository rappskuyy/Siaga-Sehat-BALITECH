import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe2,
  Leaf,
  ScanLine,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "./Reveal";
import { useInView } from "@/hooks/use-in-view";

function StatNumber({
  value,
  start,
  className = "",
}: {
  value: string;
  start: boolean;
  className?: string;
}) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? Number.parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : "";
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    setCount(0);
    const duration = 1000;
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
    <span className={`font-display font-extrabold tabular-nums ${className}`}>
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
      className="relative w-full overflow-hidden bg-white px-4 py-10 sm:px-6 md:px-8 md:py-20 lg:px-10"
    >
      {/* Lightweight GPU-accelerated ambient background glows */}
      <span className="pointer-events-none absolute -left-28 top-10 h-80 w-80 rounded-full bg-[color:var(--color-clinic-blue)]/5 blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
      <span className="pointer-events-none absolute -right-28 bottom-10 h-80 w-80 rounded-full bg-[color:var(--color-clinic-blue)]/5 blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <Reveal className="relative flex flex-col items-start text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-3.5 py-1 text-xs uppercase tracking-[0.25em] text-[color:var(--color-clinic-blue)] shadow-2xs">
            [ Keunggulan Platform ]
          </span>
          <h2 className="mt-3.5 font-display text-2xl font-extrabold leading-tight tracking-tight text-[color:var(--color-clinic-ink)] sm:text-3xl md:text-4xl lg:text-5xl">
            Mengapa memilih Siaga Sehat
          </h2>
          <p className="mt-3 max-w-xl text-xs leading-relaxed text-[color:var(--color-clinic-muted)] sm:text-sm md:text-base">
            Teknologi kesehatan pintar berbasis AI yang dirancang untuk membantu deteksi dini dan rekomendasi perawatan kesehatan Anda secara real-time.
          </p>
        </Reveal>

        {/* Clean Bento Showcase Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-5 md:mt-12 md:grid-cols-3">
          {/* Card 1: 500+ Pola Gejala AI (Hero Bento Card - 2 Columns) */}
          <Reveal className="md:col-span-2">
            <div className="group relative h-full overflow-hidden rounded-2xl sm:rounded-[28px] border border-[color:var(--color-clinic-blue)]/20 bg-gradient-to-br from-[color:var(--color-clinic-blue-soft)]/90 via-white to-sky-50/40 p-5 sm:p-6 md:p-8 shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-[color:var(--color-clinic-blue)]/12 hover:border-[color:var(--color-clinic-blue)]/35 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue)] px-3 py-1 text-[11px] sm:text-xs font-semibold text-white shadow-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                    </span>
                    <ScanLine className="h-3.5 w-3.5" />
                    Scan AI & Analisis Gejala
                  </span>
                  <span className="text-[11px] sm:text-xs font-medium text-[color:var(--color-clinic-muted)]">
                    Deteksi Dini Real-time
                  </span>
                </div>

                <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row sm:items-baseline sm:gap-5">
                  <StatNumber
                    value="500+"
                    start={inView}
                    className="text-4xl sm:text-5xl md:text-6xl text-[color:var(--color-clinic-blue-dark)] group-hover:scale-105 transition-transform duration-300 origin-left"
                  />
                  <div className="mt-1 sm:mt-0">
                    <h3 className="font-display text-lg sm:text-xl font-bold text-[color:var(--color-clinic-ink)] md:text-2xl">
                      Pola Gejala Teridentifikasi
                    </h3>
                    <p className="mt-1 max-w-md text-xs leading-relaxed text-[color:var(--color-clinic-muted)] sm:text-sm">
                      Sistem membandingkan foto dan keluhan medis Anda dengan ratusan pola indikasi gejala untuk rekomendasi awal secara praktis.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-[color:var(--color-clinic-blue)]/15 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-[color:var(--color-clinic-ink)] text-[11px] sm:text-xs">
                  <ShieldCheck className="h-4 w-4 text-[color:var(--color-clinic-blue)] group-hover:scale-110 transition-transform duration-300 shrink-0" />
                  Kalkulasi Tingkat Risiko (Rendah / Sedang / Tinggi)
                </span>
                <Link
                  to="/scanner"
                  className="group/link inline-flex items-center gap-1 font-bold text-[color:var(--color-clinic-blue-dark)] hover:underline text-xs"
                >
                  Coba Scan AI <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Card 2: Panduan Obat & Herbal Alami */}
          <Reveal delay="0.08s">
            <div className="group relative h-full overflow-hidden rounded-2xl sm:rounded-[24px] border border-black/[0.07] bg-white p-5 sm:p-6 shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-[color:var(--color-clinic-blue)]/35 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue-dark)] transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-6">
                    <Leaf className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--color-clinic-muted)]">
                    Edukasi Herbal
                  </span>
                </div>

                <div className="mt-4 sm:mt-5">
                  <StatNumber
                    value="100+"
                    start={inView}
                    className="text-3xl sm:text-4xl text-[color:var(--color-clinic-ink)] group-hover:text-[color:var(--color-clinic-blue-dark)] transition-colors duration-300"
                  />
                  <span className="ml-1.5 font-display text-sm sm:text-base font-bold text-[color:var(--color-clinic-ink)]">
                    Panduan Obat & Herbal
                  </span>
                  <p className="mt-2 text-xs leading-relaxed text-[color:var(--color-clinic-muted)]">
                    Informasi medis umum, penanganan awal mandiri, serta rekomendasi manfaat herbal alami untuk keluarga.
                  </p>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-[color:var(--color-clinic-blue-soft)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-clinic-blue-dark)] transition-all duration-200 hover:bg-[color:var(--color-clinic-blue)] hover:text-white cursor-default">
                  Obat Medis
                </span>
                <span className="rounded-md bg-[color:var(--color-clinic-blue-soft)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-clinic-blue-dark)] transition-all duration-200 hover:bg-[color:var(--color-clinic-blue)] hover:text-white cursor-default">
                  Herbal Alami
                </span>
                <span className="rounded-md bg-[color:var(--color-clinic-blue-soft)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-clinic-blue-dark)] transition-all duration-200 hover:bg-[color:var(--color-clinic-blue)] hover:text-white cursor-default">
                  Pengingat Obat
                </span>
              </div>
            </div>
          </Reveal>

          {/* Card 3: 98% Estimasi Akurasi Triase */}
          <Reveal delay="0.12s">
            <div className="group relative h-full overflow-hidden rounded-2xl sm:rounded-[24px] border border-black/[0.07] bg-white p-5 sm:p-6 shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-[color:var(--color-clinic-blue)]/35 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue-dark)] transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-6">
                    <Activity className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--color-clinic-muted)]">
                    Skrining AI
                  </span>
                </div>

                <div className="mt-4 sm:mt-5">
                  <StatNumber
                    value="98%"
                    start={inView}
                    className="text-3xl sm:text-4xl text-[color:var(--color-clinic-ink)] group-hover:text-[color:var(--color-clinic-blue-dark)] transition-colors duration-300"
                  />
                  <p className="mt-1 font-display text-sm sm:text-base font-bold text-[color:var(--color-clinic-ink)]">
                    Estimasi Akurasi Triase
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[color:var(--color-clinic-muted)]">
                    Tingkat pencocokan algoritma dalam memberikan gambaran risiko awal serta saran perawatan mandiri.
                  </p>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[color:var(--color-clinic-blue)]">
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">Rekomendasi Cepat</span>
                <span>Tingkat Lanjut</span>
              </div>
            </div>
          </Reveal>

          {/* Card 4: 24/7 Akses Digital Real-Time (Spans 2 Columns) */}
          <Reveal delay="0.16s" className="md:col-span-2">
            <div className="group relative h-full overflow-hidden rounded-2xl sm:rounded-[28px] border border-black/[0.07] bg-white p-5 sm:p-6 md:p-7 shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-[color:var(--color-clinic-blue)]/35 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6">
              <div className="flex-1 w-full min-w-0">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue-dark)] transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-6">
                    <Clock className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
                  </span>
                  <div className="min-w-0">
                    <span className="inline-block rounded-full bg-[color:var(--color-clinic-blue-soft)] px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-[color:var(--color-clinic-blue-dark)] truncate max-w-full">
                      Akses Web Real-Time
                    </span>
                    <p className="text-xs font-bold text-[color:var(--color-clinic-ink)] truncate">
                      Layanan Mandiri 24 Jam
                    </p>
                  </div>
                </div>

                <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3">
                  <span className="font-display text-4xl sm:text-5xl font-extrabold text-[color:var(--color-clinic-blue)] group-hover:scale-105 transition-transform duration-300 origin-left shrink-0">
                    24/7
                  </span>
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[color:var(--color-clinic-ink)]">
                      Akses Mandiri Kapan Saja
                    </h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-[color:var(--color-clinic-muted)]">
                      Dapat diakses 24 jam sehari langsung di browser tanpa perlu antre dan tanpa perlu instalasi aplikasi tambahan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Access highlight info box */}
              <div className="w-full lg:w-auto shrink-0 rounded-xl sm:rounded-2xl bg-[color:var(--color-clinic-blue-soft)]/60 p-3.5 sm:p-4 border border-[color:var(--color-clinic-blue)]/10 transition-all duration-300 group-hover:border-[color:var(--color-clinic-blue)]/25 group-hover:bg-[color:var(--color-clinic-blue-soft)]/90">
                <p className="text-xs font-bold text-[color:var(--color-clinic-ink)] flex items-center gap-1.5">
                  <Globe2 className="h-3.5 w-3.5 text-[color:var(--color-clinic-blue)] group-hover:rotate-12 transition-transform duration-300 shrink-0" />
                  Keunggulan Akses Web:
                </p>
                <div className="mt-2.5 flex flex-col gap-1.5 text-xs text-[color:var(--color-clinic-muted)]">
                  <span className="flex items-center gap-1.5 transition-transform duration-200 hover:translate-x-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--color-clinic-blue)] shrink-0" />
                    Tanpa Perlu Instal Aplikasi
                  </span>
                  <span className="flex items-center gap-1.5 transition-transform duration-200 hover:translate-x-1">
                    <Zap className="h-3.5 w-3.5 text-[color:var(--color-clinic-blue)] shrink-0" />
                    Respon Analisis Hitungan Detik
                  </span>
                  <span className="flex items-center gap-1.5 transition-transform duration-200 hover:translate-x-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--color-clinic-blue)] shrink-0" />
                    Gratis Digunakan Langsung
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
