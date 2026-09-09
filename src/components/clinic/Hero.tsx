import { ArrowUpRight, MessageCircleHeart, ScanLine, ShieldCheck, Users, Code2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import fotodokter2 from "@/assets/fotodokter.webp?url";
import raffasyaAvatar from "@/assets/Raffasya Javas Niscala Widjaja.avif?url";
import ahmadAvatar from "@/assets/Ahmad Rhezki Prasetya.avif?url";
import muhamadAvatar from "@/assets/Muhamad Fedliansyah Ilham.avif?url";
import { FloatingCard } from "./FloatingCard";
import { SiteHeader } from "@/components/layout/SiteHeader";

const AVATARS = [
  raffasyaAvatar,
  muhamadAvatar,
  ahmadAvatar,
];

export function Hero() {
  return (
    <>
      <SiteHeader />
      <section className="relative w-full overflow-hidden bg-white px-4 pt-4 pb-8 sm:px-6 md:px-8 md:pt-6 md:pb-12 lg:px-10 lg:pt-8 lg:pb-16 xl:pt-10 xl:pb-20">
        {/* Body */}
        <div className="relative mx-auto max-w-6xl xl:max-w-7xl w-full">
          <div className="relative mt-4 sm:mt-6 grid gap-8 sm:gap-10 lg:grid-cols-[1.05fr_1.1fr_0.85fr] lg:items-start lg:gap-8">
            {/* Left column: headline + CTA + Tim Pengembang card */}
            <div className="relative z-10 flex flex-col justify-start">
              <h1 className="font-display text-4xl font-extrabold leading-[0.9] tracking-tight text-[color:var(--color-clinic-ink)] sm:text-5xl md:text-6xl lg:text-[72px] xl:text-[80px]">
                Siaga
                <br />
                Sehat
              </h1>

              <p className="mt-3 sm:mt-4 max-w-[340px] sm:max-w-md md:max-w-lg text-xs sm:text-sm md:text-[15px] leading-relaxed text-[color:var(--color-clinic-muted)]">
                <span className="font-semibold text-[color:var(--color-clinic-ink)]">
                  Kami tidak hanya mengobati gejala
                </span>{" "}
                , kami peduli dengan setiap orang, didukung skrining AI yang cepat dan akurat.
              </p>

              <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-2">
                <a
                  href="#services"
                  className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue)] py-1.5 pl-5 pr-1.5 text-xs sm:text-sm font-medium text-white shadow-lg shadow-[color:var(--color-clinic-blue)]/30 transition hover:bg-[color:var(--color-clinic-blue-dark)]"
                >
                  Layanan
                  <span className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-white text-[color:var(--color-clinic-blue)] transition group-hover:rotate-45">
                    <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </span>
                </a>
                <Link
                  to="/scanner"
                  className="group inline-flex items-center gap-2 rounded-full border border-[color:var(--color-clinic-blue)]/30 py-1.5 pl-5 pr-1.5 text-xs sm:text-sm font-medium text-[color:var(--color-clinic-ink)] transition hover:bg-[color:var(--color-clinic-blue-soft)] lg:hidden"
                >
                  Scan AI
                  <span className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
                    <ScanLine className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </span>
                </Link>
              </div>

              {/* Tim Pengembang Direct Link Card */}
              <div className="mt-6 sm:mt-8 md:mt-10 max-w-sm sm:max-w-md md:max-w-lg">
                <Link
                  to="/dev"
                  className="group relative flex items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-black/10 bg-white p-3 sm:p-4 shadow-[var(--shadow-clinic)] transition-all duration-300 hover:scale-[1.02] hover:border-[color:var(--color-clinic-blue)]/40 hover:shadow-md cursor-pointer"
                  title="Lihat Profil Tim Pengembang BALITECH"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex -space-x-2 sm:-space-x-2.5">
                      {AVATARS.map((a, idx) => (
                        <img
                          key={idx}
                          src={a}
                          alt={`Pengembang ${idx + 1}`}
                          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 border-white object-cover shadow-2xs transition-transform duration-200 group-hover:scale-105"
                        />
                      ))}
                    </div>
                    <div>
                      <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-clinic-blue)]">
                        Karya Siswa SMK Wikrama Bogor
                      </span>
                      <span className="block text-[11px] sm:text-xs font-extrabold text-[color:var(--color-clinic-ink)]">
                        Lihat Profil Pengembang &rarr;
                      </span>
                    </div>
                  </div>

                  <span className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] transition-transform duration-300 group-hover:rotate-45 group-hover:bg-[color:var(--color-clinic-blue)] group-hover:text-white shrink-0">
                    <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </span>
                </Link>
              </div>
            </div>

            {/* Center column: doctor photo with floating AI feature cards */}
            <div className="relative order-first lg:order-none flex flex-col items-center pt-2 sm:pt-4 lg:pt-0 lg:-mt-10 xl:-mt-14">
              <div className="relative inline-flex items-end justify-center">
                <img
                  src={fotodokter2}
                  alt="Dokter dengan stetoskop"
                  className="h-[300px] sm:h-[400px] md:h-[460px] lg:h-[540px] xl:h-[600px] w-auto max-w-none object-contain pointer-events-none select-none"
                />

                {/* Floating overlay cards - Desktop only */}
                <FloatingCard
                  className="hidden lg:block w-[185px] lg:-left-12 lg:top-8 xl:-left-16 xl:top-10"
                  delay="0s"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[color:var(--color-clinic-muted)]">
                      Progres Pemulihanmu
                    </span>
                    <ShieldCheck className="h-4 w-4 text-[color:var(--color-siaga-scan-dim)] shrink-0" />
                  </div>
                  <p className="mt-1 font-display text-base font-extrabold text-[color:var(--color-clinic-ink)]">
                    Risiko Rendah
                  </p>
                  <div className="mt-2 flex flex-col gap-1">
                    <div className="h-1.5 w-full rounded-full bg-black/[0.06]">
                      <div className="h-full w-4/5 rounded-full bg-[color:var(--color-siaga-scan)]" />
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-black/[0.06]">
                      <div className="h-full w-2/5 rounded-full bg-[color:var(--color-siaga-consult)]" />
                    </div>
                  </div>
                </FloatingCard>

                <FloatingCard
                  className="hidden lg:block w-[210px] lg:top-[52%] lg:-translate-y-1/2 lg:-right-16 xl:-right-20"
                  delay="0.5s"
                >
                  <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-siaga-scan)]/12 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-siaga-scan-dim)]">
                    <ScanLine className="h-3 w-3 shrink-0" />
                    Scan AI Aktif
                  </span>
                  <p className="mt-1.5 text-xs font-semibold leading-snug text-[color:var(--color-clinic-ink)]">
                    Memindai 500+ pola gejala secara real-time
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border-4 border-[color:var(--color-siaga-scan)]/20">
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
                  className="hidden lg:block w-[210px] lg:bottom-2 lg:-right-12 xl:-right-14"
                  delay="1s"
                >
                  <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-siaga-consult)]/12 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-siaga-consult-dim)]">
                    <MessageCircleHeart className="h-3 w-3 shrink-0" />
                    Konsultasi AI
                  </span>
                  <p className="mt-1.5 text-xs font-semibold leading-snug text-[color:var(--color-clinic-ink)]">
                    "Demam 2 hari + nyeri kepala" → kemungkinan flu ringan
                  </p>
                  <p className="mt-1 text-[10px] text-[color:var(--color-clinic-muted)]">
                    Hemat waktu ke dokter hingga 40%
                  </p>
                </FloatingCard>
              </div>

              {/* Mobile & iPad stacked feature cards */}
              <div className="mt-4 sm:mt-6 flex w-full max-w-xs sm:max-w-md md:max-w-lg flex-col gap-2.5 sm:gap-3 lg:hidden">
                <div className="rounded-2xl border border-black/5 bg-white p-3.5 sm:p-4 shadow-[var(--shadow-clinic)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-[color:var(--color-clinic-muted)]">
                      Progres Pemulihanmu
                    </span>
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-[color:var(--color-siaga-scan-dim)]" />
                  </div>
                  <p className="mt-1.5 font-display text-lg sm:text-xl font-extrabold text-[color:var(--color-clinic-ink)]">
                    Risiko Rendah
                  </p>
                  <div className="mt-2.5 flex flex-col gap-1.5">
                    <div className="h-1.5 sm:h-2 w-full rounded-full bg-black/[0.06]">
                      <div className="h-full w-4/5 rounded-full bg-[color:var(--color-siaga-scan)]" />
                    </div>
                    <div className="h-1.5 sm:h-2 w-full rounded-full bg-black/[0.06]">
                      <div className="h-full w-2/5 rounded-full bg-[color:var(--color-siaga-consult)]" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-black/5 bg-white p-3.5 sm:p-4 shadow-[var(--shadow-clinic)]">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-siaga-scan)]/12 px-2.5 py-1 text-xs font-semibold text-[color:var(--color-siaga-scan-dim)]">
                    <ScanLine className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Scan AI Aktif
                  </span>
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="relative grid h-11 w-11 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-full border-4 border-[color:var(--color-siaga-scan)]/20">
                      <span className="font-display text-xs sm:text-sm font-extrabold text-[color:var(--color-siaga-scan-dim)]">
                        92%
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm leading-snug text-[color:var(--color-clinic-ink)]">
                      <span className="font-semibold">Memindai 500+ pola gejala</span> secara
                      real-time, estimasi akurasi triase awal.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-black/5 bg-white p-3.5 sm:p-4 shadow-[var(--shadow-clinic)]">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-siaga-consult)]/12 px-2.5 py-1 text-xs font-semibold text-[color:var(--color-siaga-consult-dim)]">
                    <MessageCircleHeart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Konsultasi AI
                  </span>
                  <p className="mt-2 text-xs sm:text-sm font-semibold leading-snug text-[color:var(--color-clinic-ink)]">
                    "Demam 2 hari + nyeri kepala" → kemungkinan flu ringan
                  </p>
                  <p className="mt-1 text-[11px] sm:text-xs text-[color:var(--color-clinic-muted)]">
                    Hemat waktu ke dokter hingga 40%
                  </p>
                </div>
              </div>
            </div>

            {/* Right column: supporting text */}
            <div className="relative z-10 flex flex-col justify-start">
              <div className="max-w-xs sm:max-w-md md:max-w-lg">
                <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight text-[color:var(--color-clinic-ink)]">
                  Dengan Kecerdasan
                  <br />
                  Buatan
                </h3>
                <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-[15px] leading-relaxed text-[color:var(--color-clinic-muted)]">
                  Peralatan generasi terbaru, diagnostik digital, dan kecerdasan buatan, semua bekerja
                  untuk kesehatan Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
