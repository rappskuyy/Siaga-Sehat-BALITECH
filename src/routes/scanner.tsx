import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
  Loader2,
  ScanLine,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { analyzeHealthImage } from "@/lib/scanner/scan.server";
import type { ScanResult } from "@/lib/scanner/types";
import { ImageCapture, type SelectedImage } from "@/components/scanner/ImageCapture";
import { ScanningOverlay, SCAN_STEPS } from "@/components/scanner/ScanningOverlay";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/clinic/Footer";

// Lazy-load ScanResultView (and its heavy map/Leaflet dependencies) so initial mobile load is lightweight
const ScanResultView = lazy(() =>
  import("@/components/scanner/ScanResultView").then((mod) => ({
    default: mod.ScanResultView,
  }))
);

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

const PHOTO_GUIDE_IMAGES = {
  good: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=700&auto=format&fit=crop&q=80",
  bad: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=700&auto=format&fit=crop&q=80",
};

function getFriendlyScanError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (message.includes("timeout") || message.includes("network") || message.includes("fetch")) {
    return "AI sedang sulit dihubungi. Periksa koneksi lalu coba lagi.";
  }
  if (message.includes("json") || message.includes("format") || message.includes("valid")) {
    return "AI belum bisa membaca foto ini. Coba gunakan foto yang lebih jelas.";
  }
  if (message.includes("api") || message.includes("401") || message.includes("403") || message.includes("500")) {
    return "Layanan AI sedang tidak tersedia. Coba lagi nanti.";
  }
  return "AI sedang tidak bisa memproses foto. Coba lagi nanti.";
}

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: "Siaga Sehat" },
      {
        name: "description",
        content:
          "Unggah atau foto kondisi kulit/tubuhmu dan dapatkan skrining kesehatan awal dari Siaga Sehat, lengkap dengan penyebab, pencegahan, dan rekomendasi obat.",
      },
      { property: "og:title", content: "Siaga Sehat" },
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
  const [scanAlert, setScanAlert] = useState<{
    title?: string;
    message: string;
    details?: string[];
  } | null>(null);
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
    setScanAlert(null);
  };

  const handleScan = async () => {
    if (!image) return;

    if (!user) {
      toast.info("Kamu belum login. Hasil scan masih bisa dilihat, tetapi riwayat scan dan penyimpanan data tidak akan disimpan.", {
        duration: 5000,
      });
    }

    setStage("scanning");
    setScanAlert(null);
    setScanStep(0);
    intervalRef.current = setInterval(() => {
      setScanStep((s) => (s + 1) % SCAN_STEPS.length);
    }, 1100);

    try {
      const data = await analyze({
        data: { imageBase64: image.base64, mediaType: image.mediaType },
      });
      if (intervalRef.current) clearInterval(intervalRef.current);

      // If photo cannot be analyzed (unclear, blurry, dark, or not recognizable),
      // DO NOT navigate to the results view. Stay on the SAME page and display the alert!
      if (!data.gambar_dapat_dianalisis) {
        setStage("idle");
        const shortMessage =
          data.ringkasan?.trim() ||
          (data.penyebab && data.penyebab.length > 0
            ? data.penyebab[0]
            : "Foto buram atau tidak fokus pada area keluhan.");
        setScanAlert({
          title: "Foto Tidak Terdeteksi",
          message: shortMessage,
        });
        return;
      }

      setResult(data);
      setStage("result");

      if (user) {
        const { supabase } = await import("@/lib/supabase/client");
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
      setStage("idle");
      setScanAlert({
        title: "Foto Belum Berhasil Dianalisis",
        message:
          err instanceof Error
            ? err.message
            : "Terjadi kendala saat memproses gambar. Pastikan foto jelas dan koneksi internet stabil.",
        details: [
          "Pastikan foto tidak buram atau goyang saat memotret",
          "Gunakan pencahayaan ruangan yang terang merata",
          "Fokuskan kamera pada jarak 10–15 cm menyorot area keluhan",
        ],
      });
    }
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setScanAlert(null);
    setStage("idle");
  };

  return (
    <main className="min-h-screen bg-[#f7f4ee] pb-16 font-sans">
      <SiteHeader />
      <div className="px-5 pt-4 sm:px-6 md:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <h1 className="flex items-center gap-2 text-sm font-semibold text-[color:var(--color-clinic-ink)]">
            <ScanLine className="h-4 w-4 text-[color:var(--color-clinic-blue)]" />
            Scan
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
                  alert={scanAlert}
                />
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
                {PHOTO_DO.map((text, index) => (
                  <div
                    key={text}
                    className={`flex items-start gap-2.5 rounded-xl bg-white p-2.5 sm:p-3 ${index > 1 ? "hidden sm:flex" : ""}`}
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-[11px] leading-relaxed text-[color:var(--color-clinic-ink)] sm:text-xs">
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex flex-col gap-2">
                {PHOTO_DONT.map((text, index) => (
                  <div
                    key={text}
                    className={`flex items-start gap-2.5 rounded-xl bg-white/70 p-2.5 sm:p-3 ${index > 1 ? "hidden sm:flex" : ""}`}
                  >
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <span className="text-[11px] leading-relaxed text-[color:var(--color-clinic-muted)] sm:text-xs">
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
                <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
                  <div className="relative aspect-[4/3]">
                    <img
                      src={PHOTO_GUIDE_IMAGES.good}
                      alt="Contoh foto area keluhan yang terang dan fokus"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                      <CheckCircle2 className="h-3 w-3" />
                      Benar
                    </span>
                  </div>
                  <p className="p-2 text-[10px] font-semibold leading-snug text-emerald-900 sm:p-2.5 sm:text-[11px]">
                    Terang, fokus, dan area keluhan terlihat jelas
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
                  <div className="relative aspect-[4/3]">
                    <img
                      src={PHOTO_GUIDE_IMAGES.bad}
                      alt="Contoh foto yang kurang sesuai karena tidak fokus"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                      <XCircle className="h-3 w-3" />
                      Hindari
                    </span>
                  </div>
                  <p className="p-2 text-[10px] font-semibold leading-snug text-red-900 sm:p-2.5 sm:text-[11px]">
                    Gelap, buram, atau area keluhan tidak terlihat
                  </p>
                </div>
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
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[color:var(--color-clinic-blue)]" />
                  <p className="mt-3 text-sm text-[color:var(--color-clinic-muted)]">
                    Memuat hasil skrining...
                  </p>
                </div>
              }
            >
              <ScanResultView result={result} previewUrl={image.previewUrl} onReset={handleReset} />
            </Suspense>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
