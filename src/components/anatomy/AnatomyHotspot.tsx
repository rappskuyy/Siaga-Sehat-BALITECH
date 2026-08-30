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
        {/* Subtle Ambient Beacon Pulse (Only on selected or hover, minimal & elegant) */}
        {isSelected ? (
          <span className="absolute h-8 w-8 rounded-full bg-sky-500/25 animate-ping pointer-events-none" />
        ) : isHovered ? (
          <span className="absolute h-7 w-7 rounded-full bg-sky-400/20 animate-pulse pointer-events-none" />
        ) : (
          <span className="absolute h-5 w-5 rounded-full bg-sky-400/10 pointer-events-none" />
        )}

        {/* Outer Ring & Main Node */}
        <span
          className={`relative flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all duration-200 ${
            isSelected
              ? "bg-sky-600 border-white shadow-[0_0_12px_rgba(2,132,199,0.7)] ring-2 ring-sky-500"
              : isHovered
                ? "bg-sky-500 border-white shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                : "bg-slate-700/85 border-white shadow-sm hover:bg-sky-500"
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
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs transition-all duration-200 ${
              isSelected
                ? "bg-slate-900/95 backdrop-blur-xl text-white shadow-[0_12px_28px_rgba(15,23,42,0.35)] border border-slate-700/80 ring-1 ring-sky-400/40"
                : "bg-white/95 backdrop-blur-xl text-slate-800 shadow-[0_8px_24px_rgba(15,23,42,0.12)] border border-slate-200/90 hover:border-sky-300"
            }`}
          >
            {/* Medical Icon Badge */}
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                isSelected
                  ? "bg-sky-500/20 text-sky-400 border-sky-400/30"
                  : "bg-sky-50 text-sky-600 border-sky-100/80"
              }`}
            >
              {getRegionIcon(region.id)}
            </div>

            {/* Organ Title & Details */}
            <div className="flex flex-col min-w-[70px] pr-1">
              <span
                className={`font-bold tracking-tight text-xs leading-tight ${
                  isSelected ? "text-white" : "text-slate-900"
                }`}
              >
                {region.nameIndonesian}
              </span>
              <span
                className={`text-[10px] font-medium leading-tight mt-0.5 ${
                  isSelected ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {symptomCount} Gejala
              </span>
            </div>

            {/* Status / Action Indicator */}
            {isSelected ? (
              <div className="flex items-center gap-1 rounded-full bg-sky-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
                <span>Dipilih</span>
              </div>
            ) : (
              <div className="flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 group-hover:text-sky-600 transition">
                <ChevronRight className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
