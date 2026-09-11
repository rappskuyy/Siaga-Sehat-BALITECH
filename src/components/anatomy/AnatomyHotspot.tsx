import { useState } from "react";
import type { AnatomyRegion, Position } from "@/lib/anatomy/types";
import {
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
  Check,
  ChevronRight,
  CircleDot,
} from "lucide-react";

interface AnatomyHotspotProps {
  region: AnatomyRegion;
  position: Position;
  isSelected: boolean;
  showAlwaysLabel?: boolean;
  onSelect: (region: AnatomyRegion) => void;
  pinScale?: number;
}

function getRegionIcon(regionId: string) {
  if (regionId.includes("kepala")) return <Brain className="h-3.5 w-3.5" />;
  if (regionId.includes("mata")) return <Eye className="h-3.5 w-3.5" />;
  if (regionId.includes("hidung")) return <Wind className="h-3.5 w-3.5" />;
  if (regionId.includes("leher")) return <Stethoscope className="h-3.5 w-3.5" />;
  if (regionId.includes("dada")) return <Heart className="h-3.5 w-3.5" />;
  if (regionId.includes("perut")) return <Flame className="h-3.5 w-3.5" />;
  if (regionId.includes("punggung")) return <Bone className="h-3.5 w-3.5" />;
  if (regionId.includes("pinggul")) return <Layers className="h-3.5 w-3.5" />;
  if (regionId.includes("kaki")) return <Footprints className="h-3.5 w-3.5" />;
  return <Activity className="h-3.5 w-3.5" />;
}

