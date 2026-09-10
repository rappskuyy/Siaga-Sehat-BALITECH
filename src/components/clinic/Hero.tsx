import { ArrowUpRight, MessageCircleHeart, ScanLine, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import fotodokter2 from "@/assets/fotodokter.webp?url";
import raffasyaAvatar from "@/assets/Raffasya Javas Niscala Widjaja.avif?url";
import ahmadAvatar from "@/assets/Ahmad Rhezki Prasetya.avif?url";
import muhamadAvatar from "@/assets/Muhamad Fedliansyah Ilham.avif?url";
import { FloatingCard } from "./FloatingCard";
import { SiteHeader } from "@/components/layout/SiteHeader";

const AVATARS = [raffasyaAvatar, muhamadAvatar, ahmadAvatar];

export function Hero() {
  return (
    <>
      <SiteHeader />
      <section className="relative w-full overflow-hidden bg-white px-3.5 pt-3 pb-8 sm:px-6 sm:pt-4 md:px-8 md:pt-6 md:pb-12 lg:px-10 lg:pt-8 lg:pb-16 xl:pt-10 xl:pb-20">
        {/* Body */}
        <div className="relative mx-auto max-w-6xl xl:max-w-7xl w-full">
          <div className="relative mt-4 grid gap-7 sm:mt-6 sm:gap-10 min-[900px]:grid-cols-[0.88fr_1.24fr_0.88fr] min-[900px]:items-start min-[900px]:gap-6 xl:grid-cols-[0.95fr_1.2fr_0.9fr] xl:gap-8">
            {/* Left column: headline + CTA + Tim Pengembang card */}
            <div className="relative z-10 flex flex-col justify-start">
              <h1 className="font-display text-[clamp(2.75rem,13vw,4rem)] font-extrabold leading-[0.9] tracking-tight text-[color:var(--color-clinic-ink)] sm:text-5xl md:text-6xl lg:text-[72px] xl:text-[80px]">
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
              <div className="mt-6 w-full max-w-sm sm:mt-8 sm:max-w-md md:mt-10 md:max-w-lg">
                <Link
                  to="/dev"
                  className="group relative flex min-w-0 w-full items-center justify-between gap-2.5 rounded-2xl border border-black/10 bg-white p-3 sm:gap-4 sm:p-4 shadow-[var(--shadow-clinic)] transition-all duration-300 hover:scale-[1.02] hover:border-[color:var(--color-clinic-blue)]/40 hover:shadow-md cursor-pointer"
                  title="Lihat Profil Tim Pengembang BALITECH"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
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
                    <div className="min-w-0 flex-1">
                      <span className="block max-w-full text-[9px] font-bold uppercase leading-tight tracking-[0.08em] text-[color:var(--color-clinic-blue)] sm:text-[10px] sm:tracking-wider">
                        Karya Siswa SMK Wikrama Bogor
                      </span>
                      <span className="mt-0.5 block text-[11px] font-extrabold leading-tight text-[color:var(--color-clinic-ink)] sm:text-xs">
                        Lihat Profil Pengembang &rarr;
                      </span>
                    </div>
                  </div>

                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] transition-transform duration-300 group-hover:rotate-45 group-hover:bg-[color:var(--color-clinic-blue)] group-hover:text-white sm:h-9 sm:w-9">
                    <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </span>
                </Link>
              </div>
            </div>

            {/* Center column: doctor photo with floating AI feature cards */}
            <div className="relative order-first flex flex-col items-center pt-2 sm:pt-4 min-[900px]:order-none min-[900px]:pt-0">
              <div className="relative inline-flex items-end justify-center">
                {/* Soft ambient glow behind the avatar for a premium, alive feel */}
                <span
                  aria-hidden
                  className="animate-siaga-glow pointer-events-none absolute inset-x-[10%] bottom-0 top-[10%] -z-10 rounded-full bg-[color:var(--color-clinic-blue)]/10 blur-3xl"
                />

                {/* Doctor Avatar Image */}
                <img
                  src={fotodokter2}
                  alt="Dokter dengan stetoskop"
                  className="hidden min-[900px]:block animate-fade-up w-auto max-w-full object-contain pointer-events-none select-none"
                  style={{
                    height: "617px",
                    marginTop: "-60px",
                    animationDuration: "0.7s",
                  }}
                />
                <img
                  src={fotodokter2}
                  alt="Dokter dengan stetoskop"
                  className="min-[900px]:hidden animate-fade-up w-auto max-w-full object-contain pointer-events-none select-none"
                  style={{
                    height: "278px",
                    marginTop: "-4px",
                    animationDuration: "0.7s",
                  }}
                />

                {/* Floating overlay cards - Desktop only (≥900px) */}
                <FloatingCard
                  className="hidden min-[900px]:block p-2.5 shadow-xl"
                  style={{
                    top: "38px",
                    left: "-32px",
                    width: "148px",
                  }}
                  delay="0s"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[color:var(--color-clinic-muted)]">
                      Progres Pemulihanmu
                    </span>
                    <ShieldCheck className="h-4 w-4 text-[color:var(--color-clinic-blue)] shrink-0" />
                  </div>
                  <p className="mt-1 font-display text-base font-extrabold text-[color:var(--color-clinic-ink)]">
                    Risiko Rendah
                  </p>
                  <div className="mt-2 flex flex-col gap-1">
                    <div className="h-1.5 w-full rounded-full bg-black/[0.06]">
                      <div className="h-full w-4/5 rounded-full bg-[color:var(--color-clinic-blue)]" />
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-black/[0.06]">
                      <div className="h-full w-2/5 rounded-full bg-[color:var(--color-clinic-blue-dark)]" />
                    </div>
                  </div>
                </FloatingCard>

                <FloatingCard
                  className="hidden min-[900px]:block p-2.5 shadow-xl"
                  style={{
                    top: "55px",
                    left: "357px",
                    width: "159px",
                  }}
                  delay="0.5s"
                >
                  <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-clinic-blue-dark)]">
                    <ScanLine className="h-3 w-3 shrink-0" />
                    Scan AI Aktif
                  </span>
                  <p className="mt-1.5 text-xs font-semibold leading-snug text-[color:var(--color-clinic-ink)]">
                    Memindai 500+ pola gejala
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border-4 border-[color:var(--color-clinic-blue)]/20">
                      <span className="font-display text-xs font-extrabold text-[color:var(--color-clinic-blue-dark)]">
                        92%
                      </span>
                    </div>
                    <p className="text-[10px] leading-snug text-[color:var(--color-clinic-muted)]">
                      Akurasi triase awal
                    </p>
                  </div>
                </FloatingCard>

                <FloatingCard
                  className="hidden min-[900px]:block p-2.5 shadow-xl"
                  style={{
                    top: "207px",
                    left: "376px",
                    width: "154px",
                  }}
                  delay="1s"
                >
                  <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-clinic-blue-dark)]">
                    <MessageCircleHeart className="h-3 w-3 shrink-0" />
                    Konsultasi AI
                  </span>
                  <p className="mt-1.5 text-xs font-semibold leading-snug text-[color:var(--color-clinic-ink)]">
                    Demam 2 hari → flu ringan
                  </p>
                  <p className="mt-1 text-[10px] text-[color:var(--color-clinic-muted)]">
                    Hemat waktu dokter s/d 40%
                  </p>
                </FloatingCard>

                {/* Floating overlay cards - Mobile & Tablet (<900px) */}
                <div className="pointer-events-none absolute inset-0 min-[900px]:hidden overflow-visible">
                  <FloatingCard
                    className="p-2 sm:p-2.5 shadow-md border border-slate-200/80 bg-white/95"
                    style={{
                      top: "10px",
                      left: "-40px",
                      width: "110px",
                    }}
                    delay="0s"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-medium leading-tight text-[color:var(--color-clinic-muted)] sm:text-[10px]">
                        Progres pulih
                      </span>
                      <ShieldCheck className="h-3 w-3 shrink-0 text-[color:var(--color-clinic-blue)]" />
                    </div>
                    <p className="mt-0.5 font-display text-xs font-extrabold text-[color:var(--color-clinic-ink)] sm:text-sm">
                      Risiko rendah
                    </p>
                    <div className="mt-1 flex flex-col gap-0.5">
                      <div className="h-1 rounded-full bg-black/[0.06]">
                        <div className="h-full w-4/5 rounded-full bg-[color:var(--color-clinic-blue)]" />
                      </div>
                      <div className="h-1 rounded-full bg-black/[0.06]">
                        <div className="h-full w-2/5 rounded-full bg-[color:var(--color-clinic-blue-dark)]" />
                      </div>
                    </div>
                  </FloatingCard>

                  <FloatingCard
                    className="p-2 sm:p-2.5 shadow-md border border-slate-200/80 bg-white/95"
                    style={{
                      top: "5px",
                      right: "-43px",
                      width: "115px",
                    }}
                    delay="0.5s"
                  >
                    <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-1.5 py-0.5 text-[8.5px] font-semibold text-[color:var(--color-clinic-blue-dark)] sm:text-[9.5px]">
                      <ScanLine className="h-2.5 w-2.5 shrink-0" /> Scan AI
                    </span>
                    <p className="mt-1 text-[9px] font-semibold leading-tight text-[color:var(--color-clinic-ink)] sm:text-[10px]">
                      Analisis gejala
                    </p>
                    <p className="mt-0.5 font-display text-xs font-extrabold text-[color:var(--color-clinic-blue-dark)] sm:text-sm">
                      92% Akurat
                    </p>
                  </FloatingCard>

                  <FloatingCard
                    className="p-2 sm:p-2.5 shadow-md border border-slate-200/80 bg-white/95"
                    style={{
                      top: "250px",
                      right: "-11px",
                      width: "114px",
                    }}
                    delay="1s"
                  >
                    <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-1.5 py-0.5 text-[8.5px] font-semibold text-[color:var(--color-clinic-blue-dark)] sm:text-[9.5px]">
                      <MessageCircleHeart className="h-2.5 w-2.5 shrink-0" /> Konsultasi AI
                    </span>
                    <p className="mt-1 text-[9px] font-semibold leading-tight text-[color:var(--color-clinic-ink)] sm:text-[10px]">
                      Tanya keluhan
                    </p>
                    <p className="mt-0.5 text-[8px] text-[color:var(--color-clinic-muted)] sm:text-[9px]">
                      Respon instan 24/7
                    </p>
                  </FloatingCard>
                </div>
              </div>
            </div>

            {/* Right column: supporting text */}
            <div className="relative z-10 flex flex-col justify-start min-[900px]:pl-6 xl:pl-8">
              <div className="max-w-xs sm:max-w-md md:max-w-lg">
                <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight text-[color:var(--color-clinic-ink)]">
                  Dengan Kecerdasan
                  <br />
                  Buatan
                </h3>
                <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-[15px] leading-relaxed text-[color:var(--color-clinic-muted)]">
                  Peralatan generasi terbaru, diagnostik digital, dan kecerdasan buatan, semua
                  bekerja untuk kesehatan Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
