import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useAuth } from "@/lib/auth/auth-context";

const activePill = {
  className: "bg-white text-[color:var(--color-clinic-blue)] font-bold shadow-xs",
};
const inactivePill = { className: "text-[color:var(--color-clinic-ink)] hover:bg-white/70" };
const scanActivePill = {
  className: "bg-[color:var(--color-clinic-blue-dark)] text-white font-bold shadow-xs",
};
const scanInactivePill = {
  className:
    "bg-[color:var(--color-clinic-blue)] text-white hover:bg-[color:var(--color-clinic-blue-dark)]",
};

/**
 * The one and only navbar for the whole app — the landing page ("/") uses
 * this exact component too, so there is a single source of truth for
 * sizing, spacing and nav items. Text-only, no decorative icons next to
 * the links; the only icons that remain are the functional menu toggle.
 */
export function SiteHeader() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 px-4 py-3 shadow-2xs backdrop-blur md:px-8">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3">
        <BrandLogo />

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-[color:var(--color-clinic-blue-soft)]/60 px-2 py-1.5 text-sm text-[color:var(--color-clinic-ink)] shadow-xs lg:flex">
          <Link
            to="/"
            className="rounded-full px-4 py-1.5 transition hover:bg-white hover:text-[color:var(--color-clinic-blue)]"
          >
            Beranda
          </Link>
          <Link
            to="/maps"
            activeProps={activePill}
            inactiveProps={inactivePill}
            className="ml-1 rounded-full px-4 py-1.5 transition"
          >
            Peta Lokasi
          </Link>
          <Link
            to="/consultation"
            search={{ anatomy: undefined }}
            activeProps={activePill}
            inactiveProps={inactivePill}
            className="ml-1 rounded-full px-4 py-1.5 transition"
          >
            Konsultasi
          </Link>
          <Link
            to="/anatomy"
            activeProps={activePill}
            inactiveProps={inactivePill}
            className="ml-1 rounded-full px-4 py-1.5 transition"
          >
            Anatomi
          </Link>
          <Link
            to="/scanner"
            activeProps={scanActivePill}
            inactiveProps={scanInactivePill}
            className="ml-1 rounded-full px-4 py-1.5 font-semibold transition"
          >
            Scan AI
          </Link>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to={user ? "/profile" : "/login"}
            className="hidden rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-[color:var(--color-clinic-ink)] shadow-xs transition hover:bg-white sm:inline-flex"
          >
            {user ? "Profil" : "Masuk"}
          </Link>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] transition hover:bg-[color:var(--color-clinic-blue)]/10 lg:hidden"
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
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-[color:var(--color-clinic-ink)] transition hover:bg-[color:var(--color-clinic-blue-soft)]"
            >
              Beranda
            </Link>
            <Link
              to="/maps"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-[color:var(--color-clinic-ink)] transition hover:bg-[color:var(--color-clinic-blue-soft)]"
            >
              Peta Lokasi
            </Link>
            <Link
              to="/consultation"
              search={{ anatomy: undefined }}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-[color:var(--color-clinic-ink)] transition hover:bg-[color:var(--color-clinic-blue-soft)]"
            >
              Konsultasi
            </Link>
            <Link
              to="/anatomy"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-[color:var(--color-clinic-ink)] transition hover:bg-[color:var(--color-clinic-blue-soft)]"
            >
              Anatomi
            </Link>
            <Link
              to="/scanner"
              onClick={() => setIsMenuOpen(false)}
              className="mt-1 inline-flex items-center justify-center rounded-xl bg-[color:var(--color-clinic-blue)] px-3 py-2.5 text-sm font-semibold text-white"
            >
              Scan AI
            </Link>
            <Link
              to={user ? "/profile" : "/login"}
              onClick={() => setIsMenuOpen(false)}
              className="mt-1 inline-flex items-center justify-center rounded-xl border border-black/10 px-3 py-2.5 text-sm font-medium text-[color:var(--color-clinic-ink)]"
            >
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
      className={`inline-flex items-center text-xs font-medium text-[color:var(--color-clinic-muted)] transition hover:text-[color:var(--color-clinic-blue)] ${className}`}
    >
      Kembali ke Beranda
    </Link>
  );
}
