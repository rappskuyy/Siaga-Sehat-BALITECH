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

  // Boundary-Guaranteed Tooltip Positioning System: Zero clipping on all devices
  const getTooltipPositionClass = () => {
    const isTop = position.y < 50;
    const verticalClass = isTop ? "top-full mt-2" : "bottom-full mb-2";

    // Left Edge Pins (x <= 30%): Anchor left-0 so card expands INWARD to the right (never clips left border)
    if (position.x <= 30) {
      return `${verticalClass} left-0 origin-${isTop ? "top-left" : "bottom-left"}`;
    }

    // Right Edge Pins (x >= 70%): Anchor right-0 so card expands INWARD to the left (never clips right border)
    if (position.x >= 70) {
      return `${verticalClass} right-0 origin-${isTop ? "top-right" : "bottom-right"}`;
    }

    // Middle Pins (30% < x < 70%): Centered horizontally
    return `${verticalClass} left-1/2 -translate-x-1/2 origin-${isTop ? "top" : "bottom"}`;
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

      {/* Sleek Compact Micro Hover Badge - Zero Pin Overlap & Zero Clipping */}
      {isHovered && !isSelected && (
        <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-40 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg border border-white/20">
            <span>{region.nameIndonesian}</span>
            <span className="bg-sky-500/30 text-sky-200 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
              {symptomCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
