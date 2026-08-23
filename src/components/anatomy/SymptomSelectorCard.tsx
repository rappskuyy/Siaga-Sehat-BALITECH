import { useMemo, useState } from "react";
import type { AnatomyRegion } from "@/lib/anatomy/types";
import { Check, RotateCcw, Search, Sparkles, AlertTriangle } from "lucide-react";
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
    <div className="flex flex-col h-full rounded-[24px] bg-white p-4 md:p-6 shadow-[var(--shadow-clinic-lg)] border border-black/5">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 border-b border-black/5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] text-xs font-bold">
              ●
            </span>
            <h2 className="font-display text-xl font-bold text-[color:var(--color-clinic-ink)]">
              {region.nameIndonesian}
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-[color:var(--color-clinic-muted)]">
            {region.description}
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-clinic-blue-soft)]/60 px-3 py-1 text-[11px] font-medium text-[color:var(--color-clinic-muted)] hover:bg-[color:var(--color-clinic-blue-soft)] hover:text-[color:var(--color-clinic-blue)] transition shrink-0"
          title="Reset pilihan"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* Search & Tabs */}
      <div className="mt-3 space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[color:var(--color-clinic-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari gejala atau kondisi..."
            className="w-full rounded-full border border-black/10 bg-[#f7f9fb] pl-8 pr-3 py-1.5 text-xs font-medium text-[color:var(--color-clinic-ink)] placeholder:text-[color:var(--color-clinic-muted)] focus:border-[color:var(--color-clinic-blue)] focus:bg-white focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-1 border-b border-black/5 pb-2 text-xs overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-full px-3 py-1 font-medium text-[11px] whitespace-nowrap transition ${
              activeTab === "all"
                ? "bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue-dark)] font-semibold"
                : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
            }`}
          >
            Semua ({region.symptoms.length + region.conditions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("symptoms")}
            className={`rounded-full px-3 py-1 font-medium text-[11px] whitespace-nowrap transition ${
              activeTab === "symptoms"
                ? "bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue-dark)] font-semibold"
                : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
            }`}
          >
            Gejala ({region.symptoms.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("conditions")}
            className={`rounded-full px-3 py-1 font-medium text-[11px] whitespace-nowrap transition ${
              activeTab === "conditions"
                ? "bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue-dark)] font-semibold"
                : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
            }`}
          >
            Kondisi ({region.conditions.length})
          </button>
        </div>
      </div>

      {/* Symptoms & Conditions Checkboxes Container */}
      <div className="mt-2.5 flex-1 overflow-y-auto min-h-[220px] max-h-[300px] pr-1 space-y-3">
        {/* Symptoms Section */}
        {(activeTab === "all" || activeTab === "symptoms") && (
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--color-clinic-muted)] mb-1.5">
              Pilih Gejala yang Anda Rasakan:
            </h3>
            {filteredSymptoms.length === 0 ? (
              <p className="text-xs text-[color:var(--color-clinic-muted)] italic">
                Tidak ada gejala ditemukan.
              </p>
            ) : (
              <div className="grid gap-1.5">
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
                      className={`group flex items-center justify-between rounded-xl border p-2.5 cursor-pointer transition-all duration-150 select-none ${
                        isChecked
                          ? "border-[color:var(--color-clinic-blue)] bg-[color:var(--color-clinic-blue-soft)]/30 text-[color:var(--color-clinic-ink)] font-medium shadow-xs"
                          : "border-black/5 bg-[#f7f9fb] text-[color:var(--color-clinic-ink)] hover:border-[color:var(--color-clinic-blue)]/40 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`grid h-4.5 w-4.5 shrink-0 place-items-center rounded-md border transition-all ${
                            isChecked
                              ? "bg-[color:var(--color-clinic-blue)] border-[color:var(--color-clinic-blue)] text-white"
                              : "border-black/20 bg-white group-hover:border-[color:var(--color-clinic-blue)]"
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs">{symptom.name}</span>
                      </div>

                      {symptom.isEmergencyWarning && (
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Red Flag
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
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--color-clinic-muted)] mb-1.5 mt-2">
              Indikasi / Kondisi Terkait:
            </h3>
            {filteredConditions.length === 0 ? (
              <p className="text-xs text-[color:var(--color-clinic-muted)] italic">
                Tidak ada kondisi ditemukan.
              </p>
            ) : (
              <div className="grid gap-1.5">
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
                      className={`rounded-xl border p-2.5 cursor-pointer transition-all duration-150 select-none ${
                        isChecked
                          ? "border-[color:var(--color-clinic-blue)] bg-[color:var(--color-clinic-blue-soft)]/40 shadow-xs"
                          : "border-black/5 bg-[#f7f9fb] hover:bg-white hover:border-[color:var(--color-clinic-blue)]/40"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-md border transition-all ${
                            isChecked
                              ? "bg-[color:var(--color-clinic-blue)] border-[color:var(--color-clinic-blue)] text-white"
                              : "border-black/20 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-[color:var(--color-clinic-ink)]">
                              {condition.name}
                            </span>
                            <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] text-[color:var(--color-clinic-muted)] border border-black/5">
                              {condition.category}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-[color:var(--color-clinic-muted)] leading-relaxed line-clamp-2">
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

      {/* Additional Notes Input */}
      <div className="mt-3 pt-2.5 border-t border-black/5">
        <label className="block text-[11px] font-semibold text-[color:var(--color-clinic-ink)] mb-1">
          Keluhan / Catatan Tambahan (Opsional):
        </label>
        <textarea
          rows={2}
          value={additionalNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Tuliskan keluhan tambahan bila ada..."
          className="w-full rounded-xl border border-black/10 bg-[#f7f9fb] p-2 text-xs text-[color:var(--color-clinic-ink)] placeholder:text-[color:var(--color-clinic-muted)] focus:border-[color:var(--color-clinic-blue)] focus:bg-white focus:outline-none transition resize-none"
        />
      </div>

      {/* Action Footer */}
      <div className="mt-3 flex items-center justify-between gap-3 pt-2.5 border-t border-black/5">
        <div className="text-xs text-[color:var(--color-clinic-muted)]">
          <strong className="text-[color:var(--color-clinic-blue-dark)] font-bold">
            {totalSelected}
          </strong>{" "}
          dipilih
        </div>

        <Button
          onClick={onAnalyze}
          disabled={totalSelected === 0 || isLoading}
          className="gap-2 rounded-full bg-[color:var(--color-clinic-blue)] px-5 py-4 text-xs font-semibold text-white hover:bg-[color:var(--color-clinic-blue-dark)] shadow-md shadow-[color:var(--color-clinic-blue)]/20 transition disabled:opacity-50"
        >
          <Sparkles className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Menganalisis..." : "Analisis AI →"}
        </Button>
      </div>
    </div>
  );
}
