import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, ArrowLeft, Camera, ScanLine, Sparkles, UploadCloud } from "lucide-react";

import { analyzeHealthImage } from "@/lib/scanner/scan.server";
import type { ScanResult } from "@/lib/scanner/types";
import { ImageCapture, type SelectedImage } from "@/components/scanner/ImageCapture";
import { ScanningOverlay, SCAN_STEPS } from "@/components/scanner/ScanningOverlay";
import { ScanResultView } from "@/components/scanner/ScanResultView";
import { Button } from "@/components/ui/button";
import fotodokter2 from "@/assets/fotodokter(2).png?url";
import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: "Scan Penyakit AI — SiagaSehat" },
      {
        name: "description",
        content:
          "Unggah atau foto kondisi kulit/tubuhmu dan dapatkan skrining kesehatan awal berbasis AI dari SiagaSehat — lengkap dengan penyebab, pencegahan, dan rekomendasi obat.",
      },
      { property: "og:title", content: "Scan Penyakit AI — SiagaSehat" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScannerPage,
});

type Stage = "idle" | "scanning" | "result" | "error";

function ScannerPage() {
  const analyze = useServerFn(analyzeHealthImage);
  const { user } = useAuth();

  const [image, setImage] = useState<SelectedImage | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleImageChange = (next: SelectedImage | null) => {
    setImage(next);
    setStage("idle");
    setResult(null);
    setErrorMessage(null);
  };

  const handleScan = async () => {
    if (!image) return;
    setStage("scanning");
    setErrorMessage(null);
    setScanStep(0);
    intervalRef.current = setInterval(() => {
      setScanStep((s) => (s + 1) % SCAN_STEPS.length);
    }, 1100);

    try {
      const data = await analyze({
        data: { imageBase64: image.base64, mediaType: image.mediaType },
      });
      if (intervalRef.current) clearInterval(intervalRef.current);
      setResult(data);
      setStage("result");

      if (user) {
        supabase
          .from("scan_history")
          .insert({
            user_id: user.id,
            nama_penyakit: data.nama_penyakit,
            ringkasan: data.ringkasan,
            tingkat_bahaya: data.tingkat_bahaya,
            tingkat_keyakinan: data.tingkat_keyakinan,
            harus_ke_dokter: data.harus_ke_dokter,
            penyebab: data.penyebab,
            pencegahan_mandiri: data.pencegahan_mandiri,
            obat_rekomendasi: data.obat_rekomendasi,
            obat_herbal: data.obat_herbal,
            catatan_tambahan: data.catatan_tambahan,
            image_preview: null,
          })
          .then(({ error: insertError }) => {
            if (insertError) console.error("Gagal menyimpan riwayat scan:", insertError.message);
          });
      }
    } catch (err) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan saat menganalisis gambar.",
      );
      setStage("error");
    }
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setErrorMessage(null);
    setStage("idle");
  };

  return (
    <main className="min-h-screen bg-[#f7f4ee] pb-16 font-sans">
      <div className="px-4 pt-4 sm:px-6 md:px-8 lg:px-10">
        <header className="hex-pattern relative overflow-hidden rounded-3xl bg-[color:var(--color-clinic-blue)] px-6 py-5 shadow-md border border-white/10 flex items-center justify-between gap-4 w-full">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white shadow-sm">
              <span className="h-3 w-3 rounded-full bg-[color:var(--color-clinic-blue)]" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">
              SiagaSehat
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/30 hover:scale-105 active:scale-95 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </header>
      </div>

      <div className="relative z-20 w-full px-4 mt-6 sm:px-6 md:px-8 lg:px-10">
        {stage !== "result" && (
          <div className="grid gap-6 rounded-[28px] bg-white p-5 shadow-[var(--shadow-clinic-lg)] lg:grid-cols-12 md:p-8 w-full">
            {/* Left: capture area */}
            <div className="flex flex-col gap-4 lg:col-span-7">
              {stage === "scanning" && image ? (
                <ScanningOverlay previewUrl={image.previewUrl} step={scanStep} />
              ) : (
                <ImageCapture
                  image={image}
                  onChange={handleImageChange}
                  disabled={stage === "scanning"}
                />
              )}

              {stage === "error" && errorMessage && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {errorMessage}
                </div>
              )}

              <Button
                onClick={handleScan}
                disabled={!image || stage === "scanning"}
                className="w-full gap-2 rounded-full bg-[color:var(--color-clinic-blue)] py-6 text-base font-semibold hover:bg-[color:var(--color-clinic-blue-dark)]"
              >
                <ScanLine className={`h-5 w-5 ${stage === "scanning" ? "animate-pulse" : ""}`} />
                {stage === "scanning" ? "Menganalisis..." : "Scan Sekarang"}
              </Button>
            </div>

            {/* Right: friendly illustration + steps */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-[color:var(--color-clinic-blue-soft)]/60 p-6 lg:col-span-5">
              <div className="relative mx-auto h-44 w-44">
                <span className="absolute inset-0 animate-scanner-ring rounded-full border-2 border-[color:var(--color-clinic-blue)]/40" />
                <span
                  className="absolute inset-0 animate-scanner-ring rounded-full border-2 border-[color:var(--color-clinic-blue)]/30"
                  style={{ animationDelay: "0.6s" }}
                />
                <div className="relative h-44 w-44 overflow-hidden rounded-full border-4 border-white shadow-lg">
                  <img
                    src={fotodokter2}
                    alt="Ilustrasi dokter AI"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <span className="animate-float absolute -right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white text-[color:var(--color-clinic-blue)] shadow-md">
                  <Sparkles className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  { icon: UploadCloud, text: "Upload atau foto kondisi kulit/tubuhmu" },
                  { icon: ScanLine, text: "AI menganalisis ciri-ciri visual secara instan" },
                  { icon: Camera, text: "Dapatkan penjelasan, pencegahan, dan rekomendasi" },
                ].map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl bg-white/70 p-3 backdrop-blur"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[color:var(--color-clinic-blue)] shadow-sm">
                      <step.icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-medium text-[color:var(--color-clinic-ink)]">
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-center text-[11px] leading-relaxed text-[color:var(--color-clinic-muted)]">
                Hasil scan bersifat edukatif dan bukan pengganti diagnosis dokter.
              </p>
            </div>
          </div>
        )}

        {stage === "result" && result && image && (
          <div className="w-full">
            <ScanResultView result={result} previewUrl={image.previewUrl} onReset={handleReset} />
          </div>
        )}
      </div>

      <footer className="pt-10 text-center text-xs text-[color:var(--color-clinic-muted)]">
        © {new Date().getFullYear()} SiagaSehat. Fitur ini menggunakan AI dan tidak menggantikan
        konsultasi medis profesional.
      </footer>
    </main>
  );
}
