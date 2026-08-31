import { ArrowUpRight, MessageCircleHeart, ScanLine, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import fotodokter2 from "@/assets/fotodokter(2).png?url";
import { FloatingCard } from "./FloatingCard";
import { SiteHeader } from "@/components/layout/SiteHeader";

const AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=80&h=80&fit=crop&crop=faces",
];

const MINI_STATS = [
  { n: "10+", l: "tahun pengalaman" },
  { n: "20+", l: "dokter bersertifikat" },
  { n: "100%", l: "diagnostik digital" },
];

export function Hero() {
  return (
    <>
      <SiteHeader />
      <section className="relative w-full overflow-hidden bg-white px-5 pt-5 pb-8 sm:px-6 md:px-8 md:pt-7 md:pb-14 lg:px-10 lg:pt-8 lg:pb-16">
        {/* Body */}
        <div className="relative mx-auto mt-7 grid max-w-6xl gap-10 sm:gap-8 lg:mt-8 lg:grid-cols-[1.05fr_1.1fr_0.85fr] lg:items-start lg:gap-5">
          {/* Left column: headline + CTA + proof card */}
          <div className="relative z-10 flex flex-col justify-start">
            <h1 className="font-display text-5xl font-extrabold leading-[0.9] tracking-tight text-[color:var(--color-clinic-ink)] sm:text-[56px] md:text-[68px] lg:text-[76px]">
              Siaga
              <br />
              Sehat
            </h1>

            <p className="mt-4 max-w-[320px] text-sm leading-relaxed text-[color:var(--color-clinic-muted)]">
              <span className="font-semibold text-[color:var(--color-clinic-ink)]">
                Kami tidak hanya mengobati gejala
              </span>{" "}
              — kami peduli dengan setiap orang, didukung skrining AI yang cepat dan akurat.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <a
                href="#doctors"
                className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue)] py-1.5 pl-5 pr-1.5 text-sm font-medium text-white shadow-lg shadow-[color:var(--color-clinic-blue)]/30 transition hover:bg-[color:var(--color-clinic-blue-dark)]"
              >
                Cari Dokter
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[color:var(--color-clinic-blue)] transition group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </a>
              <Link
                to="/scanner"
                className="group inline-flex items-center gap-2 rounded-full border border-[color:var(--color-clinic-blue)]/30 py-1.5 pl-5 pr-1.5 text-sm font-medium text-[color:var(--color-clinic-ink)] transition hover:bg-[color:var(--color-clinic-blue-soft)] lg:hidden"
              >
                Scan AI
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
                  <ScanLine className="h-4 w-4" />
                </span>
              </Link>
            </div>

            <div className="mt-8 md:mt-12">
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white p-3 shadow-[var(--shadow-clinic)] sm:gap-3 md:p-4">
                {MINI_STATS.map((s, i) => (
                  <div
                    key={s.n}
                    className="animate-fade-up flex h-full flex-col justify-center border-l border-black/5 pl-3 first:border-l-0 first:pl-0"
                    style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                  >
                    <div className="font-display text-xl font-extrabold text-[color:var(--color-clinic-ink)] sm:text-2xl md:text-[28px] md:leading-none">
                      {s.n}
                    </div>
                    <div className="mt-1.5 text-[11px] leading-tight text-[color:var(--color-clinic-muted)]">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center column: doctor photo pulled up close to the header, with floating AI feature cards */}
          <div className="relative order-first flex justify-center lg:order-none lg:-mt-6">
            <div className="relative inline-flex h-[400px] max-w-full items-end sm:h-[440px] md:h-[500px] lg:h-[580px]">
              <img
                src={fotodokter2}
                alt="Dokter dengan stetoskop"
                className="h-full max-h-[860px] w-auto object-contain object-bottom"
              />

              <FloatingCard
                className="left-0 top-0 w-[min(150px,calc(100vw-56px))] sm:-left-2 sm:w-[168px] md:-left-8 md:w-[180px]"
                delay="0s"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-[color:var(--color-clinic-muted)]">
                    Progres Pemulihanmu
                  </span>
                  <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--color-siaga-scan-dim)]" />
                </div>
                <p className="mt-1.5 font-display text-lg font-extrabold text-[color:var(--color-clinic-ink)]">
                  Risiko Rendah
                </p>
                <div className="mt-2.5 flex flex-col gap-1.5">
                  <div className="h-1.5 w-full rounded-full bg-black/[0.06]">
                    <div className="h-full w-4/5 rounded-full bg-[color:var(--color-siaga-scan)]" />
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-black/[0.06]">
                    <div className="h-full w-2/5 rounded-full bg-[color:var(--color-siaga-consult)]" />
                  </div>
                </div>
              </FloatingCard>

              <FloatingCard
                className="right-0 top-1/2 w-[min(172px,calc(100vw-48px))] -translate-y-1/2 sm:-right-2 sm:w-[196px] md:-right-10 md:w-[210px]"
                delay="0.5s"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-siaga-scan)]/12 px-2.5 py-1 text-[10px] font-semibold text-[color:var(--color-siaga-scan-dim)]">
                  <ScanLine className="h-3 w-3" />
                  Scan AI Aktif
                </span>
                <p className="mt-2 text-xs font-semibold leading-snug text-[color:var(--color-clinic-ink)]">
                  Memindai 500+ pola gejala secara real-time
                </p>
                <div className="mt-2.5 flex items-center gap-2.5">
                  <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border-4 border-[color:var(--color-siaga-scan)]/20">
                    <span className="font-display text-xs font-extrabold text-[color:var(--color-siaga-scan-dim)]">
                      92%
                    </span>
                  </div>
                  <p className="text-[10px] leading-snug text-[color:var(--color-clinic-muted)]">
                    Estimasi akurasi triase awal
                  </p>
                </div>
              </FloatingCard>

              <FloatingCard
                className="right-0 bottom-16 w-[min(176px,calc(100vw-48px))] sm:-right-2 sm:bottom-12 sm:w-[200px] md:-right-6 md:w-[210px]"
                delay="1s"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-siaga-consult)]/12 px-2.5 py-1 text-[10px] font-semibold text-[color:var(--color-siaga-consult-dim)]">
                  <MessageCircleHeart className="h-3 w-3" />
                  Konsultasi AI
                </span>
                <p className="mt-2 text-xs font-semibold leading-snug text-[color:var(--color-clinic-ink)]">
                  "Demam 2 hari + nyeri kepala" → kemungkinan flu ringan
                </p>
                <p className="mt-1 text-[10px] text-[color:var(--color-clinic-muted)]">
                  Hemat waktu ke dokter hingga 40%
                </p>
              </FloatingCard>

              <div className="absolute bottom-2 right-0 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-md sm:-right-2 md:-right-4">
                <div className="flex -space-x-2">
                  {AVATARS.map((a) => (
                    <img
                      key={a}
                      src={a}
                      alt=""
                      className="h-6 w-6 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-[color:var(--color-clinic-ink)]" />
              </div>
            </div>
          </div>

          {/* Right column: supporting text */}
          <div className="relative z-10 flex flex-col justify-start">
            <div className="max-w-xs">
              <h3 className="font-display text-2xl font-extrabold leading-tight text-[color:var(--color-clinic-ink)]">
                Dengan Teknologi
                <br />
                Canggih
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-clinic-muted)]">
                Peralatan generasi terbaru, diagnostik digital, dan teknik canggih — semua bekerja
                untuk kesehatan Anda.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
