import { useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { AIAssessmentResult, AnatomyRegion } from "@/lib/anatomy/types";
import { assessHealthAnatomy } from "@/lib/anatomy/anatomy.server";
import { AnatomyViewer } from "./AnatomyViewer";
import { AnatomyGuideCard } from "./AnatomyGuideCard";
import { SymptomSelectorCard } from "./SymptomSelectorCard";
import { AIAssessmentResultCard } from "./AIAssessmentResultCard";
import { AlertCircle, Activity, User, FileText } from "lucide-react";

export function AnatomyExplorer() {
  const assessFn = useServerFn(assessHealthAnatomy);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepCardRef = useRef<HTMLDivElement>(null);

  // Initial state is null: user sees the Step-by-Step Guide Card until a body part is clicked
  const [selectedRegion, setSelectedRegion] = useState<AnatomyRegion | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<AIAssessmentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mobile tab state ("model" vs "detail") for screens < lg
  const [activeMobileTab, setActiveMobileTab] = useState<"model" | "detail">("model");

  // Instant & Smooth Auto-Lock Scroll to Step 2 / Detail Card Top
  const scrollToStep2 = () => {
    const target = stepCardRef.current || containerRef.current;
    if (target) {
      const rect = target.getBoundingClientRect();
      const absoluteTop = rect.top + window.pageYOffset - 16;
      window.scrollTo({ top: Math.max(0, absoluteTop), behavior: "smooth" });
    }
  };

  const triggerAutoLockScroll = () => {
    scrollToStep2();
    requestAnimationFrame(() => {
      scrollToStep2();
      setTimeout(scrollToStep2, 40);
      setTimeout(scrollToStep2, 120);
    });
  };

  // Switch / Select region handler
  const handleSelectRegion = (region: AnatomyRegion) => {
    setSelectedRegion(region);
    setSelectedSymptoms([]);
    setSelectedConditions([]);
    setAssessmentResult(null);
    setErrorMessage(null);
    // On mobile, auto switch to detail form so user sees symptom choices immediately
    setActiveMobileTab("detail");
    triggerAutoLockScroll();
  };

  // Toggle symptom checkbox
  const handleToggleSymptom = (symptomName: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomName)
        ? prev.filter((s) => s !== symptomName)
        : [...prev, symptomName],
    );
  };

  // Toggle condition checkbox
  const handleToggleCondition = (conditionName: string) => {
    setSelectedConditions((prev) =>
      prev.includes(conditionName)
        ? prev.filter((c) => c !== conditionName)
        : [...prev, conditionName],
    );
  };

  // Reset back to guide / initial state
  const handleReset = () => {
    setSelectedRegion(null);
    setSelectedSymptoms([]);
    setSelectedConditions([]);
    setAdditionalNotes("");
    setAssessmentResult(null);
    setErrorMessage(null);
    setActiveMobileTab("model");
    triggerAutoLockScroll();
  };

  // Trigger AI assessment call
  const handleAnalyze = async () => {
    if (!selectedRegion) {
      setErrorMessage("Silakan pilih bagian tubuh pada model anatomi terlebih dahulu.");
      setActiveMobileTab("model");
      triggerAutoLockScroll();
      return;
    }

    if (selectedSymptoms.length === 0 && selectedConditions.length === 0) {
      setErrorMessage("Silakan pilih minimal 1 gejala atau kondisi sebelum memulai analisis.");
      setActiveMobileTab("detail");
      triggerAutoLockScroll();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await assessFn({
        data: {
          regionId: selectedRegion.id,
          regionName: selectedRegion.nameIndonesian,
          symptoms: selectedSymptoms,
          selectedConditions,
          additionalNotes,
        },
      });
      setAssessmentResult(result);
      setActiveMobileTab("detail");
      triggerAutoLockScroll();
    } catch (err: unknown) {
      console.error("Gagal melakukan AI Health Assessment:", err);

      let message = "Terjadi kesalahan saat memproses analisis. Silakan coba lagi beberapa saat lagi.";
      const rawText = err instanceof Error ? err.message : String(err || "");

      try {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          message = parsed.map((item: { message?: string }) => item.message || "").filter(Boolean).join(", ");
        } else if (parsed && typeof parsed === "object" && parsed.message) {
          message = parsed.message;
        }
      } catch {
        if (rawText && !rawText.startsWith("{") && !rawText.startsWith("[")) {
          message = rawText;
        }
      }

      setErrorMessage(message || "Terjadi kesalahan saat memproses analisis.");
      setActiveMobileTab("detail");
      triggerAutoLockScroll();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-[1440px] mx-auto px-1 sm:px-2 min-w-0 overflow-hidden">
      {/* Top Banner Intro */}
      <div className="text-center mb-4 sm:mb-6 md:mb-8 min-w-0 max-w-full overflow-hidden">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue-soft)]/60 px-3.5 py-1 text-[11px] sm:text-xs font-semibold text-[color:var(--color-clinic-blue-dark)] shadow-xs max-w-full min-w-0 truncate">
          <Activity className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Interactive Anatomy Explorer & AI Assessment</span>
        </span>
        <h1 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-[color:var(--color-clinic-ink)] mt-2 tracking-tight break-words">
          Eksplorasi Anatomi Tubuh
        </h1>
        <p className="mt-1.5 max-w-xl mx-auto text-xs sm:text-sm text-[color:var(--color-clinic-muted)] leading-relaxed px-2 break-words">
          Pilih bagian tubuh secara interaktif di model anatomi, tandai gejala yang Anda rasakan, dan dapatkan analisis kesehatan awal berbasis AI.
        </p>
      </div>

      {/* Step-by-Step Visual Banner (Visible on Mobile & Tablet < lg) */}
      <div className="lg:hidden mb-3 rounded-2xl bg-white p-2.5 border border-black/5 shadow-xs w-full min-w-0 max-w-full overflow-hidden">
        <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-[color:var(--color-clinic-ink)] overflow-x-auto no-scrollbar w-full min-w-0 pb-0.5">
          <button
            type="button"
            onClick={() => {
              setActiveMobileTab("model");
              scrollToTop();
            }}
            className={`flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full border transition cursor-pointer ${
              !selectedRegion
                ? "bg-[color:var(--color-clinic-blue-soft)]/60 text-[color:var(--color-clinic-blue-dark)] border-[color:var(--color-clinic-blue)]/30 font-bold"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            <span className="grid h-4 w-4 place-items-center rounded-full bg-[color:var(--color-clinic-blue)] text-white text-[9px] font-extrabold shrink-0">
              1
            </span>
            <span className="whitespace-nowrap">Pilih Organ</span>
          </button>

          <span className="text-slate-300 font-bold shrink-0">→</span>

          <button
            type="button"
            onClick={() => {
              if (selectedRegion) {
                setActiveMobileTab("detail");
                scrollToTop();
              }
            }}
            className={`flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full border transition cursor-pointer ${
              selectedRegion && !assessmentResult
                ? "bg-teal-100 text-teal-800 border-teal-300 font-bold"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            <span className="grid h-4 w-4 place-items-center rounded-full bg-teal-600 text-white text-[9px] font-extrabold shrink-0">
              2
            </span>
            <span className="whitespace-nowrap">Tandai Gejala</span>
          </button>

          <span className="text-slate-300 font-bold shrink-0">→</span>

          <button
            type="button"
            onClick={() => {
              if (selectedRegion) {
                handleAnalyze();
              }
            }}
            className={`flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full border transition cursor-pointer ${
              isLoading
                ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            <span className="grid h-4 w-4 place-items-center rounded-full bg-amber-500 text-white text-[9px] font-extrabold shrink-0">
              3
            </span>
            <span className="whitespace-nowrap">Analisis AI</span>
          </button>

          <span className="text-slate-300 font-bold shrink-0">→</span>

          <button
            type="button"
            onClick={() => {
              if (assessmentResult) {
                setActiveMobileTab("detail");
                scrollToTop();
              }
            }}
            className={`flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full border transition cursor-pointer ${
              assessmentResult
                ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-600 text-white text-[9px] font-extrabold shrink-0">
              4
            </span>
            <span className="whitespace-nowrap">Hasil & Rujukan</span>
          </button>
        </div>
      </div>

      {/* Segmented Mobile Tab Switcher (Visible only on < lg screens when a region or result is active) */}
      <div ref={stepCardRef} className="lg:hidden mb-4 flex items-center justify-center p-1 rounded-2xl bg-white shadow-xs border border-black/5 max-w-md mx-auto w-full min-w-0 overflow-hidden">
        <button
          type="button"
          onClick={() => {
            setActiveMobileTab("model");
            scrollToTop();
          }}
          className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            activeMobileTab === "model"
              ? "bg-[color:var(--color-clinic-blue)] text-white shadow-sm"
              : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
          }`}
        >
          <User className="h-4 w-4 shrink-0" />
          <span className="truncate">Model Anatomi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMobileTab("detail")}
          className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer relative ${
            activeMobileTab === "detail"
              ? "bg-[color:var(--color-clinic-blue)] text-white shadow-sm"
              : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
          }`}
        >
          <FileText className="h-4 w-4 shrink-0" />
          <span className="truncate max-w-[140px] sm:max-w-none">
            {assessmentResult ? "Hasil Analisis" : selectedRegion ? `Gejala: ${selectedRegion.nameIndonesian}` : "Panduan Langkah"}
          </span>
          {selectedRegion && activeMobileTab !== "detail" && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
          )}
        </button>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-12 items-stretch w-full min-w-0 max-w-full overflow-hidden">
        {/* Left Column: Step-by-Step Guide OR Symptom Selector OR AI Assessment Result */}
        <div className={`lg:col-span-6 lg:order-1 w-full min-w-0 flex flex-col h-full overflow-hidden ${activeMobileTab === "detail" || !selectedRegion ? "block" : "hidden lg:flex"}`}>
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-red-50 p-3.5 sm:p-4 text-xs font-medium text-red-700 border border-red-200 shadow-sm animate-fade-up shrink-0">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="break-words min-w-0">{errorMessage}</div>
            </div>
          )}

          {assessmentResult && selectedRegion ? (
            <AIAssessmentResultCard
              result={assessmentResult}
              regionName={selectedRegion.nameIndonesian}
              selectedSymptoms={selectedSymptoms}
              selectedConditions={selectedConditions}
              additionalNotes={additionalNotes}
              onReset={handleReset}
            />
          ) : selectedRegion ? (
            <SymptomSelectorCard
              region={selectedRegion}
              selectedSymptoms={selectedSymptoms}
              selectedConditions={selectedConditions}
              additionalNotes={additionalNotes}
              onToggleSymptom={handleToggleSymptom}
              onToggleCondition={handleToggleCondition}
              onNotesChange={setAdditionalNotes}
              onReset={handleReset}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
            />
          ) : (
            <AnatomyGuideCard onSelectRegion={handleSelectRegion} />
          )}
        </div>

        {/* Right Column: Interactive Anatomy Viewer */}
        <div className={`lg:col-span-6 lg:order-2 w-full min-w-0 flex flex-col h-full overflow-hidden ${activeMobileTab === "model" || !selectedRegion ? "block" : "hidden lg:flex"}`}>
          <AnatomyViewer
            selectedRegion={selectedRegion}
            onSelectRegion={handleSelectRegion}
          />
        </div>
      </div>
    </div>
  );
}
