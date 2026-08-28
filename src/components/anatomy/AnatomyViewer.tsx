import { useState } from "react";
import type { AnatomyRegion } from "@/lib/anatomy/types";
import { ANATOMY_REGIONS } from "@/data/anatomyData";
import { AnatomyHotspot } from "./AnatomyHotspot";
import { RotateCw, MousePointerClick, Activity } from "lucide-react";

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
    <div className="flex flex-col h-full rounded-[28px] bg-white p-5 md:p-6 shadow-[var(--shadow-clinic-lg)] border border-black/5">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-black/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-xl bg-[color:var(--color-clinic-blue)] text-white text-xs font-extrabold shadow-sm">
            1
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-[color:var(--color-clinic-ink)]">
              Model Anatomi 3D/2D
            </h2>
            <p className="text-[11px] text-[color:var(--color-clinic-muted)]">
              Visualisasi tubuh interaktif
            </p>
          </div>
        </div>

        {/* Front / Back Toggle Controls */}
        <div className="flex items-center gap-1 rounded-full bg-[#f1f5f9] p-1 border border-black/5 shadow-inner">
          <button
            type="button"
            onClick={() => setView("front")}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all duration-200 ${
              view === "front"
                ? "bg-[color:var(--color-clinic-blue)] text-white shadow-xs"
                : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
            }`}
          >
            Depan
          </button>
          <button
            type="button"
            onClick={() => setView("back")}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all duration-200 ${
              view === "back"
                ? "bg-[color:var(--color-clinic-blue)] text-white shadow-xs"
                : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
            }`}
          >
            Belakang
          </button>
          <button
            type="button"
            onClick={() => setView((v) => (v === "front" ? "back" : "front"))}
            className="grid h-6 w-6 place-items-center rounded-full bg-white text-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue-soft)] transition border border-black/5"
            aria-label="Putar Tampilan Anatomi"
            title="Putar Tampak Anatomi"
          >
            <RotateCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Guide hint */}
      <div className="mt-3.5 flex items-center justify-between text-[11px] text-[color:var(--color-clinic-muted)] bg-[color:var(--color-clinic-blue-soft)]/20 px-3.5 py-1.5 rounded-xl border border-[color:var(--color-clinic-blue)]/15">
        <div className="flex items-center gap-1.5 font-medium text-[color:var(--color-clinic-blue-dark)]">
          <MousePointerClick className="h-3.5 w-3.5 text-[color:var(--color-clinic-blue)] shrink-0" />
          <span>Klik titik biru pada tubuh untuk memilih bagian</span>
        </div>
        <span className="text-[10px] font-semibold text-[color:var(--color-clinic-muted)] hidden sm:inline">
          {visibleRegions.length} Titik Aktif
        </span>
      </div>

      {/* Interactive Anatomy Viewport Container */}
      <div className="relative mt-3.5 flex-1 w-full min-h-[480px] sm:min-h-[520px] rounded-2xl bg-gradient-to-b from-[#f8fafc] via-[#f1f6fa] to-[#e8f3fa] p-3 border border-black/5 shadow-inner flex flex-col justify-center items-center overflow-hidden">
        {/* Subtle decorative medical crosshair / grid background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#111_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Glowing aura under the anatomy */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-72 rounded-full bg-[color:var(--color-clinic-blue-soft)]/30 blur-3xl pointer-events-none" />

        {/* Relative wrapper matching image dimensions */}
        <div className="relative w-full h-full max-h-[500px] flex justify-center items-center">
          {/* Base Layer Anatomy PNG Image */}
          <img
            key={view}
            src={activeImageUrl}
            alt={view === "front" ? "Anatomi Tubuh Tampak Depan" : "Anatomi Tubuh Tampak Belakang"}
            className="h-full w-auto max-h-[480px] object-contain select-none transition-all duration-300 drop-shadow-md"
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
        </div>

        {/* Selected Region Floating Indicator at bottom */}
        {selectedRegion && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold text-[color:var(--color-clinic-ink)] shadow-md border border-[color:var(--color-clinic-blue)]/30 backdrop-blur-md transition-all">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--color-clinic-blue)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--color-clinic-blue)]" />
            </span>
            <span>
              Bagian Terpilih: <strong className="text-[color:var(--color-clinic-blue-dark)]">{selectedRegion.nameIndonesian}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
