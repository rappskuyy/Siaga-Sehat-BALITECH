import { ArrowUpRight, MessageCircleHeart, ScanLine, ShieldCheck, Users, Code2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import fotodokter2 from "@/assets/fotodokter(2).png?url";
import { FloatingCard } from "./FloatingCard";
import { SiteHeader } from "@/components/layout/SiteHeader";

const AVATARS = [
  "https://dvtakououwyiejsudzey.supabase.co/storage/v1/object/sign/img/Raffasya%20Javas%20Niscala%20Widjaja.avif?token=eyJraWQiOiIzMmU4MWVjMy0wZWQzLTQ1N2EtYmQ3Yi04ZmE4YTU4YzUwM2YiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWcvUmFmZmFzeWEgSmF2YXMgTmlzY2FsYSBXaWRqYWphLmF2aWYiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg4MjI5MjE2LCJleHAiOjE4MTk3NjUyMTZ9.iRr6ud84LJqYwUzAOFXM4MjhjgI0h5hPPhfo_cH5aoQ",
  "https://dvtakououwyiejsudzey.supabase.co/storage/v1/object/sign/img/Muhamad%20Fedliansyah%20Ilham.avif?token=eyJraWQiOiIzMmU4MWVjMy0wZWQzLTQ1N2EtYmQ3Yi04ZmE4YTU4YzUwM2YiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWcvTXVoYW1hZCBGZWRsaWFuc3lhaCBJbGhhbS5hdmlmIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4ODIyOTI0MiwiZXhwIjoxODE5NzY1MjQyfQ.dLqKIowxqRfX6f3cO03UQg4xDyp7JIKc8WXyWQrpoHI",
  "https://dvtakououwyiejsudzey.supabase.co/storage/v1/object/sign/img/Ahmad%20Rhezki%20Prasetya.avif?token=eyJraWQiOiIzMmU4MWVjMy0wZWQzLTQ1N2EtYmQ3Yi04ZmE4YTU4YzUwM2YiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWcvQWhtYWQgUmhlemtpIFByYXNldHlhLmF2aWYiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg4MjI5MjU0LCJleHAiOjE4MTk3NjUyNTR9.NPKlNAKqDpmnKsYdqMXk3AG9p5lyc7tv1dNPfMSaAHo",
];

export function Hero() {
  return (
    <>
      <SiteHeader />
      <section className="relative w-full overflow-hidden bg-white px-4 pt-5 pb-8 sm:px-6 md:px-8 md:pt-7 md:pb-14 lg:px-10 lg:pt-8 lg:pb-16">
        {/* Body */}
        <div className="relative mx-auto max-w-6xl w-full">
          <div className="relative mt-7 grid gap-10 sm:gap-8 lg:mt-8 lg:grid-cols-[1.05fr_1.1fr_0.85fr] lg:items-start lg:gap-5">
            {/* Left column: headline + CTA + Tim Pengembang card */}
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
                  href="#services"
                  className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue)] py-1.5 pl-5 pr-1.5 text-sm font-medium text-white shadow-lg shadow-[color:var(--color-clinic-blue)]/30 transition hover:bg-[color:var(--color-clinic-blue-dark)]"
                >
                  Layanan
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

              {/* Tim Pengembang Direct Link Card */}
              <div className="mt-8 md:mt-10">
                <Link
                  to="/dev"
                  className="group relative flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white p-3.5 sm:p-4 shadow-[var(--shadow-clinic)] transition-all duration-300 hover:scale-[1.02] hover:border-[color:var(--color-clinic-blue)]/40 hover:shadow-md cursor-pointer"
                  title="Lihat Profil Tim Pengembang BALITECH"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2.5">
                      {AVATARS.map((a, idx) => (
                        <img
                          key={idx}
                          src={a}
                          alt={`Pengembang ${idx + 1}`}
                          className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-2xs transition-transform duration-200 group-hover:scale-105"
                        />
                      ))}
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-clinic-blue)]">
                        Karya Siswa SMK Wikrama Bogor
                      </span>
                      <span className="block text-xs font-extrabold text-[color:var(--color-clinic-ink)]">
                        Lihat Profil Pengembang &rarr;
                      </span>
                    </div>
                  </div>

                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] transition-transform duration-300 group-hover:rotate-45 group-hover:bg-[color:var(--color-clinic-blue)] group-hover:text-white shrink-0">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>
            </div>

            {/* Center column: doctor photo pulled up close to the header, with floating AI feature cards */}
            <div className="relative order-first flex flex-col items-center lg:order-none lg:-mt-6">
              <div className="relative inline-flex h-[280px] max-w-full items-end sm:h-[400px] md:h-[460px] lg:h-[540px]">
                <img
                  src={fotodokter2}
                  alt="Dokter dengan stetoskop"
                  className="h-full max-h-[860px] w-auto object-contain object-bottom"
                />

                {/* Floating overlay cards */}
                <FloatingCard
                  className="hidden w-[180px] sm:-left-2 sm:top-3 sm:block md:-left-8"
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
                  className="hidden w-[210px] sm:-right-2 sm:top-[42%] sm:block sm:-translate-y-1/2 md:-right-10"
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
                  className="hidden w-[210px] sm:-right-2 sm:bottom-12 sm:block md:-right-6"
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
              </div>

              {/* Mobile stacked feature cards */}
              <div className="mt-4 flex w-full max-w-xs flex-col gap-2.5 sm:hidden">
                <div className="rounded-2xl border border-black/5 bg-white p-3.5 shadow-[var(--shadow-clinic)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[color:var(--color-clinic-muted)]">
                      Progres Pemulihanmu
                    </span>
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[color:var(--color-siaga-scan-dim)]" />
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
                </div>

                <div className="rounded-2xl border border-black/5 bg-white p-3.5 shadow-[var(--shadow-clinic)]">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-siaga-scan)]/12 px-2.5 py-1 text-xs font-semibold text-[color:var(--color-siaga-scan-dim)]">
                    <ScanLine className="h-3 w-3" />
                    Scan AI Aktif
                  </span>
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border-4 border-[color:var(--color-siaga-scan)]/20">
                      <span className="font-display text-xs font-extrabold text-[color:var(--color-siaga-scan-dim)]">
                        92%
                      </span>
                    </div>
                    <p className="text-xs leading-snug text-[color:var(--color-clinic-ink)]">
                      <span className="font-semibold">Memindai 500+ pola gejala</span> secara
                      real-time — estimasi akurasi triase awal.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-black/5 bg-white p-3.5 shadow-[var(--shadow-clinic)]">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-siaga-consult)]/12 px-2.5 py-1 text-xs font-semibold text-[color:var(--color-siaga-consult-dim)]">
                    <MessageCircleHeart className="h-3 w-3" />
                    Konsultasi AI
                  </span>
                  <p className="mt-2 text-xs font-semibold leading-snug text-[color:var(--color-clinic-ink)]">
                    "Demam 2 hari + nyeri kepala" → kemungkinan flu ringan
                  </p>
                  <p className="mt-1 text-[11px] text-[color:var(--color-clinic-muted)]">
                    Hemat waktu ke dokter hingga 40%
                  </p>
                </div>
              </div>
            </div>

            {/* Right column: supporting text */}
            <div className="relative z-10 flex flex-col justify-start">
              <div className="max-w-xs">
                <h3 className="font-display text-2xl font-extrabold leading-tight text-[color:var(--color-clinic-ink)]">
                  Dengan Kecerdasan
                  <br />
                  Buatan
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-clinic-muted)]">
                  Peralatan generasi terbaru, diagnostik digital, dan kecerdasan buatan — semua bekerja
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
