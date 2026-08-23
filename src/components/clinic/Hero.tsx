import { useState } from "react";
import { ArrowUpRight, Bell, LogIn, Menu, Play, ScanLine, User, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { FloatingBadge } from "./FloatingBadge";
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

const NAV_ITEMS = ["Tentang Kami", "Layanan", "Dokter", "Hubungi"];

export function Hero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile } = useAuth();

  return (
    <section className="relative w-full bg-white px-6 pt-0 pb-5 md:px-8 md:pt-1 md:pb-8 lg:px-10 lg:pt-2 lg:pb-10">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--color-clinic-blue)]">
            <span className="h-2.5 w-2.5 rounded-full bg-white" />
          </div>
        </div>

        <nav className="hidden items-center gap-1 rounded-full bg-[color:var(--color-clinic-blue-soft)]/60 px-2 py-1.5 text-sm text-[color:var(--color-clinic-ink)] lg:flex">
          {NAV_ITEMS.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s/g, "")}`}
              className="rounded-full px-4 py-1.5 transition hover:bg-white"
            >
              {l}
            </a>
          ))}
          <Link
            to="/consultation"
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
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[color:var(--color-clinic-blue)]/20 transition hover:bg-[color:var(--color-clinic-blue-dark)] md:inline-flex"
            >
              <LogIn className="h-4 w-4" />
              Masuk
            </Link>
          ) : (
            <div className="hidden items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-[color:var(--color-clinic-muted)] opacity-50 md:inline-flex">
              <User className="h-4 w-4" />
              Profil
            </div>
          )}

          <div className="hidden text-right text-xs leading-tight text-[color:var(--color-clinic-muted)] md:block">
            <div>Indonesia, Jawa Barat</div>
            <div>Kota Bogor</div>
          </div>

          {user ? (
            <Link
              to="/profile"
              className="hidden h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-clinic-ink)] text-white transition hover:bg-black/80 md:inline-flex"
              aria-label="Profil"
            >
              <User className="h-4 w-4" />
            </Link>
          ) : (
            <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-muted)] opacity-50 md:inline-flex" aria-hidden="true">
              <User className="h-4 w-4" />
            </div>
          )}
          <button
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] transition hover:bg-[color:var(--color-clinic-blue)]/20 md:inline-flex"
            aria-label="Notifikasi"
          >
            <Bell className="h-4 w-4" />
          </button>
          {user ? (
            <Link
              to="/profile"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-clinic-ink)] text-white transition hover:bg-black/80 lg:hidden"
              aria-label="Akun"
            >
              <User className="h-4 w-4" />
            </Link>
          ) : (
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-muted)] opacity-50 lg:hidden" aria-hidden="true">
              <User className="h-4 w-4" />
            </div>
          )}
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
            {NAV_ITEMS.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/\s/g, "")}`}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-[color:var(--color-clinic-ink)] transition hover:bg-[color:var(--color-clinic-blue-soft)]"
              >
                {l}
              </a>
            ))}
            <Link
              to="/anatomy"
              onClick={() => setIsMenuOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white/80 px-3 py-2.5 text-sm font-medium text-[color:var(--color-clinic-ink)]"
            >
              Anatomi
            </Link>
            <Link
              to="/scanner"
              onClick={() => setIsMenuOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--color-clinic-blue)] px-3 py-2.5 text-sm font-medium text-white"
            >
              <ScanLine className="h-4 w-4" />
              Scan AI
            </Link>
            <Link
              to="/consultation"
              onClick={() => setIsMenuOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white/80 px-3 py-2.5 text-sm font-medium text-[color:var(--color-clinic-ink)]"
            >
              Konsultasi
            </Link>
            {user ? (
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-2.5 text-sm font-medium text-[color:var(--color-clinic-ink)]"
              >
                <User className="h-4 w-4" />
                Profil Saya
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--color-clinic-blue)] px-3 py-2.5 text-sm font-medium text-white"
              >
                <LogIn className="h-4 w-4" />
                Masuk
              </Link>
            )}
          </nav>
        </div>
      )}

      {/* Body */}
      <div className="relative mt-3 grid gap-8 lg:mt-5 lg:grid-cols-[1.05fr_1.1fr_0.85fr] lg:gap-5">
        {/* Left column: headline + CTA + proof card */}
        <div className="relative z-10 flex flex-col justify-start">
          <h1 className="font-display text-[56px] font-extrabold leading-[0.88] tracking-tight text-[color:var(--color-clinic-ink)] md:text-[68px] lg:text-[76px]">
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

          <div className="mt-8 flex items-stretch gap-3 md:mt-12">
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

            <div className="grid flex-1 grid-cols-3 gap-3 rounded-2xl bg-white p-3 shadow-[var(--shadow-clinic)] md:p-4">
              {MINI_STATS.map((s, i) => (
                <div
                  key={s.n}
                  className="animate-fade-up border-l border-black/5 pl-3 first:border-l-0 first:pl-0"
                  style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                >
                  <div className="font-display text-2xl font-extrabold text-[color:var(--color-clinic-ink)] md:text-[28px] md:leading-none">
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

        {/* Center column: doctor photo, no card background */}
        <div className="relative order-first flex justify-center lg:order-none">
          <div className="relative inline-flex h-[420px] items-end md:h-[520px] lg:h-[620px]">
            <img
              src={fotodokter2}
              alt="Dokter dengan stetoskop"
              className="h-full max-h-[860px] w-auto object-contain object-bottom"
            />

            <FloatingBadge className="-left-2 top-20 md:-left-4" style={{ animationDelay: "0s" }}>
              Reliability
            </FloatingBadge>
            <FloatingBadge
              className="-right-2 top-1/2 -translate-y-1/2 md:-right-6"
              style={{ animationDelay: "0.8s" }}
            >
              Experience
            </FloatingBadge>
            <FloatingBadge
              className="bottom-24 -right-2 md:-right-4"
              style={{ animationDelay: "1.6s" }}
            >
              Professional
            </FloatingBadge>

            <div className="absolute bottom-4 -right-2 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-md md:-right-4">
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
