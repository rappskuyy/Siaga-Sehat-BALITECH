import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { AIAssessmentResult, AnatomyRegion } from "@/lib/anatomy/types";
import { ANATOMY_REGIONS } from "@/data/anatomyData";
import { assessHealthAnatomy } from "@/lib/anatomy/anatomy.server";
import { AnatomyViewer } from "./AnatomyViewer";
import { SymptomSelectorCard } from "./SymptomSelectorCard";
import { AIAssessmentResultCard } from "./AIAssessmentResultCard";
import { AlertCircle, Activity, Sparkles } from "lucide-react";

export function AnatomyExplorer() {
  const assessFn = useServerFn(assessHealthAnatomy);

  const [selectedRegion, setSelectedRegion] = useState<AnatomyRegion>(ANATOMY_REGIONS[0]); // Default: Kepala
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<AIAssessmentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Switch region handler
  const handleSelectRegion = (region: AnatomyRegion) => {
    setSelectedRegion(region);
    setSelectedSymptoms([]);
    setSelectedConditions([]);
    setAssessmentResult(null);
    setErrorMessage(null);
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

  // Reset current selection
  const handleReset = () => {
    setSelectedSymptoms([]);
    setSelectedConditions([]);
    setAdditionalNotes("");
    setAssessmentResult(null);
    setErrorMessage(null);
  };

  // Trigger AI assessment call
  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0 && selectedConditions.length === 0) {
      setErrorMessage("Silakan pilih minimal 1 gejala atau kondisi sebelum memulai analisis.");
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
    } catch (err) {
      console.error("Gagal melakukan AI Health Assessment:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memproses analisis. Silakan coba lagi beberapa saat lagi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      {/* Top Banner Intro */}
      <div className="text-center mb-6 md:mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue-soft)]/60 px-4 py-1 text-xs font-semibold text-[color:var(--color-clinic-blue-dark)] shadow-xs">
          <Activity className="h-3.5 w-3.5" />
          Interactive Anatomy Explorer & AI Assessment
        </span>
        <h1 className="font-display text-2xl font-extrabold text-[color:var(--color-clinic-ink)] sm:text-3xl md:text-4xl mt-2.5 tracking-tight">
          Eksplorasi Anatomi Tubuh
        </h1>
        <p className="mt-2 max-w-xl mx-auto text-xs md:text-sm text-[color:var(--color-clinic-muted)] leading-relaxed">
          Pilih bagian tubuh secara interaktif di model anatomi sebelah kanan, tandai gejala yang Anda rasakan, dan dapatkan analisis kesehatan awal berbasis AI.
        </p>
      </div>

      {/* Main 2-Column Responsive Layout: Left (Symptoms / Result) & Right (Anatomy Viewer) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Symptom Selector OR AI Assessment Result (Col Span 7) */}
        <div className="lg:col-span-7 w-full">
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-700 border border-red-200 shadow-sm animate-fade-up">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>{errorMessage}</div>
            </div>
          )}

          {assessmentResult ? (
            <AIAssessmentResultCard
              result={assessmentResult}
              regionName={selectedRegion.nameIndonesian}
              onReset={handleReset}
            />
          ) : (
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
          )}
        </div>

        {/* Right Column: Interactive Anatomy Viewer (Col Span 5) */}
        <div className="lg:col-span-5 w-full">
          <AnatomyViewer
            selectedRegion={selectedRegion}
            onSelectRegion={handleSelectRegion}
          />
        </div>
      </div>
    </div>
  );
}
