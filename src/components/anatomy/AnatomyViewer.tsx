import { useState, useMemo } from "react";
import type { AnatomyRegion } from "@/lib/anatomy/types";
import { ANATOMY_REGIONS } from "@/data/anatomyData";
import { AnatomyHotspot } from "./AnatomyHotspot";
import { MousePointerClick, Layers, Sparkles, CheckCircle2 } from "lucide-react";

interface AnatomyViewerProps {
  selectedRegion: AnatomyRegion | null;
  onSelectRegion: (region: AnatomyRegion) => void;
}

const FRONT_IMAGE_URL = "/anatomy/human-anatomy-front.png";
const BACK_IMAGE_URL = "/anatomy/human-anatomy-back.png";

export function AnatomyViewer({ selectedRegion, onSelectRegion }: AnatomyViewerProps) {
  const [view, setView] = useState<"front" | "back">("front");

  const visibleRegions = useMemo(() => {
    return ANATOMY_REGIONS.filter((region) => {
      if (view === "front") return Boolean(region.frontPosition);
      return Boolean(region.backPosition);
    });
  }, [view]);

  const activeImageUrl = view === "front" ? FRONT_IMAGE_URL : BACK_IMAGE_URL;

  return (
    <div className="flex flex-col h-full rounded-[28px] bg-white p-5 md:p-6 shadow-[var(--shadow-clinic-lg)] border border-black/5 justify-between">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-black/5 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="grid h-7 w-7 place-items-center rounded-xl bg-[color:var(--color-clinic-blue)] text-white text-xs font-bold shadow-xs">
            1
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-[color:var(--color-clinic-ink)]">
              Model Anatomi Tubuh
            </h2>
            <p className="text-[11px] text-[color:var(--color-clinic-muted)]">
              Visualisasi interaktif resolusi tinggi
            </p>
          </div>
        </div>

        {/* Front / Back Segmented Switch */}
        <div className="flex items-center rounded-full bg-slate-100/90 p-1 border border-slate-200/80 shadow-inner">
          <button
            type="button"
            onClick={() => setView("front")}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer ${
              view === "front"
                ? "bg-white text-[color:var(--color-clinic-ink)] shadow-xs border border-black/5"
                : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
            }`}
          >
            Depan
          </button>
          <button
            type="button"
            onClick={() => setView("back")}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer ${
              view === "back"
                ? "bg-white text-[color:var(--color-clinic-ink)] shadow-xs border border-black/5"
                : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
            }`}
          >
            Belakang
          </button>
        </div>
      </div>

      {/* Guide hint */}
      <div className="mt-3.5 flex items-center justify-between text-xs text-slate-600 bg-slate-50/80 px-3.5 py-2 rounded-xl border border-slate-200/60 shrink-0">
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <MousePointerClick className="h-3.5 w-3.5 text-sky-600 shrink-0" />
          <span className="text-[11px]">Klik titik pada organ tubuh untuk melihat & memilih gejala</span>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 hidden sm:inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
          {visibleRegions.length} Titik Aktif
        </span>
      </div>

      {/* Interactive Anatomy Viewport Container */}
      <div className="relative mt-3.5 flex-1 w-full min-h-[500px] sm:min-h-[560px] md:min-h-[620px] rounded-2xl bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]/60 p-4 border border-slate-200/60 shadow-inner flex flex-col justify-center items-center overflow-hidden select-none">
        {/* Subtle Blueprint Dot Grid */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Soft Medical Vignette Spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-[500px] rounded-full bg-radial from-sky-200/30 via-sky-100/10 to-transparent blur-2xl pointer-events-none" />

        {/* Relative wrapper matching image bounds strictly at 100% scale */}
        <div className="relative inline-flex justify-center items-center">
          {/* Base Layer Anatomy PNG Image */}
          <img
            key={view}
            src={activeImageUrl}
            alt={view === "front" ? "Anatomi Tubuh Tampak Depan" : "Anatomi Tubuh Tampak Belakang"}
            className="h-[520px] sm:h-[580px] md:h-[640px] w-auto max-w-none object-contain select-none drop-shadow-[0_12px_24px_rgba(15,23,42,0.12)] pointer-events-none"
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

        {/* Selected Region Bottom Glass Pill Indicator */}
        {selectedRegion && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 rounded-full backdrop-blur-xl bg-white/95 px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-[0_10px_25px_-5px_rgba(15,23,42,0.15)] border border-slate-200/90 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600" />
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-normal text-[11px]">Bagian Terpilih:</span>
              <strong className="text-slate-900 font-bold text-xs">
                {selectedRegion.nameIndonesian}
              </strong>
            </div>
            <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full font-medium border border-sky-100">
              {selectedRegion.symptoms.length} Gejala
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
