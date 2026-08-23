import { useState } from "react";
import type { AnatomyRegion } from "@/lib/anatomy/types";
import { ANATOMY_REGIONS } from "@/data/anatomyData";
import { AnatomyHotspot } from "./AnatomyHotspot";
import { RotateCw, MousePointerClick } from "lucide-react";

interface AnatomyViewerProps {
  selectedRegion: AnatomyRegion | null;
  onSelectRegion: (region: AnatomyRegion) => void;
}

const FRONT_IMAGE_URL = "/anatomy/human-anatomy-front.png";
const BACK_IMAGE_URL = "/anatomy/human-anatomy-back.png";

export function AnatomyViewer({ selectedRegion, onSelectRegion }: AnatomyViewerProps) {
  const [view, setView] = useState<"front" | "back">("front");

  const visibleRegions = ANATOMY_REGIONS.filter((region) => {
    if (view === "front") return Boolean(region.frontPosition);
    return Boolean(region.backPosition);
  });

  const activeImageUrl = view === "front" ? FRONT_IMAGE_URL : BACK_IMAGE_URL;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Front / Back View Switcher Toggle */}
      <div className="flex items-center gap-1.5 rounded-full bg-white p-1 shadow-xs border border-black/5">
        <button
          type="button"
          onClick={() => setView("front")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
            view === "front"
              ? "bg-[color:var(--color-clinic-blue)] text-white shadow-sm"
              : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
          }`}
        >
          Tampak Depan
        </button>
        <button
          type="button"
          onClick={() => setView("back")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
            view === "back"
              ? "bg-[color:var(--color-clinic-blue)] text-white shadow-sm"
              : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
          }`}
        >
          Tampak Belakang
        </button>
        <button
          type="button"
          onClick={() => setView((v) => (v === "front" ? "back" : "front"))}
          className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue)]/20 transition"
          aria-label="Putar Anatomi"
          title="Putar Tampak Anatomi"
        >
          <RotateCw className="h-3 w-3" />
        </button>
      </div>

      {/* Helper Guidance Text */}
      <div className="flex items-center gap-1.5 text-[11px] text-[color:var(--color-clinic-muted)]">
        <MousePointerClick className="h-3 w-3 text-[color:var(--color-clinic-blue)] animate-bounce" />
        <span>Klik titik pada tubuh untuk memilih bagian</span>
      </div>

      {/* Image Container with Percentage Hotspot Overlay */}
      <div className="relative w-full max-w-[310px] rounded-2xl bg-white p-2.5 border border-black/5 shadow-sm flex justify-center items-center overflow-hidden">
        {/* Relative wrapper matching image dimensions */}
        <div className="relative w-full aspect-[1/2] max-h-[440px] flex justify-center items-center overflow-hidden rounded-xl bg-gradient-to-b from-slate-50 to-[color:var(--color-clinic-blue-soft)]/20">
          {/* Base Layer Anatomy PNG Image */}
          <img
            key={view}
            src={activeImageUrl}
            alt={view === "front" ? "Anatomi Manusia Tampak Depan" : "Anatomi Manusia Tampak Belakang"}
            className="h-full w-auto max-h-[420px] object-contain select-none transition-opacity duration-300 animate-fade-up"
            loading="eager"
          />

          {/* Absolute Hotspot Overlay Layer */}
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

          {/* Selected Region Badge Banner */}
          {selectedRegion && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-0.5 text-[11px] font-semibold text-[color:var(--color-clinic-blue-dark)] shadow-sm border border-[color:var(--color-clinic-blue)]/30 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-clinic-blue)] animate-ping" />
              <span>Bagian: <strong>{selectedRegion.nameIndonesian}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Region Selector Pills */}
      <div className="w-full">
        <p className="mb-1.5 text-center text-[11px] text-[color:var(--color-clinic-muted)]">
          Pilihan Cepat Bagian Tubuh:
        </p>
        <div className="flex flex-wrap justify-center gap-1 max-w-md mx-auto">
          {ANATOMY_REGIONS.map((r) => {
            const active = selectedRegion?.id === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelectRegion(r)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${
                  active
                    ? "bg-[color:var(--color-clinic-blue)] text-white shadow-xs"
                    : "bg-white text-[color:var(--color-clinic-ink)] hover:bg-[color:var(--color-clinic-blue-soft)] border border-black/5"
                }`}
              >
                {r.nameIndonesian}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
