import { useState } from "react";
import {
  ArrowUpRight,
  LogIn,
  MapPin,
  MessageCircleHeart,
  Menu,
  Phone,
  Play,
  ScanLine,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { FloatingCard } from "./FloatingCard";
import fotodokter1 from "@/assets/fotodokter(1).png?url";
import fotodokter2 from "@/assets/fotodokter(2).png?url";
import { useAuth } from "@/lib/auth/auth-context";

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

const NAV_ITEMS = [{ label: "Layanan", hash: "services" }];

export function Hero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile } = useAuth();

  return (
    <section
      className="relative w-full overflow-hi
    
    dden bg-white px-4 pt-5 pb-8 sm:px-6 md:px-8 md:pt-7 md:pb-14 lg:px-10 lg:pt-8 lg:pb-16"
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <BrandLogo />

        <nav className="hidden items-center gap-1 rounded-full bg-[color:var(--color-clinic-blue-soft)]/60 px-2 py-1.5 text-sm text-[color:var(--color-clinic-ink)] lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={`#${item.hash}`}
              className="rounded-full px-4 py-1.5 transition hover:bg-white"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/maps"
            className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-1.5 text-[color:var(--color-clinic-ink)] transition hover:bg-white"
          >
            <MapPin className="h-3.5 w-3.5 text-[color:var(--color-clinic-blue)]" />
            Peta Lokasi
          </Link>
          <Link
            to="/consultation"
            search={{ anatomy: undefined }}
            className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-1.5 text-[color:var(--color-clinic-ink)] transition hover:bg-white"
          >
            Konsultasi
          </Link>
          <Link
            to="/anatomy"
            className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-1.5 text-[color:var(--color-clinic-ink)] transition hover:bg-white"
          >
            Anatomi
          </Link>
          <Link
            to="/scanner"
            className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue)] px-4 py-1.5 text-white transition hover:bg-[color:var(--color-clinic-blue-dark)]"
          >
            <ScanLine className="h-3.5 w-3.5" />
            Scan AI
          </Link>
          <Link
            to={user ? "/profile" : "/login"}
            className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-1.5 text-[color:var(--color-clinic-ink)] transition hover:bg-white"
          >
            {user ? (
              <>
                <User className="h-3.5 w-3.5" />
                {profile?.full_name?.split(" ")[0] || "Profil"}
              </>
            ) : (
              <>
                <LogIn className="h-3.5 w-3.5" />
                Masuk
              </>
            )}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right text-xs leading-tight text-[color:var(--color-clinic-muted)] md:block">
            <div>Indonesia, Jawa Barat</div>
            <div>Kota Bogor</div>
          </div>
          <button
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-clinic-ink)] text-white transition hover:bg-black/80 md:inline-flex"
            aria-label="Call"
          >
            <Phone className="h-4 w-4" />
          </button>
          <Link
            to={user ? "/profile" : "/login"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-clinic-ink)] text-white transition hover:bg-black/80 lg:hidden"
            aria-label="Akun"
          >
            <User className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] transition hover:bg-[color:var(--color-clinic-blue)]/10 lg:hidden"
            aria-label="Buka menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="mt-3 rounded-2xl border border-black/5 bg-white p-3 shadow-[var(--shadow-clinic)] lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={`#${item.hash}`}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-[color:var(--color-clinic-ink)] transition hover:bg-[color:var(--color-clinic-blue-soft)]"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/scanner"
              onClick={() => setIsMenuOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--color-clinic-blue)] px-3 py-2.5 text-sm font-medium text-white"
            >
              <ScanLine className="h-4 w-4" />
              Scan AI
            </Link>
            <Link
              to="/anatomy"
              onClick={() => setIsMenuOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white/80 px-3 py-2.5 text-sm font-medium text-[color:var(--color-clinic-ink)]"
            >
              Anatomi
            </Link>
            <Link
              to="/consultation"
              search={{ anatomy: undefined }}
              onClick={() => setIsMenuOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white/80 px-3 py-2.5 text-sm font-medium text-[color:var(--color-clinic-ink)]"
            >
              Konsultasi
            </Link>
            <Link
              to={user ? "/profile" : "/login"}
              onClick={() => setIsMenuOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-2.5 text-sm font-medium text-[color:var(--color-clinic-ink)]"
            >
              <User className="h-4 w-4" />
              {user ? "Profil Saya" : "Masuk / Daftar"}
            </Link>
          </nav>
        </div>
      )}

      {/* Body */}
      <div className="relative mt-7 grid gap-10 sm:gap-8 lg:mt-8 lg:grid-cols-[1.05fr_1.1fr_0.85fr] lg:items-start lg:gap-5">
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

          <div className="mt-8 flex items-stretch gap-2 sm:gap-3 md:mt-12">
            <button
              type="button"
              className="group relative hidden h-24 w-32 shrink-0 overflow-hidden rounded-2xl shadow-[var(--shadow-clinic)] md:block"
              aria-label="Putar video klinik"
            >
              <img
                src={fotodokter1}
                alt="Interior klinik"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/35" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="animate-scanner-ring absolute h-9 w-9 rounded-full border-2 border-white/80" />
                <span className="relative grid h-9 w-9 place-items-center rounded-full bg-white text-[color:var(--color-clinic-blue)] shadow-md transition group-hover:scale-110">
                  <Play className="h-3.5 w-3.5 fill-current" />
                </span>
              </span>
            </button>

            <div className="grid min-w-0 flex-1 grid-cols-3 gap-2 rounded-2xl bg-white p-3 shadow-[var(--shadow-clinic)] sm:gap-3 md:p-4">
              {MINI_STATS.map((s, i) => (
                <div
                  key={s.n}
                  className="animate-fade-up border-l border-black/5 pl-3 first:border-l-0 first:pl-0"
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
          <div className="relative inline-flex h-[340px] max-w-full items-end sm:h-[400px] md:h-[460px] lg:h-[540px]">
            <img
              src={fotodokter2}
              alt="Dokter dengan stetoskop"
              className="h-full max-h-[860px] w-auto object-contain object-bottom"
            />

            <FloatingCard
              className="left-0 top-3 w-[min(168px,calc(100vw-48px))] sm:-left-2 md:-left-8 md:w-[180px]"
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
              className="right-0 top-[42%] w-[min(196px,calc(100vw-40px))] -translate-y-1/2 sm:-right-2 md:-right-10 md:w-[210px]"
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
              className="right-0 bottom-12 w-[min(200px,calc(100vw-40px))] sm:-right-2 md:-right-6 md:w-[210px]"
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

            <div className="absolute bottom-2 right-0 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-md sm:bottom-4 sm:-right-2 md:-right-4">
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
  );
}
