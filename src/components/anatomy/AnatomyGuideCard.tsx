import type { AnatomyRegion } from "@/lib/anatomy/types";
import { ANATOMY_REGIONS } from "@/data/anatomyData";
import {
  MousePointerClick,
  CheckSquare2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Activity,
  Layers,
  BookOpen,
  Brain,
  Eye,
  Stethoscope,
  Heart,
  Flame,
  Bone,
  Footprints,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnatomyGuideCardProps {
  onSelectRegion: (region: AnatomyRegion) => void;
  onGoToModel?: () => void;
}

function getRegionIcon(regionId: string) {
  if (regionId.includes("kepala")) return <Brain className="h-3.5 w-3.5 shrink-0" />;
  if (regionId.includes("mata")) return <Eye className="h-3.5 w-3.5 shrink-0" />;
  if (regionId.includes("leher")) return <Stethoscope className="h-3.5 w-3.5 shrink-0" />;
  if (regionId.includes("dada")) return <Heart className="h-3.5 w-3.5 shrink-0" />;
  if (regionId.includes("perut")) return <Flame className="h-3.5 w-3.5 shrink-0" />;
  if (regionId.includes("punggung") || regionId.includes("pinggul")) return <Bone className="h-3.5 w-3.5 shrink-0" />;
  if (regionId.includes("kaki") || regionId.includes("lutut") || regionId.includes("lengan")) return <Footprints className="h-3.5 w-3.5 shrink-0" />;
  return <Activity className="h-3.5 w-3.5 shrink-0" />;
}

export function AnatomyGuideCard({ onSelectRegion, onGoToModel }: AnatomyGuideCardProps) {
  const steps = [
    {
      step: "1",
      icon: BookOpen,
      color: "bg-[color:var(--color-clinic-blue)] text-white",
      badge: "Pahami Panduan",
      badgeStyle: "bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue-dark)] border border-[color:var(--color-clinic-blue)]/20",
      desc: "Baca tahapan singkat pemeriksaan di sini, lalu pilih organ pada model anatomi.",
    },
    {
      step: "2",
      icon: MousePointerClick,
      color: "bg-[color:var(--color-clinic-blue)] text-white",
      badge: "Pilih Bagian Tubuh",
      badgeStyle: "bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue-dark)] border border-[color:var(--color-clinic-blue)]/20",
      desc: "Klik salah satu titik lingkaran biru pada model anatomi (Tampak Depan atau Belakang).",
    },
    {
      step: "3",
      icon: CheckSquare2,
      color: "bg-[color:var(--color-clinic-blue)] text-white",
      badge: "Tandai Gejala",
      badgeStyle: "bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue-dark)] border border-[color:var(--color-clinic-blue)]/20",
      desc: "Pilih gejala, tanda klinis, atau keluhan fisik spesifik yang sedang Anda rasakan pada organ tersebut.",
    },
    {
      step: "4",
      icon: Sparkles,
      color: "bg-[color:var(--color-clinic-blue)] text-white",
      badge: "Analisis AI Medis",
      badgeStyle: "bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue-dark)] border border-[color:var(--color-clinic-blue)]/20",
      desc: "Dapatkan ringkasan kemungkinan kondisi, deteksi tanda bahaya darurat, dan rekomendasi rujukan RS.",
    },
  ];

  const popularRegions = ANATOMY_REGIONS.filter((r) =>
    [
      "kepala_depan",
      "kepala_belakang",
      "mata",
      "leher_depan",
      "dada",
      "perut",
      "lengan_kiri_depan",
      "punggung_bawah",
      "lutut_kiri_depan",
      "kaki_depan",
    ].includes(r.id),
  );

  return (
    <div className="flex flex-col h-full rounded-[20px] sm:rounded-[28px] bg-white p-3.5 sm:p-5 md:p-6 shadow-[var(--shadow-clinic-lg)] border border-black/5 animate-fade-up justify-between w-full max-w-full overflow-hidden min-w-0 box-border">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-2 border-b border-black/5 pb-3 shrink-0 w-full min-w-0 overflow-hidden">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-[color:var(--color-clinic-blue)] text-white text-xs font-extrabold shadow-sm shrink-0 mt-0.5">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="font-display text-sm sm:text-lg font-bold text-[color:var(--color-clinic-ink)] break-words min-w-0">
                Panduan Pemeriksaan Anatomi
              </h2>
              <span className="rounded-full bg-[color:var(--color-clinic-blue-soft)]/60 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-[color:var(--color-clinic-blue-dark)] uppercase tracking-wider shrink-0">
                Langkah Mudah
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[color:var(--color-clinic-muted)] mt-0.5 break-words">
              Ikuti tahapan berikut untuk melakukan evaluasi gejala tubuh berbasis AI
            </p>
          </div>
        </div>
      </div>

      {/* Main Steps List */}
      <div className="mt-3 space-y-2 sm:space-y-2.5 w-full min-w-0 overflow-hidden">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="flex items-start gap-2.5 sm:gap-3 rounded-2xl border border-black/5 bg-[#f8fafc] p-2.5 sm:p-3 transition-all hover:bg-white hover:border-[color:var(--color-clinic-blue)]/30 hover:shadow-xs min-w-0 overflow-hidden"
            >
              <div
                className={`grid h-6 w-6 sm:h-7 sm:w-7 shrink-0 place-items-center rounded-xl font-display font-extrabold text-xs shadow-2xs mt-0.5 ${item.color}`}
              >
                <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </div>

              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-clinic-muted)]">
                    Langkah {item.step}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-bold ${item.badgeStyle}`}>
                    {item.badge}
                  </span>
                </div>
                <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-[color:var(--color-clinic-muted)] leading-relaxed break-words">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary CTA Button: Lanjut ke Model Anatomi (Mobile Only) */}
      {onGoToModel && (
        <div className="mt-3 pt-3 border-t border-black/5 shrink-0 lg:hidden">
          <Button
            onClick={onGoToModel}
            className="w-full gap-2 rounded-full bg-[color:var(--color-clinic-blue)] py-3 text-xs sm:text-sm font-bold text-white hover:bg-[color:var(--color-clinic-blue-dark)] shadow-md shadow-[color:var(--color-clinic-blue)]/20 transition-all cursor-pointer"
          >
            <Layers className="h-4 w-4" />
            <span>Mulai & Pilih Model Anatomi &rarr;</span>
          </Button>
        </div>
      )}

      {/* Quick Select Popular Regions Section */}
      <div className="mt-3.5 pt-3 border-t border-black/5 space-y-2.5 w-full min-w-0 overflow-hidden shrink-0">
        <div className="flex items-center justify-between gap-2 text-xs font-bold text-[color:var(--color-clinic-ink)]">
          <div className="flex items-center gap-1.5 min-w-0">
            <Activity className="h-3.5 w-3.5 text-[color:var(--color-clinic-blue)] shrink-0" />
            <span className="truncate">Atau Pilih Langsung Bagian Tubuh:</span>
          </div>
          <span className="text-[10px] font-semibold text-[color:var(--color-clinic-muted)] bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
            Pilihan Populer
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-1.5 w-full max-w-full overflow-hidden">
          {popularRegions.map((region) => (
            <button
              key={region.id}
              type="button"
              onClick={() => onSelectRegion(region)}
              aria-label={`Pilih organ ${region.nameIndonesian}`}
              className="flex items-center gap-2 rounded-xl bg-[#f8fafc] p-2 sm:px-3 sm:py-2 text-left border border-slate-200/80 hover:bg-[color:var(--color-clinic-blue)] hover:border-[color:var(--color-clinic-blue)] hover:text-white transition-all shadow-2xs group cursor-pointer min-w-0 max-w-full shrink sm:max-w-none min-h-[38px]"
            >
              <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white group-hover:bg-white/20 text-[color:var(--color-clinic-blue)] group-hover:text-white transition-colors shadow-2xs">
                {getRegionIcon(region.id)}
              </div>
              <span className="flex-1 min-w-0 text-[11px] sm:text-xs font-semibold text-[color:var(--color-clinic-ink)] group-hover:text-white transition-colors line-clamp-2 leading-tight">
                {region.nameIndonesian}
              </span>
              <ArrowRight className="h-3 w-3 opacity-40 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all shrink-0 text-slate-400 group-hover:text-white" />
            </button>
          ))}
        </div>
      </div>

      {/* Footer Banner */}
      <div className="mt-3.5 pt-3 border-t border-black/5 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] text-[color:var(--color-clinic-muted)] shrink-0 w-full min-w-0 overflow-hidden">
        <div className="flex items-center gap-1.5 font-medium text-slate-600 min-w-0 flex-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">Analisis didukung AI medis & referensi klinis terpercaya</span>
        </div>
        <span className="text-[10px] font-semibold text-[color:var(--color-clinic-blue)] bg-[color:var(--color-clinic-blue-soft)]/40 px-2.5 py-0.5 rounded-full shrink-0">
          SiagaSehat AI
        </span>
      </div>
    </div>
  );
}

