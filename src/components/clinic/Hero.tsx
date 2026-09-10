import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
  MessageCircleHeart,
  RotateCcw,
  ScanLine,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import fotodokter2 from "@/assets/fotodokter.webp?url";
import raffasyaAvatar from "@/assets/Raffasya Javas Niscala Widjaja.avif?url";
import ahmadAvatar from "@/assets/Ahmad Rhezki Prasetya.avif?url";
import muhamadAvatar from "@/assets/Muhamad Fedliansyah Ilham.avif?url";
import { FloatingCard } from "./FloatingCard";
import { SiteHeader } from "@/components/layout/SiteHeader";

const AVATARS = [raffasyaAvatar, muhamadAvatar, ahmadAvatar];

interface DesktopCoords {
  avatarHeight: number;
  avatarTop: number;
  card1: { top: number; left: number; width: number };
  card2: { top: number; left: number; width: number };
  card3: { top: number; left: number; width: number };
}

interface MobileCoords {
  avatarHeight: number;
  avatarTop: number;
  card1: { top: number; left: number; width: number };
  card2: { top: number; right: number; width: number };
  card3: { top: number; right: number; width: number };
}

const DEFAULT_DESKTOP: DesktopCoords = {
  avatarHeight: 617,
  avatarTop: -60,
  card1: { top: 38, left: -32, width: 148 },
  card2: { top: 55, left: 357, width: 159 },
  card3: { top: 207, left: 376, width: 154 },
};

const DEFAULT_MOBILE: MobileCoords = {
  avatarHeight: 278,
  avatarTop: -4,
  card1: { top: 10, left: -40, width: 110 },
  card2: { top: 5, right: -43, width: 115 },
  card3: { top: 250, right: -11, width: 114 },
};

