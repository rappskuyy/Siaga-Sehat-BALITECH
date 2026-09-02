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
}: AnatomyHotspotProps) {
  const [isHovered, setIsHovered] = useState(false);
  const symptomCount = region.symptoms?.length || 0;

  // Strict Directional Positioning: Pins on left half (x < 50%) pop out LEFT; Pins on right half (x >= 50%) pop out RIGHT
  const getTooltipPositionClass = () => {
    // Top head/face pins (y <= 16%)
    if (position.y <= 16) {
      if (position.x >= 50) return "left-full ml-1.5 top-0 origin-top-left";
      return "right-full mr-1.5 top-0 origin-top-right";
    }

    // Bottom feet pins (y >= 75%)
    if (position.y >= 75) {
      if (position.x >= 50) return "left-full ml-1.5 bottom-0 origin-bottom-left";
      return "right-full mr-1.5 bottom-0 origin-bottom-right";
    }

    // General body & limb pins
    if (position.x >= 50) {
      return "left-full ml-1.5 sm:ml-2 top-1/2 -translate-y-1/2 origin-left";
    }
    return "right-full mr-1.5 sm:mr-2 top-1/2 -translate-y-1/2 origin-right";
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
      >
        {/* Subtle Ambient Beacon Pulse */}
        {isSelected ? (
          <span className="absolute h-9 w-9 rounded-full bg-[color:var(--color-clinic-blue)]/30 animate-ping pointer-events-none" />
        ) : isHovered ? (
          <span className="absolute h-8 w-8 rounded-full bg-[color:var(--color-clinic-blue)]/20 animate-pulse pointer-events-none" />
        ) : (
          <span className="absolute h-6 w-6 rounded-full bg-[color:var(--color-clinic-blue)]/10 pointer-events-none" />
        )}

        {/* Outer Ring & Main Node */}
        <span
          className={`relative flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 transition-all duration-200 ${
            isSelected
              ? "bg-[color:var(--color-clinic-blue)] border-white shadow-[0_0_14px_rgba(74,111,165,0.7)] ring-2 ring-[color:var(--color-clinic-blue)]"
              : isHovered
                ? "bg-[color:var(--color-clinic-blue)] border-white shadow-[0_0_10px_rgba(74,111,165,0.5)]"
                : "bg-[color:var(--color-clinic-blue)]/85 border-white shadow-sm hover:bg-[color:var(--color-clinic-blue)]"
          }`}
        >
          {/* Inner Precision White Core */}
          <span
            className={`rounded-full transition-all duration-200 ${
              isSelected
                ? "h-1.5 w-1.5 bg-white shadow-xs"
                : isHovered
                  ? "h-1.5 w-1.5 bg-white"
                  : "h-1 w-1 bg-white/90"
            }`}
          />
        </span>
      </button>

      {/* Floating Clinical Tooltip Card - Attached Directly to Pin */}
      {(isHovered || isSelected || showAlwaysLabel) && (
        <div
          onClick={() => onSelect(region)}
          className={`absolute cursor-pointer transition-all duration-200 pointer-events-auto select-none w-max max-w-[130px] xs:max-w-[160px] sm:max-w-[210px] ${getTooltipPositionClass()} ${
            isSelected
              ? "scale-105 z-50 animate-in fade-in zoom-in-95"
              : isHovered
                ? "scale-100 z-40 animate-in fade-in zoom-in-95"
                : "scale-95 z-30 opacity-90 hover:opacity-100"
          }`}
        >
          <div
            className={`flex items-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl px-1.5 sm:px-2.5 py-1 sm:py-1.5 text-xs transition-all duration-200 ${
              isSelected
                ? "bg-white/98 backdrop-blur-xl text-[color:var(--color-clinic-ink)] shadow-[0_12px_32px_rgba(74,111,165,0.2)] border-2 border-[color:var(--color-clinic-blue)] ring-2 ring-[color:var(--color-clinic-blue-soft)]"
                : "bg-white/95 backdrop-blur-xl text-[color:var(--color-clinic-ink)] shadow-[0_8px_24px_rgba(15,23,42,0.1)] border border-black/10 hover:border-[color:var(--color-clinic-blue)]/50"
            }`}
          >
            {/* Medical Icon Badge */}
            <div
              className={`flex h-4.5 w-4.5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-lg sm:rounded-xl border transition-colors ${
                isSelected
                  ? "bg-[color:var(--color-clinic-blue)] text-white border-[color:var(--color-clinic-blue)] shadow-xs"
                  : "bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] border-[color:var(--color-clinic-blue)]/20"
              }`}
            >
              {getRegionIcon(region.id)}
            </div>

            {/* Organ Title & Details */}
            <div className="flex flex-col min-w-0 flex-1 pr-0.5">
              <span className="font-display font-bold tracking-tight text-[9.5px] sm:text-xs leading-tight text-[color:var(--color-clinic-ink)] truncate max-w-[65px] xs:max-w-[95px] sm:max-w-none">
                {region.nameIndonesian}
              </span>
              <span className="text-[8px] sm:text-[10px] font-medium leading-tight mt-0.5 text-[color:var(--color-clinic-muted)]">
                {symptomCount} Gejala
              </span>
            </div>

            {/* Status / Action Indicator */}
            {isSelected ? (
              <div className="flex items-center gap-0.5 rounded-full bg-[color:var(--color-clinic-blue)] px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold text-white shadow-xs shrink-0">
                <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 stroke-[3]" />
                <span className="hidden xs:inline">Dipilih</span>
              </div>
            ) : (
              <div className="flex items-center gap-0.5 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-1 py-0.5 text-[8px] sm:text-[10px] font-semibold text-[color:var(--color-clinic-blue)] group-hover:bg-[color:var(--color-clinic-blue)] group-hover:text-white transition shrink-0">
                <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
