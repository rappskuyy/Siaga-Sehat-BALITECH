import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, LogIn, MapPin, Menu, ScanLine, User, X } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useAuth } from "@/lib/auth/auth-context";

const activePill = {
  className: "bg-white text-[color:var(--color-clinic-blue)] font-bold shadow-xs",
};
const inactivePill = { className: "text-[color:var(--color-clinic-ink)] hover:bg-white/70" };

/**
 * Shared navbar for every inner page (Anatomi, Konsultasi, Scan AI, Peta
 * Lokasi, Profil, ...). Mirrors the landing page's header — same logo, same
 * nav items, same colors — but as a slim sticky bar suited for content
 * pages instead of the full hero treatment on "/". Kept intentionally
 * minimal: every icon here has a visible text label next to it, and the
 * mobile view collapses to just the logo and a single menu button.
 */
export function SiteHeader() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 px-4 py-3 shadow-2xs backdrop-blur md:px-8">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3">
        <BrandLogo size="sm" />

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-[color:var(--color-clinic-blue-soft)]/60 p-1 text-xs font-medium text-[color:var(--color-clinic-ink)] shadow-xs lg:flex">
          <Link
            to="/"
            className="rounded-full px-3 py-1.5 transition hover:bg-white/80 hover:text-[color:var(--color-clinic-blue)]"
          >
            Beranda
          </Link>
          <Link
            to="/maps"
            activeProps={activePill}
            inactiveProps={inactivePill}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition"
          >
            <MapPin className="h-3.5 w-3.5 text-[color:var(--color-clinic-blue)]" />
            Peta Lokasi
          </Link>
          <Link
            to="/consultation"
            search={{ anatomy: undefined }}
            activeProps={activePill}
            inactiveProps={inactivePill}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition"
          >
            Konsultasi
          </Link>
          <Link
            to="/anatomy"
            activeProps={activePill}
            inactiveProps={inactivePill}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition"
          >
            Anatomi
          </Link>
          <Link
            to="/scanner"
            activeProps={{
              className: "bg-[color:var(--color-clinic-blue-dark)] text-white font-bold shadow-xs",
            }}
            inactiveProps={{
              className:
                "bg-[color:var(--color-clinic-blue)] text-white hover:bg-[color:var(--color-clinic-blue-dark)]",
            }}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-semibold transition"
          >
            <ScanLine className="h-3.5 w-3.5" />
            Scan AI
          </Link>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={user ? "/profile" : "/login"}
            className="hidden items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-medium text-[color:var(--color-clinic-ink)] shadow-xs transition hover:bg-white sm:inline-flex"
          >
            {user ? (
              <>
                <User className="h-3.5 w-3.5 text-[color:var(--color-clinic-blue)]" />
                Profil
              </>
            ) : (
              <>
                <LogIn className="h-3.5 w-3.5 text-[color:var(--color-clinic-blue)]" />
                Masuk
              </>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] transition hover:bg-[color:var(--color-clinic-blue)]/10 lg:hidden"
            aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="mx-auto mt-3 w-full max-w-[1600px] rounded-2xl border border-black/5 bg-white p-3 shadow-[var(--shadow-clinic)] lg:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-medium text-[color:var(--color-clinic-ink)] transition hover:bg-[color:var(--color-clinic-blue-soft)]"
            >
              Beranda
            </Link>
            <Link
              to="/maps"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-medium text-[color:var(--color-clinic-ink)] transition hover:bg-[color:var(--color-clinic-blue-soft)]"
            >
              Peta Lokasi
            </Link>
            <Link
              to="/consultation"
              search={{ anatomy: undefined }}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-medium text-[color:var(--color-clinic-ink)] transition hover:bg-[color:var(--color-clinic-blue-soft)]"
            >
              Konsultasi
            </Link>
            <Link
              to="/anatomy"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-medium text-[color:var(--color-clinic-ink)] transition hover:bg-[color:var(--color-clinic-blue-soft)]"
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
    </header>
  );
}

/** Small "back to home" pill used under the header on a couple of pages. */
export function BackHomeLink({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--color-clinic-muted)] transition hover:text-[color:var(--color-clinic-blue)] ${className}`}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Kembali ke Beranda
    </Link>
  );
}
