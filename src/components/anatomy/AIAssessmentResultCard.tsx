import type { AIAssessmentResult } from "@/lib/anatomy/types";
import { Link } from "@tanstack/react-router";
import {
  AlertOctagon,
  ArrowRight,
  Building2,
  CheckCircle2,
  MapPin,
  Navigation,
  RefreshCw,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIAssessmentResultCardProps {
  result: AIAssessmentResult;
  regionName: string;
  selectedSymptoms: string[];
  selectedConditions: string[];
  additionalNotes: string;
  onReset: () => void;
}

export function AIAssessmentResultCard({
  result,
  regionName,
  selectedSymptoms,
  selectedConditions,
  additionalNotes,
  onReset,
}: AIAssessmentResultCardProps) {
  const {
    summary,
    primaryCondition,
    differentialConditions,
    matchedSymptoms,
    recommendations,
    isEmergency,
    emergencyMessage,
    disclaimer,
  } = result;

  const consultationContext = JSON.stringify({
    regionName,
    selectedSymptoms,
    selectedConditions,
    additionalNotes,
    primaryCondition: primaryCondition.name,
  });

  return (
    <div className="flex flex-col h-full rounded-[24px] sm:rounded-[28px] bg-white p-3.5 sm:p-5 md:p-6 shadow-[var(--shadow-clinic-lg)] border border-black/5 overflow-hidden max-w-full animate-fade-up">
      {/* Header Banner */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 border-b border-black/5 pb-3.5 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-[color:var(--color-clinic-blue)] text-white shadow-md shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[color:var(--color-clinic-blue-dark)] uppercase tracking-wider">
              Hasil Analisis Kesehatan AI
            </span>
            <h2 className="font-display text-base sm:text-lg font-extrabold text-[color:var(--color-clinic-ink)] truncate">
              Hasil Analisis: {regionName}
            </h2>
          </div>
        </div>

        <Button
          onClick={onReset}
          variant="outline"
          className="rounded-full gap-1 border-black/10 text-xs font-semibold text-[color:var(--color-clinic-muted)] hover:bg-[#f7f9fb] px-3 py-1 h-8 shrink-0 cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Periksa Lagi</span>
        </Button>
      </div>

      {/* Middle Scrollable Section */}
      <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {/* Emergency Red Flag Warning Banner */}
        {isEmergency && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-red-50 p-3 sm:p-3.5 border border-red-200 text-red-900 shadow-xs">
            <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-red-600 animate-pulse" />
            <div>
              <h4 className="text-xs font-bold text-red-700 uppercase tracking-wide">
                ⚠️ Perhatian Medis Penting
              </h4>
              <p className="mt-1 text-[11px] leading-relaxed text-red-800">
                {emergencyMessage ||
                  "Beberapa gejala yang Anda pilih memerlukan evaluasi medis segera. Jika kondisi terasa berat, memburuk, atau disertai sesak napas/nyeri hebat, segera kunjungi Instalasi Gawat Darurat (IGD) rumah sakit terdekat."}
              </p>
            </div>
          </div>
        )}

        {/* Main Condition Likelihood Card */}
        <div className="rounded-2xl bg-[color:var(--color-clinic-blue-soft)]/30 p-3.5 sm:p-4 border border-[color:var(--color-clinic-blue)]/20">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-[color:var(--color-clinic-blue-dark)] uppercase tracking-wider">
                Kemungkinan Kondisi Utama
              </span>
              <h3 className="font-display text-base sm:text-lg font-bold text-[color:var(--color-clinic-ink)] mt-0.5">
                {primaryCondition.name}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-lg sm:text-xl font-extrabold text-[color:var(--color-clinic-blue-dark)]">
                {primaryCondition.likelihood}%
              </span>
              <span className="block text-[9px] sm:text-[10px] font-medium text-[color:var(--color-clinic-muted)]">
                Tingkat Kecocokan
              </span>
            </div>
          </div>

          {/* Likelihood Progress Bar */}
          <div className="mt-2.5 h-2 w-full rounded-full bg-white overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-[color:var(--color-clinic-blue)] transition-all duration-1000 ease-out"
              style={{ width: `${primaryCondition.likelihood}%` }}
            />
          </div>

          <p className="mt-2.5 text-xs leading-relaxed text-[color:var(--color-clinic-ink)]">
            {primaryCondition.reason}
          </p>
        </div>

        {/* Differential / Alternative Conditions */}
        {differentialConditions.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-[color:var(--color-clinic-muted)] uppercase tracking-wider mb-1.5">
              Kemungkinan Kondisi Lainnya:
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {differentialConditions.map((cond, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-[#f8fafc] p-2.5 border border-black/5"
                >
                  <div className="flex-1 pr-2 min-w-0">
                    <span className="text-xs font-semibold text-[color:var(--color-clinic-ink)] block truncate">
                      {cond.name}
                    </span>
                    {cond.reason && (
                      <p className="text-[10px] text-[color:var(--color-clinic-muted)] line-clamp-1">
                        {cond.reason}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[color:var(--color-clinic-blue)] shadow-xs shrink-0">
                    {cond.likelihood}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matched Symptoms Breakdown */}
        {matchedSymptoms.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-[color:var(--color-clinic-muted)] uppercase tracking-wider mb-1.5">
              Gejala yang Sesuai:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {matchedSymptoms.map((symptom, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-clinic-blue-soft)]/50 px-2.5 py-0.5 text-[11px] font-medium text-[color:var(--color-clinic-blue-dark)]"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {symptom}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Summary & Actionable Recommendations */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#f8fafc] p-3 sm:p-3.5 border border-black/5">
            <h4 className="text-xs font-bold text-[color:var(--color-clinic-ink)] mb-1">
              Ringkasan Penilaian
            </h4>
            <p className="text-[11px] text-[color:var(--color-clinic-muted)] leading-relaxed">
              {summary}
            </p>
          </div>

          <div className="rounded-2xl bg-[#f8fafc] p-3 sm:p-3.5 border border-black/5">
            <h4 className="text-xs font-bold text-[color:var(--color-clinic-ink)] mb-1">
              Rekomendasi Langkah Selanjutnya
            </h4>
            <ul className="space-y-1 text-[11px] text-[color:var(--color-clinic-muted)]">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[color:var(--color-clinic-blue)] font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Rekomendasi Rujukan IGD & Banner Gambar Peta */}
        {isEmergency && (
          <div className="rounded-2xl border border-red-200/80 bg-gradient-to-b from-red-50/40 to-white p-3.5 sm:p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-xl bg-red-600 text-white shadow-xs shrink-0">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[color:var(--color-clinic-ink)]">
                    Rujukan Rumah Sakit & IGD Terdekat
                  </h4>
                  <p className="text-[10px] text-[color:var(--color-clinic-muted)]">
                    Pemeriksaan rute navigasi dan fasilitas gawat darurat 24 jam
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-700 border border-red-200 shrink-0">
                Siaga 24 Jam
              </span>
            </div>

            {/* Visual Gambar Peta Interaktif Banner */}
            <Link
              to="/maps"
              className="relative block overflow-hidden rounded-2xl border border-red-200/80 bg-slate-900 h-28 sm:h-36 group cursor-pointer shadow-sm"
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-85 group-hover:scale-105 transition-transform duration-700"
                style={{
                  backgroundImage: `url("https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80")`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />

              {/* Pin Radar Visual */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-red-500 opacity-75"></span>
                  <div className="relative grid h-8 w-8 place-items-center rounded-full bg-red-600 text-white shadow-xl border-2 border-white group-hover:scale-110 transition-transform">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                </div>
                <span className="mt-1 rounded-full bg-slate-900/90 backdrop-blur-xs px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-md border border-white/10">
                  Cari RS & IGD Terdekat
                </span>
              </div>

              {/* Bottom Card Overlay Info */}
              <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-white/90 truncate">
                  <Navigation className="h-3 w-3 text-red-400 shrink-0" />
                  Cek Faskes & Rute GPS
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-amber-300 group-hover:text-amber-200 text-[10px] sm:text-xs bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-xs shrink-0">
                  Buka Peta &rarr;
                </span>
              </div>
            </Link>

            <p className="text-[11px] text-[color:var(--color-clinic-muted)] text-center leading-relaxed">
              Berdasarkan gejala yang dipilih, Anda disarankan segera mengunjungi Instalasi Gawat Darurat (IGD). Buka fitur <strong>Peta Lokasi</strong> untuk melihat daftar lengkap rumah sakit terdekat.
            </p>

            <Link
              to="/maps"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-2.5 px-4 text-xs shadow-md transition group cursor-pointer"
            >
              <MapPin className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Lihat Rekomendasi RS Terdekat di Peta Lokasi</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}

        {/* Mandatory Medical Safety Disclaimer */}
        <div className="rounded-xl bg-amber-50/60 p-2.5 sm:p-3 border border-amber-200/60 flex items-start gap-2 text-[10px] text-amber-900 leading-relaxed">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-700 mt-0.5" />
          <span>
            <strong>Pernyataan Medis:</strong> {disclaimer}
          </span>
        </div>
      </div>

      {/* Integrated CTAs Footer */}
      <div className="pt-3 mt-3 border-t border-black/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {isEmergency && (
            <Link
              to="/maps"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-full bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 transition"
            >
              <MapPin className="h-3.5 w-3.5" />
              Peta IGD &rarr;
            </Link>
          )}

          <Link
            to="/consultation"
            search={{ anatomy: consultationContext }}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white shadow-md transition ${
              isEmergency
                ? "bg-[color:var(--color-clinic-blue-dark)] hover:bg-[color:var(--color-clinic-ink)]"
                : "bg-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue-dark)]"
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            Konsultasi Dokter &rarr;
          </Link>

          <Link
            to="/scanner"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-full border border-[color:var(--color-clinic-blue)]/30 bg-white px-3.5 py-2 text-xs font-semibold text-[color:var(--color-clinic-ink)] shadow-xs hover:bg-[color:var(--color-clinic-blue-soft)] transition"
          >
            <ScanLine className="h-3.5 w-3.5 text-[color:var(--color-clinic-blue)]" />
            Scan AI
          </Link>
        </div>

        <Button
          onClick={onReset}
          variant="ghost"
          className="w-full sm:w-auto text-xs text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)] px-2.5 py-1 h-8 cursor-pointer"
        >
          Ubah Pilihan
        </Button>
      </div>
    </div>
  );
}
