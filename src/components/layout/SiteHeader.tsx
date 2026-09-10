import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Bell, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
              ${
                isUnderPill
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
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/95 px-3 py-2.5 shadow-xs backdrop-blur-md sm:px-6 md:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center shrink-0">
          <BrandLogo size="sm" />
        </div>

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
                aria-label="Notifikasi dan pengingat obat"
                title="Notifikasi dan pengingat obat"
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-clinic-blue)]/15 bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] transition hover:bg-[color:var(--color-clinic-blue)] hover:text-white sm:inline-flex"
              >
                <Bell className="h-4 w-4" />
              </Link>
              <Link
                to="/profile"
                className="hidden items-center justify-center rounded-full border border-[color:var(--color-clinic-blue)]/15 bg-[color:var(--color-clinic-blue-soft)] px-4 py-1.5 text-sm font-semibold text-[color:var(--color-clinic-blue)] transition hover:bg-[color:var(--color-clinic-blue)] hover:text-white sm:inline-flex"
              >
                {profile?.full_name?.split(" ")[0] || "Profil"}
              </Link>
            </>
          ) : (
            <div className="hidden items-center gap-2 xs:flex">
              <motion.div
                whileHover={{ y: -2, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Link
                  to="/login"
                  className="group inline-flex items-center justify-center rounded-full bg-[color:var(--color-clinic-blue)] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[color:var(--color-clinic-blue)]/25 outline-none transition-all duration-300 hover:bg-[color:var(--color-clinic-blue-dark)] hover:shadow-lg hover:shadow-[color:var(--color-clinic-blue)]/35 focus-visible:ring-2 focus-visible:ring-[color:var(--color-clinic-blue)] focus-visible:ring-offset-2"
                >
                  <span className="transition-transform duration-300 group-hover:scale-[1.02]">Masuk</span>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ y: -2, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center rounded-full bg-[color:var(--color-clinic-blue)] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[color:var(--color-clinic-blue)]/25 outline-none transition-all duration-300 hover:bg-[color:var(--color-clinic-blue-dark)] hover:shadow-lg hover:shadow-[color:var(--color-clinic-blue)]/35 focus-visible:ring-2 focus-visible:ring-[color:var(--color-clinic-blue)] focus-visible:ring-offset-2"
                >
                  <span className="transition-transform duration-300 group-hover:scale-[1.02]">Daftar</span>
                </Link>
              </motion.div>
            </div>
          )}

          {!loading &&
            (!user ? (
              <motion.div whileTap={{ scale: 0.93 }} className="xs:hidden">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-clinic-blue)] px-3 py-1.5 text-[11px] font-semibold text-white shadow-xs transition-transform duration-200"
                >
                  Masuk
                </Link>
              </motion.div>
            ) : (
              <motion.div whileTap={{ scale: 0.93 }} className="sm:hidden">
                <Link
                  to="/profile"
                  className="inline-flex max-w-[82px] items-center justify-center truncate rounded-full bg-[color:var(--color-clinic-blue-soft)] px-3 py-1.5 text-[11px] font-semibold text-[color:var(--color-clinic-blue)] transition-transform duration-200"
                >
                  {profile?.full_name?.split(" ")[0] || "Profil"}
                </Link>
              </motion.div>
            ))}

          <motion.button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            whileTap={{ scale: 0.9 }}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] transition-colors duration-200 hover:bg-[color:var(--color-clinic-blue)]/10 lg:hidden"
            aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isMenuOpen}
          >
            <motion.span
              key={isMenuOpen ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="inline-flex"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-4 right-4 top-[calc(100%+8px)] z-50 rounded-2xl border border-black/5 bg-white p-3 shadow-xl lg:hidden"
          >
            <nav className="flex flex-col gap-1">
              {TABS.map((tab) => {
                const isActive =
                  tab.path === "/" ? currentPath === "/" : currentPath.startsWith(tab.path);
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    search={tab.search as any}
                    onClick={() => setIsMenuOpen(false)}
                    className={`rounded-xl px-3.5 py-2.5 text-sm transition-colors duration-200 ${
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
                  className={`rounded-xl px-3.5 py-2.5 text-sm transition-colors duration-200 ${
                    currentPath.startsWith("/reminders")
                      ? "font-semibold text-[color:var(--color-clinic-blue)] bg-white"
                      : "font-medium text-[color:var(--color-clinic-ink)] hover:bg-gray-50"
                  }`}
                >
                  Notifikasi
                </Link>
              )}
              {!user && (
                <div className="mt-1 flex flex-col gap-1.5 border-t border-black/5 pt-2.5">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-xl bg-[color:var(--color-clinic-blue)] px-3.5 py-2.5 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-[color:var(--color-clinic-blue-dark)]"
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-xl bg-[color:var(--color-clinic-blue)] px-3.5 py-2.5 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-[color:var(--color-clinic-blue-dark)]"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
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
