import type { AnatomyRegion } from "@/lib/anatomy/types";
import {
  MousePointerClick,
  CheckSquare2,
  Sparkles,
  ShieldCheck,
  Layers,
  BookOpen,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnatomyGuideCardProps {
  onSelectRegion?: (region: AnatomyRegion) => void;
  onGoToModel?: () => void;
}

export function AnatomyGuideCard({ onGoToModel }: AnatomyGuideCardProps) {
  const steps = [
    {
      step: "1",
      icon: BookOpen,
      badge: "Pahami Panduan",
      title: "Pahami Panduan Pemeriksaan",
      desc: "Baca tahapan singkat evaluasi di sini sebelum menandai titik organ tubuh.",
    },
    {
      step: "2",
      icon: MousePointerClick,
      badge: "Pilih Bagian Tubuh",
      title: "Pilih Titik Organ pada Model",
      desc: "Klik salah satu titik lingkaran biru pada model anatomi (Tampak Depan atau Belakang).",
    },
    {
      step: "3",
      icon: CheckSquare2,
      badge: "Tandai Gejala",
      title: "Tandai Gejala yang Dirasakan",
      desc: "Pilih gejala klinis atau keluhan fisik spesifik yang Anda rasakan pada organ tersebut.",
    },
    {
      step: "4",
      icon: Sparkles,
      badge: "Analisis AI Medis",
      title: "Dapatkan Hasil & Rekomendasi AI",
      desc: "AI memberikan kemungkinan kondisi, deteksi tanda bahaya darurat, dan saran rujukan dokter.",
    },
  ];

  return (
    <div className="flex flex-col h-full rounded-[20px] sm:rounded-[28px] bg-white p-3.5 sm:p-5 md:p-6 shadow-[var(--shadow-clinic-lg)] border border-black/5 animate-fade-up justify-between w-full max-w-full overflow-hidden min-w-0 box-border">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-2 border-b border-black/5 pb-3 shrink-0 w-full min-w-0">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-[color:var(--color-clinic-blue)] text-white text-xs font-extrabold shadow-sm shrink-0 mt-0.5">
            1
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="font-display text-sm sm:text-lg font-bold text-[color:var(--color-clinic-ink)] leading-tight">
                Panduan Pemeriksaan Anatomi
              </h2>
              <span className="rounded-full bg-[color:var(--color-clinic-blue-soft)] px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-[color:var(--color-clinic-blue-dark)] uppercase tracking-wider border border-[color:var(--color-clinic-blue)]/20 shrink-0">
                4 Langkah
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[color:var(--color-clinic-muted)] mt-0.5">
              Ikuti tahapan berikut untuk melakukan evaluasi gejala tubuh berbasis AI
            </p>
          </div>
        </div>
      </div>

      {/* 4 Steps List - Compact, sleek & neatly proportioned */}
      <div className="my-2.5 space-y-2 sm:space-y-2.5 w-full min-w-0">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="flex items-start gap-2.5 sm:gap-3 rounded-2xl border border-black/5 bg-[#f8fafc] p-2.5 sm:p-3 transition-all hover:bg-white hover:border-[color:var(--color-clinic-blue)]/30 hover:shadow-xs min-w-0"
            >
              <div className="grid h-6 w-6 sm:h-7 sm:w-7 shrink-0 place-items-center rounded-xl bg-[color:var(--color-clinic-blue)] text-white font-display font-extrabold text-xs shadow-2xs mt-0.5">
                <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-bold text-[color:var(--color-clinic-blue-dark)] uppercase tracking-wider">
                      Langkah {item.step}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-bold text-[color:var(--color-clinic-ink)] truncate">
                      {item.title}
                    </span>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-[color:var(--color-clinic-blue-dark)] border border-black/5 shrink-0 shadow-2xs">
                    {item.badge}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] sm:text-xs text-[color:var(--color-clinic-muted)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Helpful Navigation Tips Card */}
      <div className="rounded-2xl border border-[color:var(--color-clinic-blue)]/20 bg-[color:var(--color-clinic-blue-soft)]/25 p-2.5 sm:p-3 text-xs text-[color:var(--color-clinic-blue-dark)] flex items-start gap-2.5 shrink-0 my-1">
        <Info className="h-4 w-4 text-[color:var(--color-clinic-blue)] shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <span className="font-bold text-[11px] sm:text-xs text-[color:var(--color-clinic-ink)] block">
            Tips Penggunaan Model:
          </span>
          <p className="text-[10.5px] sm:text-[11px] text-[color:var(--color-clinic-muted)] leading-relaxed mt-0.5">
            Gunakan tombol <strong>Depan / Belakang</strong> untuk memutar sudut pandang anatomi, dan tombol <strong>Zoom</strong> untuk memperbesar model tubuh di sebelah kanan.
          </p>
        </div>
      </div>

      {/* Primary CTA Button: Lanjut ke Model Anatomi */}
      {onGoToModel && (
        <div className="pt-2.5 border-t border-black/5 shrink-0">
          <Button
            onClick={onGoToModel}
            className="w-full gap-2 rounded-full bg-[color:var(--color-clinic-blue)] py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-[color:var(--color-clinic-blue-dark)] shadow-md shadow-[color:var(--color-clinic-blue)]/20 transition-all cursor-pointer"
          >
            <Layers className="h-4 w-4 shrink-0" />
            <span>Mulai & Pilih Model Anatomi</span>
            <ArrowRight className="h-4 w-4 shrink-0 ml-1" />
          </Button>
        </div>
      )}

      {/* Footer Banner */}
      <div className="pt-2 border-t border-black/5 flex items-center justify-between gap-2 text-[10px] text-[color:var(--color-clinic-muted)] shrink-0">
        <div className="flex items-center gap-1.5 font-medium text-slate-600 truncate">
          <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--color-clinic-blue)] shrink-0" />
          <span className="truncate">Sistem analisis AI tervalidasi dengan referensi klinis terpercaya</span>
        </div>
        <span className="font-bold text-[color:var(--color-clinic-blue)] shrink-0">
          SiagaSehat AI
        </span>
      </div>
    </div>
  );
}
