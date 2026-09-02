import { useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import type { AIAssessmentResult, AnatomyRegion } from "@/lib/anatomy/types";
import { assessHealthAnatomy } from "@/lib/anatomy/anatomy.server";
import { AnatomyViewer } from "./AnatomyViewer";
import { AnatomyGuideCard } from "./AnatomyGuideCard";
import { SymptomSelectorCard } from "./SymptomSelectorCard";
import { AIAssessmentResultCard } from "./AIAssessmentResultCard";
import { AlertCircle, Activity, ChevronRight, Sparkles, Stethoscope, Layers, BookOpen } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

type ExplorerStep = "guide" | "model" | "symptoms" | "result";

export function AnatomyExplorer() {
  const assessFn = useServerFn(assessHealthAnatomy);
  const { user } = useAuth();

  // Active step flow: "guide" -> "model" -> "symptoms" -> "result"
  const [activeStep, setActiveStep] = useState<ExplorerStep>("guide");

  const [selectedRegion, setSelectedRegion] = useState<AnatomyRegion | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<AIAssessmentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const topAnchorRef = useRef<HTMLDivElement>(null);

  // Precision scroll helper to scroll to top of step container (offset for sticky header)
  const scrollToTopStep = () => {
    const doScroll = () => {
      if (topAnchorRef.current) {
        topAnchorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    doScroll();
    requestAnimationFrame(doScroll);
    setTimeout(doScroll, 60);
    setTimeout(doScroll, 180);
  };

  // Switch / Select region handler (Triggers Step 3: Tandai Gejala)
  const handleSelectRegion = (region: AnatomyRegion) => {
    setSelectedRegion(region);
    setSelectedSymptoms([]);
    setSelectedConditions([]);
    setAssessmentResult(null);
    setErrorMessage(null);
    setActiveStep("symptoms");

    toast.success(`Organ terpilih: ${region.nameIndonesian}`, {
      description: "Silakan pilih gejala yang Anda rasakan.",
      duration: 3500,
    });

    scrollToTopStep();
  };

  // Move to Model Anatomi (Step 2)
  const handleGoToModel = () => {
    setActiveStep("model");
    scrollToTopStep();
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

  // Reset back to Panduan (Step 1)
  const handleReset = () => {
    setSelectedRegion(null);
    setSelectedSymptoms([]);
    setSelectedConditions([]);
    setAdditionalNotes("");
    setAssessmentResult(null);
    setErrorMessage(null);
    setActiveStep("guide");
    scrollToTopStep();
  };

  // Trigger AI assessment call (Step 4: Hasil AI)
  const handleAnalyze = async () => {
    if (!selectedRegion) {
      setErrorMessage("Silakan pilih bagian tubuh pada model anatomi terlebih dahulu.");
      return;
    }

    if (selectedSymptoms.length === 0 && selectedConditions.length === 0) {
      setErrorMessage("Silakan pilih minimal 1 gejala atau kondisi sebelum memulai analisis.");
      return;
    }

    if (!user) {
      toast.info("Kamu belum login. Hasil analisis anatomi tetap ditampilkan, tetapi riwayat tidak akan disimpan.", {
        duration: 5000,
      });
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
      setActiveStep("result");
      scrollToTopStep();
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
    } finally {
      setIsLoading(false);
    }
  };

  // Map active step string to numeric index (1 to 4)
  const stepNumber = activeStep === "guide" ? 1 : activeStep === "model" ? 2 : activeStep === "symptoms" ? 3 : 4;

  return (
    <div ref={containerRef} className="w-full max-w-[1440px] mx-auto min-w-0 overflow-hidden">
      {/* Top Banner Intro */}
      <div className="text-center mb-4 sm:mb-6 md:mb-8 px-2 min-w-0">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue-soft)]/80 px-3.5 py-1 text-[10px] sm:text-xs font-bold text-[color:var(--color-clinic-blue-dark)] shadow-2xs max-w-full truncate border border-[color:var(--color-clinic-blue)]/15">
          <Activity className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-clinic-blue)]" />
          Interactive Anatomy Explorer & AI Assessment
        </span>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-[color:var(--color-clinic-ink)] mt-2 tracking-tight break-words">
          Eksplorasi Anatomi Tubuh
        </h1>
        <p className="mt-1.5 max-w-xl mx-auto text-xs md:text-sm text-[color:var(--color-clinic-muted)] leading-relaxed px-1">
          Pilihan diagnostik interaktif berbasis AI. Ikuti 4 langkah mudah dari Panduan, Model Anatomi, Gejala, hingga Hasil AI Medis.
        </p>
      </div>

      {/* Scroll Anchor Target (Positioned above Step Wizard) */}
      <div ref={topAnchorRef} className="scroll-mt-24" />

      {/* Step Wizard Progress Bar - Professional Icons, No Emojis */}
      <div className="mb-5 mx-auto max-w-3xl px-2">
        <div className="flex items-center justify-between rounded-2xl bg-white p-2 sm:p-3 shadow-sm border border-black/5 text-xs">
          {/* Step 1: Panduan */}
          <button
            type="button"
            onClick={handleReset}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition cursor-pointer ${
              stepNumber === 1
                ? "bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue-dark)] font-bold shadow-2xs border border-[color:var(--color-clinic-blue)]/20"
                : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-clinic-blue)]" />
            <span className="truncate text-[11px] sm:text-xs">1. Panduan</span>
          </button>

          <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />

          {/* Step 2: Model Anatomi */}
          <button
            type="button"
            onClick={handleGoToModel}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition cursor-pointer ${
              stepNumber === 2
                ? "bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue-dark)] font-bold shadow-2xs border border-[color:var(--color-clinic-blue)]/20"
                : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
            }`}
          >
            <Layers className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
            <span className="truncate text-[11px] sm:text-xs">2. Model Anatomi</span>
          </button>

          <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />

          {/* Step 3: Tandai Gejala */}
          <button
            type="button"
            onClick={() => {
              if (selectedRegion) {
                setActiveStep("symptoms");
                scrollToTopStep();
              } else {
                toast.info("Silakan pilih organ pada model anatomi terlebih dahulu.");
              }
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition cursor-pointer ${
              stepNumber === 3
                ? "bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue-dark)] font-bold shadow-2xs border border-[color:var(--color-clinic-blue)]/20"
                : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5 shrink-0 text-teal-600" />
            <span className="truncate text-[11px] sm:text-xs">
              3. Gejala {selectedSymptoms.length > 0 && `(${selectedSymptoms.length})`}
            </span>
          </button>

          <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />

          {/* Step 4: Hasil AI */}
          <div
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition ${
              stepNumber === 4
                ? "bg-emerald-50 text-emerald-800 font-bold shadow-2xs border border-emerald-200"
                : "text-[color:var(--color-clinic-muted)]"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span className="truncate text-[11px] sm:text-xs">4. Hasil AI</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout: Left (Guide / Symptoms / Result) & Right (Anatomy Viewer) */}
      <div className="grid gap-5 lg:gap-6 lg:grid-cols-12 items-stretch min-w-0 max-w-full overflow-hidden">
        {/* Left Column: Step 1 (Guide) OR Step 3 (Symptom Selector) OR Step 4 (AI Assessment Result) */}
        <div
          ref={selectorRef}
          className={`lg:col-span-6 w-full flex flex-col min-w-0 overflow-hidden ${
            activeStep === "model" ? "hidden lg:flex" : "flex"
          }`}
        >
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-red-50 p-3.5 text-xs font-medium text-red-700 border border-red-200 shadow-2xs animate-fade-up shrink-0 min-w-0">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 break-words">{errorMessage}</div>
            </div>
          )}

          {activeStep === "result" && assessmentResult && selectedRegion ? (
            <AIAssessmentResultCard
              result={assessmentResult}
              regionName={selectedRegion.nameIndonesian}
              selectedSymptoms={selectedSymptoms}
              selectedConditions={selectedConditions}
              additionalNotes={additionalNotes}
              onReset={handleReset}
            />
          ) : activeStep === "symptoms" && selectedRegion ? (
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
            <AnatomyGuideCard
              onSelectRegion={handleSelectRegion}
              onGoToModel={handleGoToModel}
            />
          )}
        </div>

        {/* Right Column: Step 2 Interactive Anatomy Viewer (Col Span 6) */}
        <div
          ref={modelRef}
          className={`lg:col-span-6 w-full flex flex-col min-w-0 overflow-hidden ${
            activeStep === "model" ? "flex" : "hidden lg:flex"
          }`}
        >
          <AnatomyViewer
            selectedRegion={selectedRegion}
            onSelectRegion={handleSelectRegion}
          />
        </div>
      </div>
    </div>
  );
}