export function AnatomyHotspot({
  region,
  position,
  isSelected,
  showAlwaysLabel = false,
  onSelect,
  pinScale = 1.0,
}: AnatomyHotspotProps) {
  const [isHovered, setIsHovered] = useState(false);
  const symptomCount = region.symptoms?.length || 0;

  // Desktop Natural Outward Placement:
  // - Organs on right side of body (x >= 50%) point outward to the RIGHT into the open space
  // - Organs on left side of body (x < 50%) point outward to the LEFT into the open space
  // Never "berlawanan" (never pointing backwards across the body)
  const getDesktopTooltipClass = () => {
    // Top head pins (y <= 18%)
    if (position.y <= 18) {
      if (position.x >= 50) return "left-full ml-2.5 top-0 origin-top-left";
      return "right-full mr-2.5 top-0 origin-top-right";
    }

    // Bottom feet pins (y >= 72%)
    if (position.y >= 72) {
      if (position.x >= 50) return "left-full ml-2.5 bottom-0 origin-bottom-left";
      return "right-full mr-2.5 bottom-0 origin-bottom-right";
    }

    // Natural Outward pointing: Right side points Right, Left side points Left
    if (position.x >= 50) {
      return "left-full ml-2.5 sm:ml-3 top-1/2 -translate-y-1/2 origin-left";
    }
    return "right-full mr-2.5 sm:mr-3 top-1/2 -translate-y-1/2 origin-right";
  };

  return (
    <div
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Precision Medical Hotspot Pin - Touch Ergonomic Target */}
      <button
        type="button"
        onClick={() => onSelect(region)}
        aria-label={`Pilih ${region.nameIndonesian}. Terdapat ${symptomCount} gejala.`}
        className={`group relative flex items-center justify-center p-2 rounded-full transition-transform duration-200 focus:outline-none cursor-pointer ${
          isSelected ? "scale-125 z-40" : "hover:scale-120 z-20"
        }`}
        style={{ transform: `scale(${isSelected ? pinScale * 1.25 : pinScale})` }}
      >
        {/* Subtle Ambient Beacon Pulse */}
        {isSelected ? (
          <span className="absolute h-10 w-10 rounded-full bg-[color:var(--color-clinic-blue)]/35 animate-ping pointer-events-none" />
        ) : isHovered ? (
          <span className="absolute h-9 w-9 rounded-full bg-[color:var(--color-clinic-blue)]/25 animate-pulse pointer-events-none" />
        ) : (
          <span className="absolute h-7 w-7 rounded-full bg-[color:var(--color-clinic-blue)]/20 animate-pulse pointer-events-none" />
        )}

        {/* Outer Ring & Main Node */}
        <span
          className={`relative flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200 ${
            isSelected
              ? "bg-[color:var(--color-clinic-blue)] border-white shadow-[0_0_16px_rgba(74,111,165,0.8)] ring-2 ring-[color:var(--color-clinic-blue)]"
              : isHovered
                ? "bg-[color:var(--color-clinic-blue)] border-white shadow-[0_0_12px_rgba(74,111,165,0.6)]"
                : "bg-[color:var(--color-clinic-blue)] border-white shadow-md hover:bg-[color:var(--color-clinic-blue-dark)]"
          }`}
        >
          {/* Inner Precision White Core */}
          <span
            className={`rounded-full transition-all duration-200 ${
              isSelected
                ? "h-2 w-2 bg-white shadow-xs"
                : isHovered
                  ? "h-2 w-2 bg-white"
                  : "h-1.5 w-1.5 bg-white/95"
            }`}
          />
        </span>
      </button>

      {/* 1. ANDROID / MOBILE COMPACT BADGE: Centered directly over the pin with a neat pointer */}
      {(isSelected || isHovered) && (
        <div
          onClick={() => onSelect(region)}
          className="sm:hidden absolute -top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto cursor-pointer animate-in fade-in zoom-in-95 select-none"
        >
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-md transition-all border ${
              isSelected
                ? "bg-[color:var(--color-clinic-blue)] text-white border-white/60 shadow-sky-500/30"
                : "bg-slate-900/95 text-white border-white/20 backdrop-blur-md"
            }`}
          >
            <span className="truncate max-w-[110px]">{region.nameIndonesian}</span>
            {isSelected && <Check className="h-2.5 w-2.5 stroke-[3] shrink-0" />}
          </div>
          {/* Subtle downward arrow pointing cleanly to pin */}
          <div
            className={`w-0 h-0 mx-auto border-x-4 border-x-transparent border-t-4 ${
              isSelected ? "border-t-[color:var(--color-clinic-blue)]" : "border-t-slate-900/95"
            }`}
          />
        </div>
      )}

      {/* 2. DESKTOP OUTWARD CLINICAL TOOLTIP: Compact, dynamically wrapped to fit available size without clipping */}
      {(isHovered || isSelected || showAlwaysLabel) && (
        <div
          onClick={() => onSelect(region)}
          className={`hidden sm:block absolute cursor-pointer transition-all duration-200 pointer-events-auto select-none w-max max-w-[145px] md:max-w-[170px] ${getDesktopTooltipClass()} ${
            isSelected
              ? "scale-105 z-50 animate-in fade-in zoom-in-95"
              : isHovered
                ? "scale-100 z-40 animate-in fade-in zoom-in-95"
                : "scale-95 z-30 opacity-90 hover:opacity-100"
          }`}
        >
          <div
            className={`flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 text-xs transition-all duration-200 shadow-md ${
              isSelected
                ? "bg-white/98 backdrop-blur-xl text-[color:var(--color-clinic-ink)] border-2 border-[color:var(--color-clinic-blue)] ring-2 ring-[color:var(--color-clinic-blue-soft)]/60 shadow-[color:var(--color-clinic-blue)]/20"
                : "bg-white/95 backdrop-blur-xl text-[color:var(--color-clinic-ink)] border border-black/10 hover:border-[color:var(--color-clinic-blue)]/50 shadow-slate-900/5"
            }`}
          >
            {/* Medical Icon Badge */}
            <div
              className={`flex h-5 w-5 sm:h-5.5 sm:w-5.5 shrink-0 items-center justify-center rounded-lg sm:rounded-xl border transition-colors ${
                isSelected
                  ? "bg-[color:var(--color-clinic-blue)] text-white border-[color:var(--color-clinic-blue)] shadow-xs"
                  : "bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] border-[color:var(--color-clinic-blue)]/20"
              }`}
            >
              {getRegionIcon(region.id)}
            </div>

            {/* Organ Title & Details - Adaptive Wrapping */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-display font-bold tracking-tight text-[11px] sm:text-xs leading-tight text-[color:var(--color-clinic-ink)] break-words line-clamp-2">
                {region.nameIndonesian}
              </span>
              <span className="text-[9px] sm:text-[9.5px] font-medium leading-tight mt-0.5 text-[color:var(--color-clinic-muted)] truncate">
                {symptomCount} Gejala
              </span>
            </div>

            {/* Compact Circular Indicator */}
            {isSelected ? (
              <div className="grid h-4 w-4 sm:h-4.5 sm:w-4.5 place-items-center rounded-full bg-[color:var(--color-clinic-blue)] text-white shadow-xs shrink-0">
                <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 stroke-[3]" />
              </div>
            ) : (
              <div className="grid h-4 w-4 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] group-hover:bg-[color:var(--color-clinic-blue)] group-hover:text-white transition shrink-0">
                <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
