import React from "react";
import { CheckCircle2, Info, Sparkles, Database } from "lucide-react";

export type PharmacyDataSource = "google" | "osm" | "gemini" | "cache" | "unknown";

interface SourceBadgeProps {
  dataSource?: PharmacyDataSource;
  trustScore?: number;
  label?: string;
  showScore?: boolean;
  className?: string;
}

export function SourceBadge({
  dataSource = "unknown",
  trustScore,
  label,
  showScore = true,
  className = "",
}: SourceBadgeProps) {
  const configs: Record<
    PharmacyDataSource,
    {
      icon: React.ReactNode;
      label: string;
      bgColor: string;
      textColor: string;
      borderColor: string;
      tooltip: string;
    }
  > = {
    google: {
      icon: <CheckCircle2 className="h-3 w-3 text-emerald-600" />,
      label: "Google Places",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200",
      tooltip: "Data langsung terverifikasi dari Google Maps Places API",
    },
    osm: {
      icon: <Info className="h-3 w-3 text-blue-600" />,
      label: "OpenStreetMap",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
      tooltip: "Data geospasial komunitas OpenStreetMap resmi",
    },
    gemini: {
      icon: <Sparkles className="h-3 w-3 text-amber-600" />,
      label: "AI Gemini",
      bgColor: "bg-amber-50",
      textColor: "text-amber-800",
      borderColor: "border-amber-200",
      tooltip: "Pencarian cerdas basis data apotek lokal via AI Gemini",
    },
    cache: {
      icon: <Database className="h-3 w-3 text-slate-600" />,
      label: "Tersimpan",
      bgColor: "bg-slate-100",
      textColor: "text-slate-700",
      borderColor: "border-slate-300",
      tooltip: "Data riwayat apotek tersimpan di perangkat (Mode Offline)",
    },
    unknown: {
      icon: <Info className="h-3 w-3 text-slate-500" />,
      label: "Terverifikasi",
      bgColor: "bg-slate-50",
      textColor: "text-slate-600",
      borderColor: "border-slate-200",
      tooltip: "Data fasilitas kesehatan lokal",
    },
  };

  const cfg = configs[dataSource] || configs.unknown;
  const displayLabel = label || cfg.label;

  return (
    <span
      title={cfg.tooltip}
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold border transition shrink-0 ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor} ${className}`}
    >
      {cfg.icon}
      <span>{displayLabel}</span>
      {showScore && trustScore !== undefined && (
        <span className="opacity-75 font-mono">({trustScore}/10)</span>
      )}
    </span>
  );
}

/**
 * Summary badge bar showing breakdown across all returned pharmacies
 */
export function SourceSummaryBar({
  sources,
}: {
  sources: { google: number; osm: number; gemini: number; cache: number; total: number };
}) {
  if (sources.total === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap rounded-xl bg-slate-50/80 px-2.5 py-1 text-[10px] text-slate-600 border border-slate-100">
      <span className="font-semibold text-slate-700">Sumber Data:</span>
      {sources.google > 0 && (
        <span className="flex items-center gap-0.5 text-emerald-700 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
          Google ({Math.round((sources.google / sources.total) * 100)}%)
        </span>
      )}
      {sources.osm > 0 && (
        <span className="flex items-center gap-0.5 text-blue-700 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block" />
          OSM ({Math.round((sources.osm / sources.total) * 100)}%)
        </span>
      )}
      {sources.gemini > 0 && (
        <span className="flex items-center gap-0.5 text-amber-700 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
          AI ({Math.round((sources.gemini / sources.total) * 100)}%)
        </span>
      )}
      {sources.cache > 0 && (
        <span className="flex items-center gap-0.5 text-slate-700 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500 inline-block" />
          Offline Cache ({sources.cache})
        </span>
      )}
    </div>
  );
}
