import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useAuth } from "@/lib/auth/auth-context";

const TABS = [
  { label: "Beranda", path: "/" },
  { label: "Peta Lokasi", path: "/maps" },
  { label: "Konsultasi", path: "/consultation", search: { anatomy: undefined } },
  { label: "Anatomi", path: "/anatomy" },
  { label: "Scan", path: "/scanner" },
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
  const { user, profile, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/95 px-4 py-2.5 shadow-xs backdrop-blur-md sm:px-6 md:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3">
        <BrandLogo size="sm" />

        <SlideTabs />

        <div className="flex items-center gap-2 shrink-0 min-h-[36px]">
          {loading ? (
            /* Pulsing skeleton during auth initialization prevents wrong button flash on page refresh */
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-9 w-20 rounded-full bg-[color:var(--color-clinic-blue-soft)] animate-pulse" />
            </div>
          ) : user ? (
            <>
              <Link
                to="/reminders"
                className="hidden items-center justify-center rounded-full border border-[color:var(--color-clinic-blue)]/15 bg-[color:var(--color-clinic-blue-soft)] px-3.5 py-1.5 text-xs font-semibold text-[color:var(--color-clinic-blue)] transition hover:bg-[color:var(--color-clinic-blue)] hover:text-white sm:inline-flex"
              >
                Notifikasi
              </Link>
              <Link
                to="/profile"
                className="hidden items-center justify-center rounded-full border border-[color:var(--color-clinic-blue)]/15 bg-[color:var(--color-clinic-blue-soft)] px-4 py-1.5 text-sm font-semibold text-[color:var(--color-clinic-blue)] transition hover:bg-[color:var(--color-clinic-blue)] hover:text-white sm:inline-flex"
              >
                {profile?.full_name?.split(" ")[0] || "Profil"}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden items-center justify-center rounded-full bg-[color:var(--color-clinic-blue)] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[color:var(--color-clinic-blue)]/20 transition hover:bg-[color:var(--color-clinic-blue-dark)] sm:inline-flex"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="hidden items-center justify-center rounded-full border border-[color:var(--color-clinic-blue)]/15 bg-[color:var(--color-clinic-blue-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--color-clinic-blue)] transition hover:bg-[color:var(--color-clinic-blue)] hover:text-white sm:inline-flex"
              >
                Daftar
              </Link>
            </>
          )}

          {!loading && (
            !user ? (
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-clinic-blue)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs sm:hidden"
              >
                Masuk
              </Link>
            ) : (
              <Link
                to="/profile"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-clinic-blue-soft)] px-3.5 py-1.5 text-xs font-semibold text-[color:var(--color-clinic-blue)] sm:hidden"
              >
                {profile?.full_name?.split(" ")[0] || "Profil"}
              </Link>
            )
          )}

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
        <div className="absolute left-4 right-4 top-[calc(100%+8px)] z-50 rounded-2xl border border-black/5 bg-white p-3 shadow-xl lg:hidden">
          <nav className="flex flex-col gap-1">
            {TABS.map((tab) => {
              const isActive = tab.path === "/" ? currentPath === "/" : currentPath.startsWith(tab.path);
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  search={tab.search as any}
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded-xl px-3.5 py-2.5 text-sm transition ${
                    isActive
                      ? "font-semibold text-[color:var(--color-clinic-blue)] bg-white"
                      : "font-medium text-[color:var(--color-clinic-ink)] hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
            {user && (
              <Link
                to="/reminders"
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-xl px-3.5 py-2.5 text-sm transition ${
                  currentPath.startsWith("/reminders")
                    ? "font-semibold text-[color:var(--color-clinic-blue)] bg-white"
                    : "font-medium text-[color:var(--color-clinic-ink)] hover:bg-gray-50"
                }`}
              >
                Notifikasi
              </Link>
            )}
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
