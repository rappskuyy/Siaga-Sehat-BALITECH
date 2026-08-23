import { useState } from "react";
import type { AnatomyRegion, Position } from "@/lib/anatomy/types";

interface AnatomyHotspotProps {
  region: AnatomyRegion;
  position: Position;
  isSelected: boolean;
  onSelect: (region: AnatomyRegion) => void;
}

export function AnatomyHotspot({
  region,
  position,
  isSelected,
  onSelect,
}: AnatomyHotspotProps) {
  const [isHovered, setIsHovered] = useState(false);

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
      {/* Interactive Accessible Button */}
      <button
        type="button"
        onClick={() => onSelect(region)}
        aria-label={`Pilih bagian tubuh ${region.nameIndonesian}. Klik untuk memilih gejala dan kondisi.`}
        className={`group relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-clinic-blue)] focus:ring-offset-2 ${
          isSelected ? "scale-125 z-30" : "hover:scale-125 z-20"
        }`}
      >
        {/* Outer Pulsing Glow Ring */}
        <span
          className={`absolute inset-0 rounded-full transition-all duration-300 ${
            isSelected
              ? "bg-[color:var(--color-clinic-blue)]/40 ring-4 ring-[color:var(--color-clinic-blue)]/60 animate-pulse"
              : isHovered
                ? "bg-[color:var(--color-clinic-blue)]/30 ring-2 ring-[color:var(--color-clinic-blue)]/40"
                : "bg-[color:var(--color-clinic-blue)]/20 animate-ping opacity-60"
          }`}
        />

        {/* Center Node Bullet (White border, solid blue center) */}
        <span
          className={`relative h-3.5 w-3.5 rounded-full border-2 border-white transition-all duration-200 shadow-md ${
            isSelected
              ? "bg-[color:var(--color-clinic-blue)] ring-2 ring-white"
              : isHovered
                ? "bg-[color:var(--color-clinic-blue)]"
                : "bg-[color:var(--color-clinic-blue)]"
          }`}
        />
      </button>

      {/* Desktop Tooltip Badge */}
      {(isHovered || isSelected) && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none z-40 transition-all duration-200 ${
            isSelected ? "scale-105" : "scale-100"
          }`}
        >
          <div
            className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold shadow-lg backdrop-blur flex items-center gap-1.5 ${
              isSelected
                ? "bg-[color:var(--color-clinic-blue)] text-white ring-2 ring-white/80"
                : "bg-white/95 text-[color:var(--color-clinic-ink)] border border-[color:var(--color-clinic-blue)]/30"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isSelected ? "bg-white" : "bg-[color:var(--color-clinic-blue)]"
              }`}
            />
            <span>{region.nameIndonesian}</span>
          </div>

          {/* Tooltip triangle tail */}
          <div
            className={`mx-auto h-1.5 w-1.5 -mt-0.5 rotate-45 ${
              isSelected ? "bg-[color:var(--color-clinic-blue)]" : "bg-white border-r border-b border-[color:var(--color-clinic-blue)]/30"
            }`}
          />
        </div>
      )}
    </div>
  );
}
