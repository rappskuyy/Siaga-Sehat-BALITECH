import React from "react";
import { CheckCircle2, Info, Sparkles, Database } from "lucide-react";

export type PharmacyDataSource = "google" | "osm" | "gemini" | "koboldllm" | "cache" | "unknown";

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
      icon: <CheckCircle2 className="h-3 w-3 text-[color:var(--color-clinic-blue)]" />,
      label: "Google Maps",
      bgColor: "bg-[color:var(--color-clinic-blue-soft)]/20",
      textColor: "text-[color:var(--color-clinic-blue)]",
      borderColor: "border-[color:var(--color-clinic-blue-dark)]/40",
      tooltip: "Data terverifikasi dari dataset Google Maps",
    },
    osm: {
      icon: <Info className="h-3 w-3 text-[color:var(--color-clinic-blue)]" />,
      label: "OpenStreetMap",
      bgColor: "bg-[color:var(--color-clinic-blue-soft)]/20",
      textColor: "text-[color:var(--color-clinic-blue)]",
      borderColor: "border-[color:var(--color-clinic-blue-dark)]/40",
      tooltip: "Data geospasial komunitas OpenStreetMap resmi",
    },
    gemini: {
      icon: <Sparkles className="h-3 w-3 text-[color:var(--color-clinic-blue-dark)]" />,
      label: "AI Terverifikasi",
      bgColor: "bg-[#F7F9FB]",
      textColor: "text-[color:var(--color-clinic-blue)]",
      borderColor: "border-[#E5E7EB]",
      tooltip: "Pencarian cerdas basis data fasilitas kesehatan",
    },
    koboldllm: {
      icon: <Sparkles className="h-3 w-3 text-[color:var(--color-clinic-blue-dark)]" />,
      label: "AI Terverifikasi",
      bgColor: "bg-[#F7F9FB]",
      textColor: "text-[color:var(--color-clinic-blue)]",
      borderColor: "border-[#E5E7EB]",
      tooltip: "Pencarian cerdas basis data fasilitas kesehatan via KoboiLLM",
    },
    cache: {
      icon: <Database className="h-3 w-3 text-[#6B7280]" />,
      label: "Tersimpan",
      bgColor: "bg-[#F7F9FB]",
      textColor: "text-[#6B7280]",
      borderColor: "border-[#E5E7EB]",
      tooltip: "Data riwayat tersimpan di perangkat (Mode Offline)",
    },
    unknown: {
      icon: <Info className="h-3 w-3 text-[#6B7280]" />,
      label: "Terverifikasi",
      bgColor: "bg-[#F7F9FB]",
      textColor: "text-[#6B7280]",
      borderColor: "border-[#E5E7EB]",
      tooltip: "Data fasilitas kesehatan lokal",
    },
  };

  const cfg = configs[dataSource] || configs.unknown;
  const displayLabel = label || cfg.label;

  return (
    <span
      title={cfg.tooltip}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold border transition shrink-0 ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor} ${className}`}
    >
      {cfg.icon}
      <span>{displayLabel}</span>
      {showScore && trustScore !== undefined && (
        <span className="opacity-80 font-mono text-[8px]">({trustScore}/10)</span>
      )}
    </span>
  );
}

/**
 * Summary badge bar showing breakdown across all returned facilities in blue gradient style
 */
export function SourceSummaryBar({
  sources,
}: {
  sources: { google: number; osm: number; gemini: number; cache: number; total: number };
}) {
  if (sources.total === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap rounded-full bg-[#F7F9FB] px-3 py-1 text-[10px] text-[#6B7280] border border-[#E5E7EB]">
      <span className="font-semibold text-[#111111]">Sumber Data:</span>
      {sources.google > 0 && (
        <span className="flex items-center gap-1 text-[color:var(--color-clinic-blue)] font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-clinic-blue)] inline-block" />
          Google ({Math.round((sources.google / sources.total) * 100)}%)
        </span>
      )}
      {sources.osm > 0 && (
        <span className="flex items-center gap-1 text-[color:var(--color-clinic-blue-dark)] font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-clinic-blue-dark)] inline-block" />
          OSM ({Math.round((sources.osm / sources.total) * 100)}%)
        </span>
      )}
      {sources.gemini > 0 && (
        <span className="flex items-center gap-1 text-[color:var(--color-clinic-blue)] font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-clinic-blue-soft)] inline-block" />
          AI ({Math.round((sources.gemini / sources.total) * 100)}%)
        </span>
      )}
      {sources.cache > 0 && (
        <span className="flex items-center gap-1 text-[#6B7280] font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E5E7EB] inline-block" />
          Offline ({sources.cache})
        </span>
      )}
    </div>
  );
}
