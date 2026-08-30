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
  switch (regionId) {
    case "kepala":
      return <Brain className="h-3.5 w-3.5" />;
    case "mata":
      return <Eye className="h-3.5 w-3.5" />;
    case "hidung":
      return <Wind className="h-3.5 w-3.5" />;
    case "leher":
      return <Stethoscope className="h-3.5 w-3.5" />;
    case "dada":
      return <Heart className="h-3.5 w-3.5" />;
    case "perut":
      return <Flame className="h-3.5 w-3.5" />;
    case "punggung_atas":
    case "punggung_bawah":
      return <Bone className="h-3.5 w-3.5" />;
    case "pinggul":
      return <Layers className="h-3.5 w-3.5" />;
    case "kaki":
      return <Footprints className="h-3.5 w-3.5" />;
    case "lutut_kiri":
    case "lutut_kanan":
    case "lengan_kiri":
    case "lengan_kanan":
    default:
      return <Activity className="h-3.5 w-3.5" />;
  }
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
  const isRightSide = position.x >= 50;

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
      {/* Precision Medical Hotspot Pin */}
      <button
        type="button"
        onClick={() => onSelect(region)}
        aria-label={`Pilih ${region.nameIndonesian}. Terdapat ${symptomCount} gejala.`}
        className={`group relative flex items-center justify-center rounded-full transition-transform duration-200 focus:outline-none cursor-pointer ${
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

      {/* Floating Modern Clinical Tooltip Card */}
      {(isHovered || isSelected || showAlwaysLabel) && (
        <div
          onClick={() => onSelect(region)}
          className={`absolute cursor-pointer transition-all duration-200 pointer-events-auto select-none ${
            isRightSide
              ? "left-full ml-3 top-1/2 -translate-y-1/2 origin-left"
              : "right-full mr-3 top-1/2 -translate-y-1/2 origin-right"
          } ${
            isSelected
              ? "scale-105 z-50 animate-in fade-in zoom-in-95"
              : isHovered
                ? "scale-100 z-40 animate-in fade-in zoom-in-95"
                : "scale-95 z-30 opacity-90 hover:opacity-100"
          }`}
        >
          <div
            className={`flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs transition-all duration-200 ${
              isSelected
                ? "bg-white/98 backdrop-blur-xl text-[color:var(--color-clinic-ink)] shadow-[0_12px_32px_rgba(74,111,165,0.2)] border-2 border-[color:var(--color-clinic-blue)] ring-4 ring-[color:var(--color-clinic-blue-soft)]"
                : "bg-white/95 backdrop-blur-xl text-[color:var(--color-clinic-ink)] shadow-[0_8px_24px_rgba(15,23,42,0.1)] border border-black/10 hover:border-[color:var(--color-clinic-blue)]/50"
            }`}
          >
            {/* Medical Icon Badge */}
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                isSelected
                  ? "bg-[color:var(--color-clinic-blue)] text-white border-[color:var(--color-clinic-blue)] shadow-xs"
                  : "bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] border-[color:var(--color-clinic-blue)]/20"
              }`}
            >
              {getRegionIcon(region.id)}
            </div>

            {/* Organ Title & Details */}
            <div className="flex flex-col min-w-[75px] pr-1">
              <span className="font-display font-bold tracking-tight text-xs leading-tight text-[color:var(--color-clinic-ink)]">
                {region.nameIndonesian}
              </span>
              <span className="text-[10px] font-medium leading-tight mt-0.5 text-[color:var(--color-clinic-muted)]">
                {symptomCount} Gejala
              </span>
            </div>

            {/* Status / Action Indicator */}
            {isSelected ? (
              <div className="flex items-center gap-1 rounded-full bg-[color:var(--color-clinic-blue)] px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">
                <Check className="h-3 w-3 stroke-[3]" />
                <span>Dipilih</span>
              </div>
            ) : (
              <div className="flex items-center gap-0.5 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-2 py-1 text-[10px] font-semibold text-[color:var(--color-clinic-blue)] group-hover:bg-[color:var(--color-clinic-blue)] group-hover:text-white transition">
                <ChevronRight className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
