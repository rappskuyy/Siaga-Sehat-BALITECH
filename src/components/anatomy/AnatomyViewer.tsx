import { useState, useMemo } from "react";
import type { AnatomyRegion } from "@/lib/anatomy/types";
import { ANATOMY_REGIONS } from "@/data/anatomyData";
import { AnatomyHotspot } from "./AnatomyHotspot";
import {
  MousePointerClick,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Filter,
  Check,
  Brain,
  Eye,
  Wind,
  Stethoscope,
  Heart,
  Flame,
  Activity,
  Bone,
  Layers,
  Footprints,
  Sparkles,
} from "lucide-react";

interface AnatomyViewerProps {
  selectedRegion: AnatomyRegion | null;
  onSelectRegion: (region: AnatomyRegion) => void;
}

function getRegionIcon(regionId: string) {
  if (regionId.includes("kepala")) return <Brain className="h-4 w-4" />;
  if (regionId.includes("mata")) return <Eye className="h-4 w-4" />;
  if (regionId.includes("hidung")) return <Wind className="h-4 w-4" />;
  if (regionId.includes("leher")) return <Stethoscope className="h-4 w-4" />;
  if (regionId.includes("dada")) return <Heart className="h-4 w-4" />;
  if (regionId.includes("perut")) return <Flame className="h-4 w-4" />;
  if (regionId.includes("punggung")) return <Bone className="h-4 w-4" />;
  if (regionId.includes("pinggul")) return <Layers className="h-4 w-4" />;
  if (regionId.includes("kaki")) return <Footprints className="h-4 w-4" />;
  return <Activity className="h-4 w-4" />;
}

const FRONT_IMAGE_URL = "/anatomy/human-anatomy-front.png";
const BACK_IMAGE_URL = "/anatomy/human-anatomy-back.png";

type CategoryFilter = "all" | "head" | "torso" | "spine" | "limbs";

