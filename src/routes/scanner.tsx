import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
  ScanLine,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { analyzeHealthImage } from "@/lib/scanner/scan.server";
import type { ScanResult } from "@/lib/scanner/types";
import { ImageCapture, type SelectedImage } from "@/components/scanner/ImageCapture";
import { ScanningOverlay, SCAN_STEPS } from "@/components/scanner/ScanningOverlay";
import { ScanResultView } from "@/components/scanner/ScanResultView";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { SiteHeader } from "@/components/layout/SiteHeader";

const PHOTO_DO = [
  "Gunakan cahaya alami atau lampu terang yang merata",
  "Ambil jarak dekat, fokuskan pada area yang bermasalah",
  "Gunakan latar belakang polos tanpa gangguan",
];

const PHOTO_DONT = [
  "Jangan gunakan filter, efek, atau edit foto",
  "Hindari foto buram atau bergerak saat memotret",
  "Hindari bayangan yang menutupi area keluhan",
];

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: "Scan Penyakit AI — Siaga Sehat" },
      {
        name: "description",
        content:
          "Unggah atau foto kondisi kulit/tubuhmu dan dapatkan skrining kesehatan awal berbasis AI dari Siaga Sehat — lengkap dengan penyebab, pencegahan, dan rekomendasi obat.",
      },
      { property: "og:title", content: "Scan Penyakit AI — Siaga Sehat" },
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

    if (!user) {
      toast.info("Kamu belum login. Hasil scan masih bisa dilihat, tetapi riwayat scan dan penyimpanan data tidak akan disimpan.", {
        duration: 5000,
      });
    }

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
      <SiteHeader />
      <div className="px-5 pt-4 sm:px-6 md:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <h1 className="flex items-center gap-2 text-sm font-semibold text-[color:var(--color-clinic-ink)]">
            <ScanLine className="h-4 w-4 text-[color:var(--color-clinic-blue)]" />
            Scan AI
          </h1>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-[color:var(--color-clinic-ink)] shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>

      <div className="relative z-20 mt-6 w-full px-5 sm:px-6 md:px-8 lg:px-10">
        {stage !== "result" && (
          <div className="mx-auto grid w-full max-w-6xl gap-6 rounded-[28px] bg-white p-5 shadow-[var(--shadow-clinic-lg)] md:p-8 lg:grid-cols-12">
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

            {/* Right: correct photo-taking guide */}
            <div className="flex flex-col rounded-[24px] border border-black/[0.06] bg-[color:var(--color-clinic-blue-soft)]/30 p-5 lg:col-span-5 md:p-6">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[color:var(--color-clinic-blue)] shadow-sm">
                  <Lightbulb className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-[color:var(--color-clinic-ink)]">
                    Tata Cara Foto yang Benar
                  </p>
                  <p className="text-[11px] text-[color:var(--color-clinic-muted)]">
                    Ikuti panduan ini agar hasil analisis lebih akurat
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {PHOTO_DO.map((text) => (
                  <div key={text} className="flex items-start gap-2.5 rounded-xl bg-white p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-xs leading-relaxed text-[color:var(--color-clinic-ink)]">
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex flex-col gap-2">
                {PHOTO_DONT.map((text) => (
                  <div key={text} className="flex items-start gap-2.5 rounded-xl bg-white/70 p-3">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <span className="text-xs leading-relaxed text-[color:var(--color-clinic-muted)]">
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-4 flex items-start gap-2 border-t border-black/[0.06] text-[11px] leading-relaxed text-[color:var(--color-clinic-muted)]">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--color-clinic-blue)]" />
                Hasil scan bersifat edukatif dan bukan pengganti diagnosis dokter.
              </div>
            </div>
          </div>
        )}

        {stage === "result" && result && image && (
          <div className="mx-auto w-full max-w-6xl">
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
