import { createFileRoute } from "@tanstack/react-router";
import { AnatomyExplorer } from "@/components/anatomy/AnatomyExplorer";
import { Footer } from "@/components/clinic/Footer";
<<<<<<< HEAD
import { SiteHeader } from "@/components/layout/SiteHeader";
=======
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ArrowLeft, Sparkles, User, Bell, LogIn, Menu, X, ScanLine, MapPin, MessageCircleHeart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
>>>>>>> 1a3057d (menambah logo)

export const Route = createFileRoute("/anatomy")({
  head: () => ({
    meta: [
      { title: "Eksplorasi Anatomi AI — SiagaSehat" },
      {
        name: "description",
        content:
          "Eksplorasi bagian tubuh secara interaktif, pilih gejala Anda, dan dapatkan AI Health Assessment awal dari SiagaSehat.",
      },
      { property: "og:title", content: "Eksplorasi Anatomi AI — SiagaSehat" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnatomyPage,
});

function AnatomyPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] font-sans flex flex-col justify-between">
      <div>
<<<<<<< HEAD
        <SiteHeader />
=======
        {/* Integrated Header / Navbar matching existing design */}
        <header className="bg-white border-b border-black/5 px-4 py-3 md:px-8 sticky top-0 z-40 shadow-2xs">
          <div className="max-w-[1600px] mx-auto relative flex items-center justify-between gap-3">
            <BrandLogo />

            {/* Desktop Nav */}
            <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 rounded-full bg-[color:var(--color-clinic-blue-soft)]/60 p-1 text-xs font-medium text-[color:var(--color-clinic-ink)] whitespace-nowrap shadow-xs">
              <Link
                to="/"
                className="rounded-full px-3 py-1.5 transition hover:bg-white/80 hover:text-[color:var(--color-clinic-blue)] text-[color:var(--color-clinic-ink)]"
              >
                Beranda
              </Link>
              <Link
                to="/maps"
                activeProps={{ className: "bg-white text-[color:var(--color-clinic-blue)] font-bold shadow-xs" }}
                inactiveProps={{ className: "text-[color:var(--color-clinic-ink)] hover:bg-white/70" }}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition"
              >
                Peta Lokasi
              </Link>
              <Link
                to="/consultation"
                activeProps={{ className: "bg-white text-[color:var(--color-clinic-blue)] font-bold shadow-xs" }}
                inactiveProps={{ className: "text-[color:var(--color-clinic-ink)] hover:bg-white/70" }}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition"
              >
                Konsultasi
              </Link>
              <Link
                to="/anatomy"
                activeProps={{ className: "bg-white text-[color:var(--color-clinic-blue)] font-bold shadow-xs" }}
                inactiveProps={{ className: "text-[color:var(--color-clinic-ink)] hover:bg-white/70" }}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition"
              >
                Anatomi
              </Link>
              <Link
                to="/scanner"
                activeProps={{ className: "bg-[color:var(--color-clinic-blue-dark)] text-white font-bold shadow-xs" }}
                inactiveProps={{ className: "bg-[color:var(--color-clinic-blue)] text-white hover:bg-[color:var(--color-clinic-blue-dark)]" }}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-semibold transition"
              >
                <ScanLine className="h-3.5 w-3.5" />
                Scan AI
              </Link>
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue-soft)]/60 px-3.5 py-1.5 text-xs font-medium text-[color:var(--color-clinic-blue-dark)] transition hover:bg-[color:var(--color-clinic-blue-soft)]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Beranda
              </Link>

              {user ? (
                <Link
                  to="/profile"
                  className="hidden h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-clinic-ink)] text-white transition lg:inline-flex"
                  aria-label="Profil"
                >
                  <User className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="hidden items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue)] px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-[color:var(--color-clinic-blue-dark)] lg:inline-flex"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Masuk
                </Link>
              )}

              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] lg:hidden"
                aria-label="Buka menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer Navigation */}
          {isMenuOpen && (
            <div className="mt-3 rounded-2xl border border-black/5 bg-white p-4 shadow-[var(--shadow-clinic-lg)] lg:hidden animate-fade-down z-50">
              <nav className="flex flex-col gap-1.5">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-xl px-3.5 py-2 text-sm font-medium text-[color:var(--color-clinic-ink)] transition hover:bg-[color:var(--color-clinic-blue-soft)]"
                >
                  Beranda
                </Link>
                <Link
                  to="/maps"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-[color:var(--color-clinic-ink)] transition hover:bg-[color:var(--color-clinic-blue-soft)]"
                >
                  Peta Lokasi & Faskes
                </Link>
                <Link
                  to="/consultation"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-[color:var(--color-clinic-ink)] transition hover:bg-[color:var(--color-clinic-blue-soft)]"
                >
                  <MessageCircleHeart className="h-4 w-4 text-purple-600" />
                  Konsultasi AI
                </Link>
                <Link
                  to="/anatomy"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--color-clinic-blue-soft)]/70 px-3.5 py-2 text-sm font-bold text-[color:var(--color-clinic-blue)]"
                >
                  <span className="h-2 w-2 rounded-full bg-[color:var(--color-clinic-blue)]" />
                  Anatomi Tubuh (Aktif)
                </Link>
                <Link
                  to="/scanner"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--color-clinic-blue)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                >
                  <ScanLine className="h-4 w-4" />
                  Scan AI Diagnostik
                </Link>
                <Link
                  to={user ? "/profile" : "/login"}
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-[color:var(--color-clinic-ink)] hover:bg-slate-50"
                >
                  <User className="h-4 w-4" />
                  {user ? "Profil Saya" : "Masuk / Daftar"}
                </Link>
              </nav>
            </div>
          )}
        </header>
>>>>>>> 1a3057d (menambah logo)

        {/* Content Container */}
        <div className="px-3 py-4 md:px-6 md:py-6">
          <AnatomyExplorer />
        </div>
      </div>

      <Footer />
    </main>
  );
}