export function AnatomyViewer({ selectedRegion, onSelectRegion }: AnatomyViewerProps) {
  const [view, setView] = useState<"front" | "back">("front");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
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

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 2.25));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setCategoryFilter("all");
  };

  const toggleView = () => {
    setView((prev) => (prev === "front" ? "back" : "front"));
  };

  return (
    <div className="flex flex-col h-full rounded-[20px] sm:rounded-[28px] bg-white p-3 sm:p-5 md:p-6 shadow-[var(--shadow-clinic-lg)] border border-black/5 justify-between select-none max-w-full overflow-hidden min-w-0">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-3 shrink-0 max-w-full min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="grid h-6 w-6 sm:h-7 sm:w-7 place-items-center rounded-xl bg-[color:var(--color-clinic-blue)] text-white text-[11px] sm:text-xs font-bold shadow-xs shrink-0">
            1
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xs sm:text-base font-bold text-[color:var(--color-clinic-ink)] truncate">
              Model Anatomi Tubuh Interaktif
            </h2>
            <p className="text-[10px] sm:text-[11px] text-[color:var(--color-clinic-muted)] truncate hidden sm:block">
              Perbesar model, putar tampak, atau pilih bagian tubuh
            </p>
          </div>
        </div>

        {/* Front / Back Segmented Switch */}
        <div className="flex items-center rounded-full bg-slate-100/90 p-0.5 border border-slate-200/80 shadow-inner shrink-0">
          <button
            type="button"
            onClick={() => setView("front")}
            className={`rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition-all duration-200 cursor-pointer min-h-[30px] sm:min-h-[36px] flex items-center ${
              view === "front"
                ? "bg-white text-[color:var(--color-clinic-ink)] shadow-xs border border-black/5 font-bold"
                : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
            }`}
          >
            Depan
          </button>
          <button
            type="button"
            onClick={() => setView("back")}
            className={`rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition-all duration-200 cursor-pointer min-h-[30px] sm:min-h-[36px] flex items-center ${
              view === "back"
                ? "bg-white text-[color:var(--color-clinic-ink)] shadow-xs border border-black/5 font-bold"
                : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
            }`}
          >
            Belakang
          </button>
        </div>
      </div>

      {/* Interactive Category Filter Pills */}
      <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs shrink-0 max-w-full min-w-0">
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
            className={`rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === cat.id
                ? "bg-[color:var(--color-clinic-blue)] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Guide hint & Mobile Quick Select Dropdown */}
      <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 text-xs text-slate-600 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-200/60 shrink-0 max-w-full overflow-hidden min-w-0">
        <div className="flex items-center gap-1.5 font-medium text-slate-700 min-w-0">
          <MousePointerClick className="h-3.5 w-3.5 text-sky-600 shrink-0" />
          <span className="text-[10px] sm:text-[11px] truncate">Klik organ atau pilih dari daftar:</span>
        </div>

        {/* Quick Organ Selector Dropdown */}
        <select
          value={selectedRegion?.id || ""}
          onChange={(e) => {
            const found = ANATOMY_REGIONS.find((r) => r.id === e.target.value);
            if (found) onSelectRegion(found);
          }}
          className="w-full sm:w-auto max-w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] sm:text-xs font-semibold text-[color:var(--color-clinic-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-clinic-blue)]/20 cursor-pointer shadow-2xs truncate"
        >
          <option value="" disabled>
            -- Pilih Organ Tubuh --
          </option>
          {ANATOMY_REGIONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nameIndonesian} ({r.symptoms.length} Gejala)
            </option>
          ))}
        </select>
      </div>

      {/* Interactive Anatomy Viewport Container */}
      <div className="relative mt-3 flex-1 w-full min-h-[340px] sm:min-h-[480px] md:min-h-[540px] lg:min-h-[600px] rounded-2xl bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]/60 p-2 sm:p-4 border border-slate-200/60 shadow-inner flex flex-col justify-center items-center overflow-hidden select-none max-w-full min-w-0">
        {/* Subtle Blueprint Dot Grid */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Soft Medical Vignette Spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-[500px] rounded-full bg-radial from-sky-200/30 via-sky-100/10 to-transparent blur-2xl pointer-events-none" />

        {/* Interactive Floating Canvas Action Controls (Zoom & Rotate) */}
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-md">
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 2.25}
            title="Perbesar Canvas (Zoom In)"
            className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-700 hover:bg-[color:var(--color-clinic-blue)] hover:text-white transition disabled:opacity-30 cursor-pointer"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.75}
            title="Perkecil Canvas (Zoom Out)"
            className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-700 hover:bg-[color:var(--color-clinic-blue)] hover:text-white transition disabled:opacity-30 cursor-pointer"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset Skala Zoom (100%)"
            className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-700 hover:bg-[color:var(--color-clinic-blue)] hover:text-white transition cursor-pointer text-[10px] font-bold"
          >
            {Math.round(zoomLevel * 100)}%
          </button>

          <div className="h-px bg-slate-200 my-0.5" />

          <button
            type="button"
            onClick={toggleView}
            title="Putar Model (Depan / Belakang)"
            className="grid h-8 w-8 place-items-center rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue-dark)] hover:bg-[color:var(--color-clinic-blue)] hover:text-white transition cursor-pointer"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        {/* Relative wrapper matching image bounds with smooth transform scale */}
        <div
          className="relative inline-flex justify-center items-center transition-transform duration-300 ease-out max-w-full"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Base Layer Anatomy PNG Image with fluid height */}
          <img
            key={view}
            src={activeImageUrl}
            alt={view === "front" ? "Anatomi Tubuh Tampak Depan" : "Anatomi Tubuh Tampak Belakang"}
            className="h-[320px] sm:h-[480px] md:h-[540px] lg:h-[600px] w-auto max-w-full object-contain select-none drop-shadow-[0_12px_24px_rgba(15,23,42,0.12)] pointer-events-none transition-all duration-300"
            loading="eager"
            draggable={false}
          />

          {/* Absolute Hotspot Overlay Layer on Top of Anatomy Image */}
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
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
