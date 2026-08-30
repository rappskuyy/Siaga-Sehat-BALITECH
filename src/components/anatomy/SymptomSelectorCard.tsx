import { useMemo, useState } from "react";
import type { AnatomyRegion } from "@/lib/anatomy/types";
import { Check, RotateCcw, Search, Sparkles, AlertTriangle, X, ShieldAlert, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SymptomSelectorCardProps {
  region: AnatomyRegion;
  selectedSymptoms: string[];
  selectedConditions: string[];
  additionalNotes: string;
  onToggleSymptom: (symptomName: string) => void;
  onToggleCondition: (conditionName: string) => void;
  onNotesChange: (notes: string) => void;
  onReset: () => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export function SymptomSelectorCard({
  region,
  selectedSymptoms,
  selectedConditions,
  additionalNotes,
  onToggleSymptom,
  onToggleCondition,
  onNotesChange,
  onReset,
  onAnalyze,
  isLoading,
}: SymptomSelectorCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "symptoms" | "conditions">("all");

  const filteredSymptoms = useMemo(() => {
    return region.symptoms.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [region.symptoms, searchQuery]);

  const filteredConditions = useMemo(() => {
    return region.conditions.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [region.conditions, searchQuery]);

  const totalSelected = selectedSymptoms.length + selectedConditions.length;

  return (
    <div className="flex flex-col h-full rounded-[28px] bg-white p-5 md:p-6 shadow-[var(--shadow-clinic-lg)] border border-black/5">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-4 shrink-0">
        <div className="flex items-start gap-3">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[color:var(--color-clinic-blue)] text-white text-xs font-extrabold shadow-sm mt-0.5">
            2
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl md:text-2xl font-bold text-[color:var(--color-clinic-ink)]">
                {region.nameIndonesian}
              </h2>
              <span className="rounded-full bg-[color:var(--color-clinic-blue-soft)]/60 px-2.5 py-0.5 text-[11px] font-semibold text-[color:var(--color-clinic-blue-dark)]">
                {region.category.toUpperCase()}
              </span>
            </div>
            <p className="mt-1 text-xs text-[color:var(--color-clinic-muted)] leading-relaxed">
              {region.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3.5 py-1.5 text-xs font-semibold text-[color:var(--color-clinic-muted)] hover:bg-[color:var(--color-clinic-blue-soft)] hover:text-[color:var(--color-clinic-blue-dark)] transition shrink-0 border border-black/5"
          title="Reset semua pilihan gejala & catatan"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Search & Tabs Filter */}
      <div className="mt-4 space-y-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--color-clinic-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari gejala atau kondisi pada ${region.nameIndonesian.toLowerCase()}...`}
            className="w-full rounded-2xl border border-black/10 bg-[#f8fafc] pl-10 pr-9 py-2 text-xs font-medium text-[color:var(--color-clinic-ink)] placeholder:text-[color:var(--color-clinic-muted)] focus:border-[color:var(--color-clinic-blue)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-clinic-blue)]/20 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center transition"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-black/5 pb-2.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-full px-3.5 py-1.5 font-semibold text-xs whitespace-nowrap transition-all ${activeTab === "all"
                ? "bg-[color:var(--color-clinic-blue)] text-white shadow-sm"
                : "bg-[#f1f5f9] text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
              }`}
          >
            Semua ({region.symptoms.length + region.conditions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("symptoms")}
            className={`rounded-full px-3.5 py-1.5 font-semibold text-xs whitespace-nowrap transition-all ${activeTab === "symptoms"
                ? "bg-[color:var(--color-clinic-blue)] text-white shadow-sm"
                : "bg-[#f1f5f9] text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
              }`}
          >
            Gejala ({region.symptoms.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("conditions")}
            className={`rounded-full px-3.5 py-1.5 font-semibold text-xs whitespace-nowrap transition-all ${activeTab === "conditions"
                ? "bg-[color:var(--color-clinic-blue)] text-white shadow-sm"
                : "bg-[#f1f5f9] text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
              }`}
          >
            Kondisi ({region.conditions.length})
          </button>
        </div>
      </div>

      {/* Symptoms & Conditions Interactive List */}
      <div className="mt-3 flex-1 overflow-y-auto min-h-[220px] max-h-[420px] lg:max-h-[480px] pr-1.5 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
        {/* Symptoms Section */}
        {(activeTab === "all" || activeTab === "symptoms") && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-clinic-ink)]">
                Pilih Gejala yang Dirasakan
              </h3>
              <span className="text-[11px] text-[color:var(--color-clinic-muted)]">
                {selectedSymptoms.length} dipilih
              </span>
            </div>

            {filteredSymptoms.length === 0 ? (
              <div className="rounded-xl bg-[#f8fafc] p-4 text-center text-xs text-[color:var(--color-clinic-muted)]">
                Tidak ada gejala yang cocok dengan pencarian.
              </div>
            ) : (
              <div className="grid gap-2">
                {filteredSymptoms.map((symptom) => {
                  const isChecked = selectedSymptoms.includes(symptom.name);
                  return (
                    <div
                      key={symptom.id}
                      onClick={() => onToggleSymptom(symptom.name)}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onToggleSymptom(symptom.name);
                        }
                      }}
                      className={`group flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all duration-150 select-none ${isChecked
                          ? "border-[color:var(--color-clinic-blue)] bg-[color:var(--color-clinic-blue-soft)]/25 text-[color:var(--color-clinic-ink)] shadow-xs ring-1 ring-[color:var(--color-clinic-blue)]/30"
                          : "border-black/5 bg-[#f8fafc] text-[color:var(--color-clinic-ink)] hover:border-[color:var(--color-clinic-blue)]/40 hover:bg-white"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-lg border transition-all ${isChecked
                              ? "bg-[color:var(--color-clinic-blue)] border-[color:var(--color-clinic-blue)] text-white shadow-xs"
                              : "border-black/20 bg-white group-hover:border-[color:var(--color-clinic-blue)]"
                            }`}
                        >
                          {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-semibold">{symptom.name}</span>
                      </div>

                      {symptom.isEmergencyWarning && (
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700 border border-red-200/60">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          Tanda Bahaya
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Conditions Section */}
        {(activeTab === "all" || activeTab === "conditions") && (
          <div>
            <div className="flex items-center justify-between mb-2 mt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-clinic-ink)]">
                Indikasi & Riwayat Kondisi
              </h3>
              <span className="text-[11px] text-[color:var(--color-clinic-muted)]">
                {selectedConditions.length} dipilih
              </span>
            </div>

            {filteredConditions.length === 0 ? (
              <div className="rounded-xl bg-[#f8fafc] p-4 text-center text-xs text-[color:var(--color-clinic-muted)]">
                Tidak ada kondisi yang cocok dengan pencarian.
              </div>
            ) : (
              <div className="grid gap-2">
                {filteredConditions.map((condition) => {
                  const isChecked = selectedConditions.includes(condition.name);
                  return (
                    <div
                      key={condition.id}
                      onClick={() => onToggleCondition(condition.name)}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onToggleCondition(condition.name);
                        }
                      }}
                      className={`group rounded-xl border p-3 cursor-pointer transition-all duration-150 select-none ${isChecked
                          ? "border-[color:var(--color-clinic-blue)] bg-[color:var(--color-clinic-blue-soft)]/30 shadow-xs ring-1 ring-[color:var(--color-clinic-blue)]/30"
                          : "border-black/5 bg-[#f8fafc] hover:bg-white hover:border-[color:var(--color-clinic-blue)]/40"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-lg border transition-all ${isChecked
                              ? "bg-[color:var(--color-clinic-blue)] border-[color:var(--color-clinic-blue)] text-white shadow-xs"
                              : "border-black/20 bg-white group-hover:border-[color:var(--color-clinic-blue)]"
                            }`}
                        >
                          {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[color:var(--color-clinic-ink)]">
                              {condition.name}
                            </span>
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-[color:var(--color-clinic-muted)] border border-black/5">
                              {condition.category}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-[color:var(--color-clinic-muted)] leading-relaxed line-clamp-2">
                            {condition.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Additional Notes Field */}
      <div className="mt-3 pt-3 border-t border-black/5 shrink-0">
        <label className="block text-xs font-bold text-[color:var(--color-clinic-ink)] mb-1.5">
          Keluhan atau Catatan Tambahan <span className="font-normal text-[color:var(--color-clinic-muted)]">(Opsional)</span>:
        </label>
        <textarea
          rows={2}
          value={additionalNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Tuliskan durasi sakit, faktor pemicu, atau detail gejala lainnya di sini..."
          className="w-full rounded-2xl border border-black/10 bg-[#f8fafc] p-2.5 text-xs text-[color:var(--color-clinic-ink)] placeholder:text-[color:var(--color-clinic-muted)] focus:border-[color:var(--color-clinic-blue)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-clinic-blue)]/20 transition resize-none"
        />
      </div>

      {/* Sticky Bottom Action Footer */}
      <div className="mt-3 flex items-center justify-between gap-3 pt-3 border-t border-black/5 shrink-0">
        <div className="text-xs text-[color:var(--color-clinic-muted)]">
          <span className="font-semibold text-[color:var(--color-clinic-ink)]">Total Pilihan:</span>{" "}
          <strong className="text-[color:var(--color-clinic-blue-dark)] font-extrabold text-sm">
            {totalSelected}
          </strong>
        </div>

        <Button
          onClick={onAnalyze}
          disabled={totalSelected === 0 || isLoading}
          className="gap-2 rounded-full bg-[color:var(--color-clinic-blue)] px-6 py-4 text-xs font-bold text-white hover:bg-[color:var(--color-clinic-blue-dark)] shadow-md shadow-[color:var(--color-clinic-blue)]/25 transition-all duration-200 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Sedang Menganalisis..." : "Mulai Analisis AI →"}</span>
        </Button>
      </div>
    </div>
  );
}