export function Hero() {
  const [desktop, setDesktop] = useState<DesktopCoords>(() => {
    try {
      const saved = localStorage.getItem("siaga_hero_desktop_v5");
      return saved ? JSON.parse(saved) : DEFAULT_DESKTOP;
    } catch {
      return DEFAULT_DESKTOP;
    }
  });

  const [mobile, setMobile] = useState<MobileCoords>(() => {
    try {
      const saved = localStorage.getItem("siaga_hero_mobile_v5");
      return saved ? JSON.parse(saved) : DEFAULT_MOBILE;
    } catch {
      return DEFAULT_MOBILE;
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const [opacity, setOpacity] = useState(0.95);
  const [panelPos, setPanelPos] = useState({ top: 75, left: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    try {
      localStorage.setItem("siaga_hero_desktop_v5", JSON.stringify(desktop));
    } catch {}
  }, [desktop]);

  useEffect(() => {
    try {
      localStorage.setItem("siaga_hero_mobile_v5", JSON.stringify(mobile));
    } catch {}
  }, [mobile]);

  // Dragging logic for floating tuner box
  const handleStartDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragOffset({
      x: clientX - panelPos.left,
      y: clientY - panelPos.top,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newLeft = Math.max(10, Math.min(window.innerWidth - 320, e.clientX - dragOffset.x));
      const newTop = Math.max(10, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y));
      setPanelPos({ left: newLeft, top: newTop });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;
      const touch = e.touches[0];
      const newLeft = Math.max(10, Math.min(window.innerWidth - 300, touch.clientX - dragOffset.x));
      const newTop = Math.max(10, Math.min(window.innerHeight - 100, touch.clientY - dragOffset.y));
      setPanelPos({ left: newLeft, top: newTop });
    };

    const handleEndDrag = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEndDrag);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleEndDrag);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEndDrag);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEndDrag);
    };
  }, [isDragging, dragOffset]);

  const handleCopyJSON = () => {
    const payload = JSON.stringify({ desktop, mobile }, null, 2);
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleReset = () => {
    setDesktop(DEFAULT_DESKTOP);
    setMobile(DEFAULT_MOBILE);
    localStorage.removeItem("siaga_hero_desktop_v5");
    localStorage.removeItem("siaga_hero_mobile_v5");
  };

  const moveTo = (corner: "tl" | "tr" | "bl") => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (corner === "tl") setPanelPos({ top: 70, left: 16 });
    if (corner === "tr") setPanelPos({ top: 70, left: Math.max(16, w - 380) });
    if (corner === "bl") setPanelPos({ top: Math.max(16, h - 520), left: 16 });
  };

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
                
                {/* Doctor Avatar Image - Responsive to Tuner Settings */}
                <img
                  src={fotodokter2}
                  alt="Dokter dengan stetoskop"
                  className="hidden min-[900px]:block animate-fade-up w-auto max-w-full object-contain pointer-events-none select-none"
                  style={{
                    height: `${desktop.avatarHeight}px`,
                    marginTop: `${desktop.avatarTop}px`,
                    animationDuration: "0.7s",
                  }}
                />
                <img
                  src={fotodokter2}
                  alt="Dokter dengan stetoskop"
                  className="min-[900px]:hidden animate-fade-up w-auto max-w-full object-contain pointer-events-none select-none"
                  style={{
                    height: `${mobile.avatarHeight}px`,
                    marginTop: `${mobile.avatarTop}px`,
                    animationDuration: "0.7s",
                  }}
                />

                {/* Floating overlay cards - Desktop only (≥900px) */}
                <FloatingCard
                  className="hidden min-[900px]:block p-2.5 shadow-xl"
                  style={{
                    top: `${desktop.card1.top}px`,
                    left: `${desktop.card1.left}px`,
                    width: `${desktop.card1.width}px`,
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
                    top: `${desktop.card2.top}px`,
                    left: `${desktop.card2.left}px`,
                    width: `${desktop.card2.width}px`,
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
                    top: `${desktop.card3.top}px`,
                    left: `${desktop.card3.left}px`,
                    width: `${desktop.card3.width}px`,
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
                      top: `${mobile.card1.top}px`,
                      left: `${mobile.card1.left}px`,
                      width: `${mobile.card1.width}px`,
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
                      top: `${mobile.card2.top}px`,
                      right: `${mobile.card2.right}px`,
                      width: `${mobile.card2.width}px`,
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
                      top: `${mobile.card3.top}px`,
                      right: `${mobile.card3.right}px`,
                      width: `${mobile.card3.width}px`,
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

      {/* FLOATING TUNER TOGGLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-[9999] flex items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue)] px-4 py-3 text-sm font-bold text-white shadow-2xl transition hover:scale-105 hover:bg-[color:var(--color-clinic-blue-dark)] active:scale-95 cursor-pointer"
      >
        <Settings className={`h-5 w-5 ${isOpen ? "rotate-90 transition-transform" : ""}`} />
        <span>{isOpen ? "Tutup Tuner" : "🛠️ Hero Layout Tuner"}</span>
      </button>

      {/* DRAGGABLE TUNER CONTROL PANEL MODAL */}
      {isOpen && (
        <div
          style={{
            top: `${panelPos.top}px`,
            left: `${panelPos.left}px`,
            opacity: opacity,
          }}
          className="fixed z-[9999] w-[90vw] sm:w-[350px] max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-300 bg-white p-3.5 sm:p-4 shadow-2xl transition-opacity duration-200"
        >
          {/* DRAGGABLE HEADER BAR */}
          <div
            onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
            onTouchStart={(e) => e.touches[0] && handleStartDrag(e.touches[0].clientX, e.touches[0].clientY)}
            className="flex items-center justify-between border-b pb-2 cursor-grab active:cursor-grabbing select-none bg-slate-50 -mx-3.5 -mt-3.5 p-3 rounded-t-3xl border-slate-200"
            title="Tarik / Geser bagian ini untuk memindahkan panel ke mana saja di layar"
          >
            <div>
              <h4 className="text-xs font-extrabold text-[color:var(--color-clinic-ink)] flex items-center gap-1">
                <span>🖐️</span> Geser Panel Tuner
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">
                Tarik header ini ke mana saja di layar
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOpacity(opacity === 1 ? 0.45 : 1)}
                className="rounded-lg bg-slate-200 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-300 cursor-pointer"
                title="Ubah Transparansi Panel"
              >
                {opacity === 1 ? "👁️ Transparan" : "⬛ Solid"}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* QUICK CORNER POSITION BUTTONS */}
          <div className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-100 p-1.5 text-[10px] font-bold">
            <span className="text-slate-500">Pindah Cepat:</span>
            <div className="flex gap-1">
              <button
                onClick={() => moveTo("tl")}
                className="rounded bg-white px-2 py-0.5 text-slate-700 shadow-2xs hover:bg-slate-200 cursor-pointer"
                title="Pindah ke Kiri Atas"
              >
                ↖️ Kiri Atas
              </button>
              <button
                onClick={() => moveTo("tr")}
                className="rounded bg-white px-2 py-0.5 text-slate-700 shadow-2xs hover:bg-slate-200 cursor-pointer"
                title="Pindah ke Kanan Atas"
              >
                ↗️ Kanan Atas
              </button>
              <button
                onClick={() => moveTo("bl")}
                className="rounded bg-white px-2 py-0.5 text-slate-700 shadow-2xs hover:bg-slate-200 cursor-pointer"
                title="Pindah ke Kiri Bawah"
              >
                ↙️ Kiri Bawah
              </button>
            </div>
          </div>

          {/* DEVICE TAB SWITCHER */}
          <div className="mt-2 flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setActiveTab("desktop")}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === "desktop"
                  ? "bg-white text-[color:var(--color-clinic-blue)] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Desktop (≥ 900px)
            </button>
            <button
              onClick={() => setActiveTab("mobile")}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === "mobile"
                  ? "bg-white text-[color:var(--color-clinic-blue)] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Mobile / HP (&lt; 900px)
            </button>
          </div>

          <div className="mt-3 space-y-3 text-xs">
            {activeTab === "desktop" ? (
              <>
                {/* DESKTOP AVATAR TUNER */}
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                  <p className="font-bold text-slate-800 mb-1.5 text-[11px]">👨‍⚕️ Avatar Dokter (Desktop)</p>
                  <div className="space-y-1.5">
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>Tinggi (Height):</span>
                        <span className="font-mono font-bold text-blue-600">{desktop.avatarHeight}px</span>
                      </div>
                      <input
                        type="range"
                        min="200"
                        max="650"
                        value={desktop.avatarHeight}
                        onChange={(e) => setDesktop({ ...desktop, avatarHeight: Number(e.target.value) })}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>Margin Top:</span>
                        <span className="font-mono font-bold text-blue-600">{desktop.avatarTop}px</span>
                      </div>
                      <input
                        type="range"
                        min="-60"
                        max="100"
                        value={desktop.avatarTop}
                        onChange={(e) => setDesktop({ ...desktop, avatarTop: Number(e.target.value) })}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* CARD 1 DESKTOP */}
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                  <p className="font-bold text-slate-800 mb-1.5 text-[11px]">1️⃣ Card 1: Progres Pemulihan (Kiri)</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <span className="block text-[9px] text-slate-500">Top</span>
                      <input
                        type="number"
                        value={desktop.card1.top}
                        onChange={(e) => setDesktop({ ...desktop, card1: { ...desktop.card1, top: Number(e.target.value) } })}
                        className="w-full rounded-md border border-slate-300 p-1 font-mono text-[11px] font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500">Left</span>
                      <input
                        type="number"
                        value={desktop.card1.left}
                        onChange={(e) => setDesktop({ ...desktop, card1: { ...desktop.card1, left: Number(e.target.value) } })}
                        className="w-full rounded-md border border-slate-300 p-1 font-mono text-[11px] font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500">Width</span>
                      <input
                        type="number"
                        value={desktop.card1.width}
                        onChange={(e) => setDesktop({ ...desktop, card1: { ...desktop.card1, width: Number(e.target.value) } })}
                        className="w-full rounded-md border border-slate-300 p-1 font-mono text-[11px] font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* CARD 2 DESKTOP */}
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                  <p className="font-bold text-slate-800 mb-1.5 text-[11px]">2️⃣ Card 2: Scan AI (Kanan Atas)</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <span className="block text-[9px] text-slate-500">Top</span>
                      <input
                        type="number"
                        value={desktop.card2.top}
                        onChange={(e) => setDesktop({ ...desktop, card2: { ...desktop.card2, top: Number(e.target.value) } })}
                        className="w-full rounded-md border border-slate-300 p-1 font-mono text-[11px] font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500">Left</span>
                      <input
                        type="number"
                        value={desktop.card2.left}
                        onChange={(e) => setDesktop({ ...desktop, card2: { ...desktop.card2, left: Number(e.target.value) } })}
                        className="w-full rounded-md border border-slate-300 p-1 font-mono text-[11px] font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500">Width</span>
                      <input
                        type="number"
                        value={desktop.card2.width}
                        onChange={(e) => setDesktop({ ...desktop, card2: { ...desktop.card2, width: Number(e.target.value) } })}
                        className="w-full rounded-md border border-slate-300 p-1 font-mono text-[11px] font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* CARD 3 DESKTOP */}
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                  <p className="font-bold text-slate-800 mb-1.5 text-[11px]">3️⃣ Card 3: Konsultasi AI (Kanan Bawah)</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <span className="block text-[9px] text-slate-500">Top</span>
                      <input
                        type="number"
                        value={desktop.card3.top}
                        onChange={(e) => setDesktop({ ...desktop, card3: { ...desktop.card3, top: Number(e.target.value) } })}
                        className="w-full rounded-md border border-slate-300 p-1 font-mono text-[11px] font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500">Left</span>
                      <input
                        type="number"
                        value={desktop.card3.left}
                        onChange={(e) => setDesktop({ ...desktop, card3: { ...desktop.card3, left: Number(e.target.value) } })}
                        className="w-full rounded-md border border-slate-300 p-1 font-mono text-[11px] font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500">Width</span>
                      <input
                        type="number"
                        value={desktop.card3.width}
                        onChange={(e) => setDesktop({ ...desktop, card3: { ...desktop.card3, width: Number(e.target.value) } })}
                        className="w-full rounded-md border border-slate-300 p-1 font-mono text-[11px] font-bold"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* MOBILE AVATAR TUNER */}
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                  <p className="font-bold text-slate-800 mb-1.5 text-[11px]">📱 Avatar Dokter (Mobile / HP)</p>
                  <div className="space-y-1.5">
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>Tinggi (Height):</span>
                        <span className="font-mono font-bold text-blue-600">{mobile.avatarHeight}px</span>
                      </div>
                      <input
                        type="range"
                        min="180"
                        max="500"
                        value={mobile.avatarHeight}
                        onChange={(e) => setMobile({ ...mobile, avatarHeight: Number(e.target.value) })}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>Margin Top:</span>
                        <span className="font-mono font-bold text-blue-600">{mobile.avatarTop}px</span>
                      </div>
                      <input
                        type="range"
                        min="-40"
                        max="80"
                        value={mobile.avatarTop}
                        onChange={(e) => setMobile({ ...mobile, avatarTop: Number(e.target.value) })}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* CARD 1 MOBILE */}
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                  <p className="font-bold text-slate-800 mb-1.5 text-[11px]">1️⃣ Card 1: Progres Pulih (Mobile Kiri)</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <span className="block text-[9px] text-slate-500">Top</span>
                      <input
                        type="number"
                        value={mobile.card1.top}
                        onChange={(e) => setMobile({ ...mobile, card1: { ...mobile.card1, top: Number(e.target.value) } })}
                        className="w-full rounded-md border border-slate-300 p-1 font-mono text-[11px] font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500">Left</span>
                      <input
                        type="number"
                        value={mobile.card1.left}
                        onChange={(e) => setMobile({ ...mobile, card1: { ...mobile.card1, left: Number(e.target.value) } })}
                        className="w-full rounded-md border border-slate-300 p-1 font-mono text-[11px] font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500">Width</span>
                      <input
                        type="number"
                        value={mobile.card1.width}
                        onChange={(e) => setMobile({ ...mobile, card1: { ...mobile.card1, width: Number(e.target.value) } })}
                        className="w-full rounded-md border border-slate-300 p-1 font-mono text-[11px] font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* CARD 2 MOBILE */}
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                  <p className="font-bold text-slate-800 mb-1.5 text-[11px]">2️⃣ Card 2: Scan AI (Mobile Kanan Atas)</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <span className="block text-[9px] text-slate-500">Top</span>
                      <input
                        type="number"
                        value={mobile.card2.top}
                        onChange={(e) => setMobile({ ...mobile, card2: { ...mobile.card2, top: Number(e.target.value) } })}
                        className="w-full rounded-md border border-slate-300 p-1 font-mono text-[11px] font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500">Right</span>
                      <input
                        type="number"
                        value={mobile.card2.right}
                        onChange={(e) => setMobile({ ...mobile, card2: { ...mobile.card2, right: Number(e.target.value) } })}
                        className="w-full rounded-md border border-slate-300 p-1 font-mono text-[11px] font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500">Width</span>
                      <input
                        type="number"
                        value={mobile.card2.width}
                        onChange={(e) => setMobile({ ...mobile, card2: { ...mobile.card2, width: Number(e.target.value) } })}
                        className="w-full rounded-md border border-slate-300 p-1 font-mono text-[11px] font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* CARD 3 MOBILE */}
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                  <p className="font-bold text-slate-800 mb-1.5 text-[11px]">3️⃣ Card 3: Konsultasi AI (Mobile Kanan Bawah)</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <span className="block text-[9px] text-slate-500">Top</span>
                      <input
                        type="number"
                        value={mobile.card3.top}
                        onChange={(e) => setMobile({ ...mobile, card3: { ...mobile.card3, top: Number(e.target.value) } })}
                        className="w-full rounded-md border border-slate-300 p-1 font-mono text-[11px] font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500">Right</span>
                      <input
                        type="number"
                        value={mobile.card3.right}
                        onChange={(e) => setMobile({ ...mobile, card3: { ...mobile.card3, right: Number(e.target.value) } })}
                        className="w-full rounded-md border border-slate-300 p-1 font-mono text-[11px] font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500">Width</span>
                      <input
                        type="number"
                        value={mobile.card3.width}
                        onChange={(e) => setMobile({ ...mobile, card3: { ...mobile.card3, width: Number(e.target.value) } })}
                        className="w-full rounded-md border border-slate-300 p-1 font-mono text-[11px] font-bold"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ACTION BUTTONS: COPY & RESET */}
            <div className="pt-1.5 space-y-1.5">
              <button
                onClick={handleCopyJSON}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-lg transition cursor-pointer ${
                  copied
                    ? "bg-emerald-600"
                    : "bg-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue-dark)]"
                }`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "KOORDINAT BERHASIL DISALIN!" : "📋 SALIN KOORDINAT / COPY JSON"}</span>
              </button>

              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset ke Default</span>
              </button>
            </div>

            {/* RAW JSON DISPLAY AREA */}
            <div className="mt-2">
              <span className="block text-[10px] font-bold text-slate-500 mb-1">
                Data JSON Koordinat:
              </span>
              <textarea
                readOnly
                rows={5}
                value={JSON.stringify({ desktop, mobile }, null, 2)}
                className="w-full rounded-xl border border-slate-200 bg-slate-900 p-2 font-mono text-[10px] text-emerald-400 select-all"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

