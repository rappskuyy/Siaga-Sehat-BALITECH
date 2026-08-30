import type { AnatomyRegion } from "@/lib/anatomy/types";
import { ANATOMY_REGIONS } from "@/data/anatomyData";
import {
  MousePointerClick,
  CheckSquare2,
  Sparkles,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  Activity,
  Layers,
} from "lucide-react";

interface AnatomyGuideCardProps {
  onSelectRegion: (region: AnatomyRegion) => void;
}

export function AnatomyGuideCard({ onSelectRegion }: AnatomyGuideCardProps) {
  const steps = [
    {
      step: "1",
      icon: MousePointerClick,
      color: "bg-[color:var(--color-clinic-blue)] text-white",
      badge: "Pilih Bagian Tubuh",
      badgeStyle: "bg-[color:var(--color-clinic-blue-soft)]/60 text-[color:var(--color-clinic-blue-dark)]",
      desc: "Klik salah satu titik lingkaran biru pada model anatomi di sebelah kanan (Tampak Depan atau Belakang).",
    },
    {
      step: "2",
      icon: CheckSquare2,
      color: "bg-teal-600 text-white",
      badge: "Tandai Gejala",
      badgeStyle: "bg-teal-50 text-teal-700 border border-teal-200/60",
      desc: "Pilih gejala, tanda klinis, atau keluhan fisik spesifik yang sedang Anda rasakan pada organ tersebut.",
    },
    {
      step: "3",
      icon: Sparkles,
      color: "bg-amber-500 text-white",
      badge: "Analisis AI Medis",
      badgeStyle: "bg-amber-50 text-amber-800 border border-amber-200/60",
      desc: "Tambahkan catatan keluhan tambahan (opsional) lalu klik tombol 'Mulai Analisis AI'.",
    },
    {
      step: "4",
      icon: Stethoscope,
      color: "bg-emerald-600 text-white",
      badge: "Hasil & Rujukan",
      badgeStyle: "bg-emerald-50 text-emerald-800 border border-emerald-200/60",
      desc: "Dapatkan ringkasan kemungkinan kondisi, deteksi tanda bahaya darurat, dan rekomendasi rujukan konsultasi medis.",
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
    <div className="flex flex-col h-full rounded-[28px] bg-white p-5 md:p-6 shadow-[var(--shadow-clinic-lg)] border border-black/5 animate-fade-up justify-between">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-3 border-b border-black/5 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-[color:var(--color-clinic-blue)] text-white text-xs font-extrabold shadow-sm">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-[color:var(--color-clinic-ink)]">
                Panduan Pemeriksaan Anatomi
              </h2>
              <span className="rounded-full bg-[color:var(--color-clinic-blue-soft)]/60 px-2.5 py-0.5 text-[10px] font-bold text-[color:var(--color-clinic-blue-dark)] uppercase tracking-wider">
                Langkah Mudah
              </span>
            </div>
            <p className="text-xs text-[color:var(--color-clinic-muted)]">
              Ikuti tahapan berikut untuk melakukan evaluasi gejala tubuh berbasis AI
            </p>
          </div>
        </div>
      </div>

      {/* Main Steps List (Compact, Clean & Natural Spacing) */}
      <div className="mt-4 space-y-2.5">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="flex items-start gap-3 rounded-2xl border border-black/5 bg-[#f8fafc] p-3 transition-all hover:bg-white hover:border-[color:var(--color-clinic-blue)]/30 hover:shadow-xs"
            >
              <div
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl font-display font-extrabold text-xs shadow-2xs ${item.color}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-clinic-muted)]">
                    Langkah {item.step}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${item.badgeStyle}`}>
                    {item.badge}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[color:var(--color-clinic-muted)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Select Popular Regions Section */}
      <div className="mt-4 pt-3.5 border-t border-black/5 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[color:var(--color-clinic-ink)]">
          <Activity className="h-3.5 w-3.5 text-[color:var(--color-clinic-blue)]" />
          <span>Atau Pilih Cepat Bagian Tubuh:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {popularRegions.map((region) => (
            <button
              key={region.id}
              type="button"
              onClick={() => onSelectRegion(region)}
              className="inline-flex items-center gap-1 rounded-full bg-[#f1f5f9] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-clinic-ink)] hover:bg-[color:var(--color-clinic-blue)] hover:text-white transition shadow-2xs border border-black/5 group cursor-pointer"
            >
              <span>{region.nameIndonesian}</span>
              <ArrowRight className="h-3 w-3 opacity-50 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* Footer Banner */}
      <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between gap-2 text-[11px] text-[color:var(--color-clinic-muted)] shrink-0">
        <div className="flex items-center gap-1.5 font-medium text-slate-600">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>Analisis didukung AI medis & referensi klinis terpercaya</span>
        </div>
        <span className="text-[10px] font-semibold text-[color:var(--color-clinic-blue)] bg-[color:var(--color-clinic-blue-soft)]/40 px-2.5 py-0.5 rounded-full">
          SiagaSehat AI
        </span>
      </div>
    </div>
  );
}
