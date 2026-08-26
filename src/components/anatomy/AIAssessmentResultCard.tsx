import type { AIAssessmentResult } from "@/lib/anatomy/types";
import { Link } from "@tanstack/react-router";
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Info,
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
  onReset: () => void;
}

export function AIAssessmentResultCard({
  result,
  regionName,
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

  return (
    <div className="flex flex-col gap-6 rounded-[28px] bg-white p-6 md:p-8 shadow-[var(--shadow-clinic-lg)] border border-black/5 animate-fade-up">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[color:var(--color-clinic-blue)] text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--color-clinic-blue-dark)] uppercase tracking-wider">
              AI Health Assessment
            </span>
            <h2 className="font-display text-2xl font-extrabold text-[color:var(--color-clinic-ink)]">
              Hasil Analisis Anatomi: {regionName}
            </h2>
          </div>
        </div>

        <Button
          onClick={onReset}
          variant="outline"
          className="rounded-full gap-1.5 border-black/10 text-xs font-medium text-[color:var(--color-clinic-muted)] hover:bg-[#f7f9fb]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Periksa Bagian Lain
        </Button>
      </div>

      {/* Emergency Red Flag Warning Banner if Emergency Detected */}
      {isEmergency && (
        <div className="flex items-start gap-3.5 rounded-2xl bg-red-50 p-4 border border-red-200 text-red-900">
          <AlertOctagon className="mt-0.5 h-6 w-6 shrink-0 text-red-600 animate-pulse" />
          <div>
            <h4 className="text-sm font-bold text-red-700">⚠️ PERHATIAN MEDIS PENTING</h4>
            <p className="mt-1 text-xs leading-relaxed text-red-800">
              {emergencyMessage ||
                "Beberapa gejala yang Anda pilih memerlukan evaluasi medis segera. Jika kondisi terasa berat, memburuk, atau disertai sesak napas/nyeri hebat, segera hubungi layanan darurat atau IGD terdekat."}
            </p>
          </div>
        </div>
      )}

      {/* Main Condition Likelihood Card */}
      <div className="rounded-2xl bg-[color:var(--color-clinic-blue-soft)]/30 p-5 border border-[color:var(--color-clinic-blue)]/20">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-[color:var(--color-clinic-blue-dark)] uppercase tracking-wider">
              Kemungkinan Kondisi Utama
            </span>
            <h3 className="font-display text-2xl font-bold text-[color:var(--color-clinic-ink)] mt-0.5">
              {primaryCondition.name}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-[color:var(--color-clinic-blue-dark)]">
              {primaryCondition.likelihood}%
            </span>
            <span className="block text-[11px] font-medium text-[color:var(--color-clinic-muted)]">
              Tingkat Kecocokan
            </span>
          </div>
        </div>

        {/* Likelihood Progress Bar */}
        <div className="mt-3 h-2.5 w-full rounded-full bg-white overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-[color:var(--color-clinic-blue)] transition-all duration-1000 ease-out"
            style={{ width: `${primaryCondition.likelihood}%` }}
          />
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[color:var(--color-clinic-ink)]">
          {primaryCondition.reason}
        </p>
      </div>

      {/* Differential / Alternative Conditions */}
      {differentialConditions.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-[color:var(--color-clinic-muted)] uppercase tracking-wider mb-2">
            Kemungkinan Kondisi Lainnya:
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {differentialConditions.map((cond, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-[#f7f9fb] p-3 border border-black/5"
              >
                <div>
                  <span className="text-xs font-semibold text-[color:var(--color-clinic-ink)]">
                    {cond.name}
                  </span>
                  {cond.reason && (
                    <p className="text-[11px] text-[color:var(--color-clinic-muted)] line-clamp-1">
                      {cond.reason}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[color:var(--color-clinic-blue)] shadow-xs">
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
          <h4 className="text-xs font-bold text-[color:var(--color-clinic-muted)] uppercase tracking-wider mb-2">
            Gejala yang Sesuai:
          </h4>
          <div className="flex flex-wrap gap-2">
            {matchedSymptoms.map((symptom, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue-soft)]/50 px-3 py-1 text-xs font-medium text-[color:var(--color-clinic-blue-dark)]"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary & Actionable Recommendations */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-[#f7f9fb] p-4 border border-black/5">
          <h4 className="text-xs font-bold text-[color:var(--color-clinic-ink)] mb-2">
            Ringkasan Penilaian
          </h4>
          <p className="text-xs text-[color:var(--color-clinic-muted)] leading-relaxed">
            {summary}
          </p>
        </div>

        <div className="rounded-2xl bg-[#f7f9fb] p-4 border border-black/5">
          <h4 className="text-xs font-bold text-[color:var(--color-clinic-ink)] mb-2">
            Rekomendasi Langkah Selanjutnya
          </h4>
          <ul className="space-y-1.5 text-xs text-[color:var(--color-clinic-muted)]">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[color:var(--color-clinic-blue)] font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Integrated CTAs to existing Consultation & AI Scanner features */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-black/5">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Link
            to="/consultation"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-clinic-blue)] px-6 py-3.5 text-xs font-semibold text-white shadow-md shadow-[color:var(--color-clinic-blue)]/20 transition hover:bg-[color:var(--color-clinic-blue-dark)]"
          >
            <Stethoscope className="h-4 w-4" />
            Konsultasi dengan Dokter
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <Link
            to="/scanner"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--color-clinic-blue)]/30 bg-white px-5 py-3.5 text-xs font-semibold text-[color:var(--color-clinic-ink)] shadow-xs transition hover:bg-[color:var(--color-clinic-blue-soft)]"
          >
            <ScanLine className="h-4 w-4 text-[color:var(--color-clinic-blue)]" />
            Lanjutkan dengan Scan AI
          </Link>
        </div>

        <Button
          onClick={onReset}
          variant="ghost"
          className="text-xs text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
        >
          Ubah Pilihan
        </Button>
      </div>

      {/* Mandatory Medical Safety Disclaimer */}
      <div className="rounded-xl bg-amber-50/60 p-3.5 border border-amber-200/60 flex items-start gap-2.5 text-[11px] text-amber-900 leading-relaxed">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
        <span>
          <strong>Disclaimer Medis:</strong> {disclaimer}
        </span>
      </div>
    </div>
  );
}
