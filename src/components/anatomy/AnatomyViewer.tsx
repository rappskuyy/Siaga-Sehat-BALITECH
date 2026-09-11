import { useState, useMemo } from "react";
import type { AnatomyRegion } from "@/lib/anatomy/types";
import { ANATOMY_REGIONS } from "@/data/anatomyData";
import { AnatomyHotspot } from "./AnatomyHotspot";
import {
  MousePointerClick,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Filter,
  Sparkles,
} from "lucide-react";

interface AnatomyViewerProps {
  selectedRegion: AnatomyRegion | null;
  onSelectRegion: (region: AnatomyRegion) => void;
}

const FRONT_IMAGE_URL = "/anatomy/human-anatomy-front.svg";
const BACK_IMAGE_URL = "/anatomy/human-anatomy-back.svg";

type CategoryFilter = "all" | "head" | "torso" | "spine" | "limbs";

export function AnatomyViewer({ selectedRegion, onSelectRegion }: AnatomyViewerProps) {
  const [view, setView] = useState<"front" | "back">("front");
  const [zoomLevel, setZoomLevel] = useState<number>(1.3);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const visibleRegions = useMemo(() => {
    return ANATOMY_REGIONS.filter((region) => {
      const hasPos = view === "front" ? Boolean(region.frontPosition) : Boolean(region.backPosition);
      if (!hasPos) return false;

      if (categoryFilter === "all") return true;
      if (categoryFilter === "head") return region.id.includes("kepala") || region.id.includes("mata") || region.id.includes("hidung") || region.id.includes("leher");
      if (categoryFilter === "torso") return region.id.includes("dada") || region.id.includes("perut");
      if (categoryFilter === "spine") return region.id.includes("punggung") || region.id.includes("pinggul");
      if (categoryFilter === "limbs") return region.id.includes("lengan") || region.id.includes("kaki") || region.id.includes("lutut");
      return true;
    });
  }, [view, categoryFilter]);

  const activeImageUrl = view === "front" ? FRONT_IMAGE_URL : BACK_IMAGE_URL;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 1.3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(Number((prev - 0.15).toFixed(2)), 0.85));
  const handleResetZoom = () => {
    setZoomLevel(1.3);
    setCategoryFilter("all");
  };
  const toggleView = () => setView((prev) => (prev === "front" ? "back" : "front"));

  return (
    <div className="flex flex-col w-full h-full min-h-[540px] sm:min-h-[620px] lg:min-h-[660px] rounded-[20px] sm:rounded-[28px] bg-white p-3.5 sm:p-5 md:p-6 shadow-[var(--shadow-clinic-lg)] border border-black/5 select-none overflow-hidden min-w-0">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-3 shrink-0 max-w-full min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-[color:var(--color-clinic-blue)] text-white text-xs font-bold shadow-xs shrink-0">
            2
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xs sm:text-base font-bold text-[color:var(--color-clinic-ink)] truncate">
              Model Anatomi Tubuh Interaktif
            </h2>
            <p className="text-[10px] sm:text-[11px] text-[color:var(--color-clinic-muted)] truncate hidden sm:block">
              Perbesar model, putar tampak, atau pilih titik organ
            </p>
          </div>
        </div>

        {/* Front / Back Switch */}
        <div className="flex items-center rounded-full bg-slate-100/90 p-0.5 border border-slate-200/80 shadow-inner shrink-0">
          <button
            type="button"
            onClick={() => setView("front")}
            className={`rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center ${view === "front"
                ? "bg-white text-[color:var(--color-clinic-ink)] shadow-xs border border-black/5 font-bold"
                : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
              }`}
          >
            Depan
          </button>
          <button
            type="button"
            onClick={() => setView("back")}
            className={`rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center ${view === "back"
                ? "bg-white text-[color:var(--color-clinic-ink)] shadow-xs border border-black/5 font-bold"
                : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
              }`}
          >
            Belakang
          </button>
        </div>
      </div>

      {/* Interactive Category Filter Pills */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 pb-0.5 text-xs shrink-0 max-w-full min-w-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <span className="text-[9px] sm:text-[10px] font-bold text-[color:var(--color-clinic-muted)] uppercase tracking-wider flex items-center gap-1 shrink-0 mr-0.5">
          <Filter className="h-3 w-3" /> Filter:
        </span>
        {[
          { id: "all", label: "Semua" },
          { id: "head", label: "Kepala & Leher" },
          { id: "torso", label: "Dada & Perut" },
          { id: "spine", label: "Punggung & Pinggul" },
          { id: "limbs", label: "Lengan & Kaki" },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategoryFilter(cat.id as CategoryFilter)}
            aria-label={`Filter kategori ${cat.label}`}
            className={`rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${categoryFilter === cat.id
                ? "bg-[color:var(--color-clinic-blue)] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Prominent Callout Banner encouraging clicks or showing active organ */}
      <div className="mt-2 flex items-center justify-between gap-1.5 text-xs text-[color:var(--color-clinic-blue-dark)] bg-gradient-to-r from-[color:var(--color-clinic-blue-soft)]/60 via-[color:var(--color-clinic-blue-soft)]/30 to-white px-3 py-1.5 rounded-xl border border-[color:var(--color-clinic-blue)]/20 shrink-0 max-w-full overflow-hidden min-w-0 shadow-2xs">
        <div className="flex items-center gap-1.5 font-bold min-w-0 truncate">
          <Sparkles className="h-3.5 w-3.5 text-[color:var(--color-clinic-blue)] shrink-0 animate-pulse" />
          <span className="text-[10px] sm:text-[11px] truncate">
            {selectedRegion ? (
              <>
                Organ terpilih: <strong className="text-[color:var(--color-clinic-blue)] font-extrabold">{selectedRegion.nameIndonesian}</strong> ({selectedRegion.symptoms.length} gejala)
              </>
            ) : (
              "Klik titik organ biru pada model untuk memilih"
            )}
          </span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-[color:var(--color-clinic-muted)] bg-white px-2 py-0.5 rounded-full border border-black/5 shrink-0">
          <MousePointerClick className="h-3 w-3 text-sky-600" /> Interaktif
        </span>
      </div>

      {/* Interactive Anatomy Viewport Container */}
      <div className="relative mt-2.5 flex-1 w-full rounded-2xl bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]/60 p-2 sm:p-4 border border-slate-200/80 shadow-inner flex flex-col justify-center items-center overflow-hidden select-none max-w-full min-w-0">
        {/* Subtle Blueprint Dot Grid */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Soft Medical Vignette Spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-88 h-[480px] rounded-full bg-radial from-sky-300/35 via-sky-100/15 to-transparent blur-3xl pointer-events-none" />

        {/* Floating Canvas Guide Cue: Upper-Right space between anatomy and zoom widget */}
        {!selectedRegion && (
          <div className="absolute top-8 sm:top-9 right-16 sm:right-20 z-20 hidden sm:flex items-center gap-2 rounded-2xl bg-white/95 backdrop-blur-md p-2 text-xs border-2 border-[color:var(--color-clinic-blue)] ring-2 ring-[color:var(--color-clinic-blue-soft)]/60 shadow-md shadow-[color:var(--color-clinic-blue)]/20 pointer-events-none select-none animate-in fade-in duration-300">
            <div className="grid h-6 w-6 place-items-center rounded-xl bg-[color:var(--color-clinic-blue)] text-white shadow-xs shrink-0">
              <MousePointerClick className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col pr-1">
              <span className="font-display font-bold text-[11px] leading-tight text-[color:var(--color-clinic-ink)]">
                Klik Titik Organ
              </span>
              <span className="text-[9.5px] font-medium leading-tight text-[color:var(--color-clinic-muted)]">
                Pilih titik biru untuk mulai
              </span>
            </div>
          </div>
        )}

        {/* Interactive Floating Canvas Action Controls (Zoom & Rotate) */}
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-md">
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 1.3}
            aria-label="Perbesar model anatomi"
            title="Perbesar Canvas (Maksimal 130%)"
            className="grid h-8 w-8 min-h-[32px] min-w-[32px] place-items-center rounded-xl bg-slate-100 text-slate-700 hover:bg-[color:var(--color-clinic-blue)] hover:text-white transition disabled:opacity-30 cursor-pointer"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.85}
            aria-label="Perkecil model anatomi"
            title="Perkecil Canvas (Zoom Out)"
            className="grid h-8 w-8 min-h-[32px] min-w-[32px] place-items-center rounded-xl bg-slate-100 text-slate-700 hover:bg-[color:var(--color-clinic-blue)] hover:text-white transition disabled:opacity-30 cursor-pointer"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            aria-label="Reset ukuran model anatomi"
            title="Reset Skala Zoom (Default 130%)"
            className="grid h-8 w-8 min-h-[32px] min-w-[32px] place-items-center rounded-xl bg-slate-100 text-slate-700 hover:bg-[color:var(--color-clinic-blue)] hover:text-white transition cursor-pointer text-[10px] font-bold"
          >
            {Math.round(zoomLevel * 100)}%
          </button>

          <div className="h-px bg-slate-200 my-0.5" />

          <button
            type="button"
            onClick={toggleView}
            aria-label="Putar tampilan model anatomi"
            title="Putar Model (Depan / Belakang)"
            className="grid h-8 w-8 min-h-[32px] min-w-[32px] place-items-center rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue-dark)] hover:bg-[color:var(--color-clinic-blue)] hover:text-white transition cursor-pointer"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        {/* Relative wrapper with smooth transform scale */}
        <div
          className="relative flex-1 h-full w-full flex justify-center items-center transition-transform duration-300 ease-out py-1 sm:py-2 min-h-0 overflow-visible"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Atomic Group Container: Aspect ratio 1:2 locked so image & hotspots never separate */}
          <div
            style={{ height: "460px" }}
            className="relative aspect-[1/2] w-auto max-w-full pointer-events-auto"
          >
            {/* Base Layer Anatomy SVG Image */}
            <img
              key={view}
              src={activeImageUrl}
              alt={view === "front" ? "Anatomi Tubuh Tampak Depan" : "Anatomi Tubuh Tampak Belakang"}
              className="w-full h-full object-fill select-none drop-shadow-[0_16px_32px_rgba(15,23,42,0.14)] pointer-events-none transition-all duration-300 block"
              loading={view === "front" ? "eager" : "lazy"}
              fetchPriority={view === "front" ? "high" : "auto"}
              decoding="async"
              draggable={false}
            />

            {/* Absolute Hotspot Overlay Layer matching exact img bounding box */}
            <div className="absolute inset-0 pointer-events-none">
              {visibleRegions.map((region) => {
                const pos = view === "front" ? region.frontPosition : region.backPosition;
                if (!pos) return null;

                return (
                  <AnatomyHotspot
                    key={`${region.id}-${view}`}
                    region={region}
                    position={pos}
                    isSelected={selectedRegion?.id === region.id}
                    onSelect={onSelectRegion}
                    zoomLevel={zoomLevel}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
