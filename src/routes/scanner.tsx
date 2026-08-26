import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, ArrowLeft, Camera, LogIn, ScanLine, Sparkles, UploadCloud, User } from "lucide-react";

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
    <main className="min-h-screen bg-[color:var(--color-clinic-blue-soft)] pb-16 font-sans">
      <header className="border-b border-black/5 bg-white px-6 py-5 md:px-8 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--color-clinic-blue)]">
              <span className="h-2.5 w-2.5 rounded-full bg-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-[color:var(--color-clinic-ink)]">SiagaSehat</span>
          </Link>
          <nav className="hidden items-center gap-1 rounded-full bg-[color:var(--color-clinic-blue-soft)]/60 px-2 py-1.5 text-sm md:flex">
            <Link to="/" className="rounded-full px-4 py-1.5 text-[color:var(--color-clinic-ink)] transition hover:bg-white">Beranda</Link>
            <Link to="/anatomy" className="rounded-full px-4 py-1.5 text-[color:var(--color-clinic-ink)] transition hover:bg-white">Anatomi</Link>
            <Link to="/consultation" className="rounded-full px-4 py-1.5 text-[color:var(--color-clinic-ink)] transition hover:bg-white">Konsultasi</Link>
            <span className="rounded-full bg-[color:var(--color-clinic-blue)] px-4 py-1.5 font-bold text-white">Scan AI</span>
          </nav>
          <Link to={user ? "/profile" : "/login"} className="hidden items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-ink)] px-4 py-2 text-xs font-semibold text-white md:inline-flex">
            {user ? <User className="h-3.5 w-3.5" /> : <LogIn className="h-3.5 w-3.5" />}
            {user ? "Profil" : "Masuk"}
          </Link>
          <Link to="/" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] md:hidden" aria-label="Kembali ke beranda">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pt-10 md:px-8 md:pt-14">
        <div className="mb-8 max-w-2xl">
          <span className="animate-fade-up inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--color-clinic-blue)]"><Sparkles className="h-3.5 w-3.5" /> Skrining awal</span>
          <h1 className="animate-fade-up mt-3 font-display text-4xl font-extrabold leading-tight text-[color:var(--color-clinic-ink)] md:text-5xl">Scan Penyakit AI</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[color:var(--color-clinic-muted)] md:text-base">Unggah foto kondisi kulit atau tubuhmu untuk mendapatkan gambaran awal yang mudah dipahami.</p>
        </div>
        {stage !== "result" && (
          <div className="grid gap-5 rounded-[28px] bg-white p-5 shadow-[var(--shadow-clinic-lg)] md:grid-cols-2 md:p-8">
            {/* Left: capture area */}
            <div className="flex flex-col gap-4">
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
            <div className="relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-[color:var(--color-clinic-blue-soft)]/60 p-5">
              <div className="relative mx-auto h-40 w-40">
                <span className="absolute inset-0 animate-scanner-ring rounded-full border-2 border-[color:var(--color-clinic-blue)]/40" />
                <span
                  className="absolute inset-0 animate-scanner-ring rounded-full border-2 border-[color:var(--color-clinic-blue)]/30"
                  style={{ animationDelay: "0.6s" }}
                />
                <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-white shadow-lg">
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
          <div className="rounded-[28px] bg-transparent">
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
