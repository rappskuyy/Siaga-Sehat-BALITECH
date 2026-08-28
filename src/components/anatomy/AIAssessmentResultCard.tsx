import type { AIAssessmentResult } from "@/lib/anatomy/types";
import { Link } from "@tanstack/react-router";
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
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
    <div className="flex flex-col h-full rounded-[28px] bg-white p-5 md:p-6 shadow-[var(--shadow-clinic-lg)] border border-black/5 overflow-hidden animate-fade-up">
      {/* Header Banner (Fixed Height / Shrink-0) */}
      <div className="flex items-center justify-between gap-3 border-b border-black/5 pb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-[color:var(--color-clinic-blue)] text-white shadow-md">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[color:var(--color-clinic-blue-dark)] uppercase tracking-wider">
              AI Health Assessment Result
            </span>
            <h2 className="font-display text-lg font-extrabold text-[color:var(--color-clinic-ink)]">
              Hasil Analisis: {regionName}
            </h2>
          </div>
        </div>

        <Button
          onClick={onReset}
          variant="outline"
          className="rounded-full gap-1 border-black/10 text-xs font-semibold text-[color:var(--color-clinic-muted)] hover:bg-[#f7f9fb] px-3 py-1 h-8 shrink-0"
        >
          <RefreshCw className="h-3 w-3" />
          Periksa Lagi
        </Button>
      </div>

      {/* Middle Scrollable Section (Flex-1) */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1.5 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {/* Emergency Red Flag Warning Banner if Emergency Detected */}
        {isEmergency && (
          <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-3.5 border border-red-200 text-red-900">
            <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-red-600 animate-pulse" />
            <div>
              <h4 className="text-xs font-bold text-red-700">⚠️ PERHATIAN MEDIS PENTING</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-red-800">
                {emergencyMessage ||
                  "Beberapa gejala yang Anda pilih memerlukan evaluasi medis segera. Jika kondisi terasa berat, memburuk, atau disertai sesak napas/nyeri hebat, segera hubungi layanan darurat atau IGD terdekat."}
              </p>
            </div>
          </div>
        )}

        {/* Main Condition Likelihood Card */}
        <div className="rounded-2xl bg-[color:var(--color-clinic-blue-soft)]/30 p-4 border border-[color:var(--color-clinic-blue)]/20">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-[color:var(--color-clinic-blue-dark)] uppercase tracking-wider">
                Kemungkinan Kondisi Utama
              </span>
              <h3 className="font-display text-lg font-bold text-[color:var(--color-clinic-ink)] mt-0.5">
                {primaryCondition.name}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xl font-extrabold text-[color:var(--color-clinic-blue-dark)]">
                {primaryCondition.likelihood}%
              </span>
              <span className="block text-[10px] font-medium text-[color:var(--color-clinic-muted)]">
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
                  <div className="flex-1 pr-2">
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
          <div className="rounded-2xl bg-[#f8fafc] p-3.5 border border-black/5">
            <h4 className="text-xs font-bold text-[color:var(--color-clinic-ink)] mb-1">
              Ringkasan Penilaian
            </h4>
            <p className="text-[11px] text-[color:var(--color-clinic-muted)] leading-relaxed">
              {summary}
            </p>
          </div>

          <div className="rounded-2xl bg-[#f8fafc] p-3.5 border border-black/5">
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

        {/* Mandatory Medical Safety Disclaimer */}
        <div className="rounded-xl bg-amber-50/60 p-3 border border-amber-200/60 flex items-start gap-2 text-[10px] text-amber-900 leading-relaxed">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-700 mt-0.5" />
          <span>
            <strong>Disclaimer Medis:</strong> {disclaimer}
          </span>
        </div>
      </div>

      {/* Integrated CTAs (Fixed / Sticky at Bottom) */}
      <div className="pt-3 mt-3 border-t border-black/5 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link
            to="/consultation"
            search={{ anatomy: consultationContext }}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue)] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[color:var(--color-clinic-blue-dark)] transition"
          >
            <Stethoscope className="h-3.5 w-3.5" />
            Konsultasi Dokter &rarr;
          </Link>

          <Link
            to="/scanner"
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[color:var(--color-clinic-blue)]/30 bg-white px-3.5 py-2 text-xs font-semibold text-[color:var(--color-clinic-ink)] shadow-xs hover:bg-[color:var(--color-clinic-blue-soft)] transition"
          >
            <ScanLine className="h-3.5 w-3.5 text-[color:var(--color-clinic-blue)]" />
            Scan AI
          </Link>
        </div>

        <Button
          onClick={onReset}
          variant="ghost"
          className="text-xs text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)] px-2.5 py-1 h-8"
        >
          Ubah Pilihan
        </Button>
      </div>
    </div>
  );
}
