import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Bell, Menu, User, X } from "lucide-react";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useAuth } from "@/lib/auth/auth-context";

const TABS = [
  { label: "Beranda", path: "/" },
  { label: "Peta Lokasi", path: "/maps" },
  { label: "Konsultasi", path: "/consultation", search: { anatomy: undefined } },
  { label: "Anatomi", path: "/anatomy" },
  { label: "Scan AI", path: "/scanner" },
];

function SlideTabs() {
  const location = useLocation();
  const currentPath = location.pathname;

  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const tabsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  // Find active index based on route pathname
  const activeIndex = TABS.findIndex((tab) => {
    if (tab.path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(tab.path);
  });

  const updatePosition = (index: number) => {
    const activeTab = tabsRef.current[index];
    if (activeTab) {
      setPosition({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
        opacity: 1,
      });
    } else {
      setPosition((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  // Keep sliding pill aligned with active route on resize or pathname change
  useEffect(() => {
    const targetIdx = hoveredIndex !== null ? hoveredIndex : activeIndex;
    if (targetIdx !== -1) {
      const timer = setTimeout(() => {
        updatePosition(targetIdx);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setPosition((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [activeIndex, currentPath, hoveredIndex]);

  // Adjust on window resize
  useEffect(() => {
    const handleResize = () => {
      const targetIdx = hoveredIndex !== null ? hoveredIndex : activeIndex;
      if (targetIdx !== -1) {
        updatePosition(targetIdx);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeIndex, hoveredIndex]);

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    if (activeIndex !== -1) {
      updatePosition(activeIndex);
    } else {
      setPosition((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  const currentPillIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

  return (
    <nav
      onMouseLeave={handleMouseLeave}
      className="absolute left-1/2 hidden -translate-x-1/2 items-center whitespace-nowrap rounded-full bg-[color:var(--color-clinic-blue-soft)]/60 px-1.5 py-1 text-sm text-[color:var(--color-clinic-ink)] shadow-xs lg:flex"
    >
      {TABS.map((tab, i) => {
        const isUnderPill = currentPillIndex === i;

        return (
          <Link
            key={tab.path}
            to={tab.path}
            search={tab.search as any}
            ref={(el) => {
              tabsRef.current[i] = el;
            }}
            onMouseEnter={() => {
              setHoveredIndex(i);
              updatePosition(i);
            }}
            className={`relative z-10 rounded-full px-4 py-1.5 transition-colors duration-200 cursor-pointer select-none
              ${isUnderPill
                ? "text-white font-semibold"
                : "text-[color:var(--color-clinic-ink)] font-medium hover:text-[color:var(--color-clinic-blue)]"
              }
            `}
          >
            {tab.label}
          </Link>
        );
      })}

      <Cursor position={position} />
    </nav>
  );
}

const Cursor = ({ position }: { position: { left: number; width: number; opacity: number } }) => {
  return (
    <motion.div
      animate={{
        left: position.left,
        width: position.width,
        opacity: position.opacity,
      }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="absolute z-0 h-[28px] rounded-full bg-[color:var(--color-clinic-blue)] shadow-md"
    />
  );
};

/**
 * The one and only navbar for the whole app — the landing page ("/") uses
 * this exact component too, so there is a single source of truth for
 * sizing, spacing and nav items.
 */
export function SiteHeader() {
  const { user, profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 px-5 py-2.5 shadow-2xs backdrop-blur sm:px-6 md:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3">
        <BrandLogo size="sm" />

        <SlideTabs />

        <div className="flex items-center gap-2 shrink-0">
          {user && (
            <Link
              to="/reminders"
              className="hidden h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] transition hover:bg-[color:var(--color-clinic-blue)]/10 sm:inline-flex"
              aria-label="Notifikasi"
              title="Notifikasi"
            >
              <Bell className="h-4 w-4" />
            </Link>
          )}
          <Link
            to={user ? "/profile" : "/login"}
            className="hidden items-center gap-2 rounded-full bg-white/80 py-1 pl-1 pr-3.5 text-sm font-medium text-[color:var(--color-clinic-ink)] shadow-xs transition hover:bg-white sm:inline-flex"
          >
            {user ? (
              <>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
                  <User className="h-3.5 w-3.5" />
                </span>
                {profile?.full_name?.split(" ")[0] || "Profil"}
              </>
            ) : (
              "Masuk"
            )}
          </Link>
          <Link
            to={user ? "/profile" : "/login"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] sm:hidden"
            aria-label="Akun"
          >
            <User className="h-4 w-4" />
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
            {user && (
              <Link
                to="/reminders"
                onClick={() => setIsMenuOpen(false)}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-2.5 text-sm font-medium text-[color:var(--color-clinic-ink)]"
              >
                <Bell className="h-4 w-4" />
                Notifikasi
              </Link>
            )}
            <Link
              to={user ? "/profile" : "/login"}
              onClick={() => setIsMenuOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-2.5 text-sm font-medium text-[color:var(--color-clinic-ink)]"
            >
              <User className="h-4 w-4" />
              {user ? profile?.full_name?.split(" ")[0] || "Profil Saya" : "Masuk / Daftar"}
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
