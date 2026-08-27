import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Leaf,
  MapPin,
  Pill,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import type { DangerLevel, ScanResult } from "@/lib/scanner/types";
import { Button } from "@/components/ui/button";
import { PharmacyMap } from "@/components/maps/PharmacyMap";
import { AiConsultation } from "./AiConsultation";

const DANGER_STYLES: Record<
  DangerLevel,
  {
    label: string;
    badge: string;
    icon: typeof ShieldCheck;
    ring: string;
    card: string;
    panel: string;
    title: string;
    accent: string;
  }
> = {
  rendah: {
    label: "Bahaya Rendah",
    badge: "bg-emerald-100 text-emerald-700",
    icon: ShieldCheck,
    ring: "from-emerald-400 to-emerald-500",
    card: "border-emerald-200 bg-emerald-50/60",
    panel: "from-emerald-500 to-teal-400",
    title: "text-emerald-950",
    accent: "text-emerald-100",
  },
  sedang: {
    label: "Perlu Diperhatikan",
    badge: "bg-amber-100 text-amber-700",
    icon: ShieldQuestion,
    ring: "from-amber-400 to-amber-500",
    card: "border-amber-200 bg-amber-50/60",
    panel: "from-amber-400 to-yellow-300",
    title: "text-amber-950",
    accent: "text-amber-100",
  },
  tinggi: {
    label: "Bahaya Tinggi",
    badge: "bg-red-100 text-red-700",
    icon: ShieldAlert,
    ring: "from-red-400 to-red-500",
    card: "border-red-200 bg-red-50/60",
    panel: "from-red-500 to-rose-400",
    title: "text-red-950",
    accent: "text-red-100",
  },
};

const BounceCard = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex h-full flex-col rounded-2xl border p-7 shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      {children}
    </motion.div>
  );
};

const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <h3 className={`mx-auto text-center text-2xl font-bold font-display ${className ?? ""}`}>
      {children}
    </h3>
  );
};

export function ScanResultView({
  result,
  previewUrl,
  onReset,
}: {
  result: ScanResult;
  previewUrl: string;
  onReset: () => void;
}) {
  if (!result.gambar_dapat_dianalisis) {
    return (
      <div className="animate-fade-up rounded-[24px] bg-white p-8 text-center shadow-[var(--shadow-clinic)]">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-100 text-amber-600">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold text-[color:var(--color-clinic-ink)]">
          Foto Belum Bisa Dianalisis
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--color-clinic-muted)]">
          {result.ringkasan}
        </p>
        <Button
          onClick={onReset}
          className="mt-6 gap-2 rounded-full bg-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue-dark)]"
        >
          <RotateCcw className="h-4 w-4" />
          Coba Foto Lain
        </Button>
      </div>
    );
  }

  const danger = DANGER_STYLES[result.tingkat_bahaya];
  const DangerIcon = danger.icon;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-bold uppercase tracking-wide text-[color:var(--color-clinic-blue)]">
          Hasil Skrining AI
        </p>
      </div>

      {/* Header card: photo + disease identity */}
      <div
        className={`animate-fade-up grid w-full gap-6 rounded-[28px] border p-6 shadow-[var(--shadow-clinic-lg)] md:grid-cols-[280px_1fr] md:p-8 lg:grid-cols-[320px_1fr] ${danger.card}`}
      >
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={previewUrl}
            alt="Foto yang dianalisis"
            className="aspect-square w-full object-cover max-h-[340px] md:max-h-none"
          />
          <span
            className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br text-white shadow-md ${danger.ring}`}
          >
            <DangerIcon className="h-5 w-5" />
          </span>
        </div>

        <div className="flex flex-col justify-center">
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${danger.badge}`}
          >
            <DangerIcon className="h-4 w-4" />
            {danger.label}
          </span>
          <h2
            className={`mt-3 font-display text-2xl font-extrabold md:text-3xl lg:text-4xl ${danger.title}`}
          >
            {result.nama_penyakit}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-clinic-muted)] md:text-base">
            {result.ringkasan}
          </p>
          <p className="mt-4 text-xs text-[color:var(--color-clinic-muted)] md:text-sm">
            Tingkat keyakinan analisis:{" "}
            <span className="font-semibold text-[color:var(--color-clinic-ink)]">
              {result.tingkat_keyakinan}
            </span>
          </p>
        </div>
      </div>

      {result.harus_ke_dokter && (
        <div
          className="animate-fade-up flex items-start gap-3 rounded-2xl border-2 border-red-200 bg-red-50 p-4"
          style={{ animationDelay: "0.05s" }}
        >
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-bold text-red-700">Segera konsultasi ke dokter</p>
            <p className="mt-1 text-sm text-red-700/90">{result.alasan_ke_dokter}</p>
          </div>
        </div>
      )}

      {/* Bouncy Cards Results Features Section */}
      <div className="mb-4 grid grid-cols-12 gap-4">
        {/* Card 1: Kemungkinan Penyebab */}
        <BounceCard className={`col-span-12 md:col-span-4 ${danger.card}`}>
          <CardTitle className={danger.title}>Kemungkinan Penyebab</CardTitle>
          <div
            className={`mt-8 flex flex-col items-start gap-2 rounded-2xl bg-gradient-to-br p-4 text-white shadow-md ${danger.panel}`}
          >
            <Stethoscope className={`h-7 w-7 shrink-0 ${danger.accent}`} />
            <ul className="space-y-1.5 text-xs sm:text-sm font-medium text-white leading-relaxed w-full">
              {result.penyebab.map((item, i) => (
                <li key={i} className="flex items-start gap-2 bg-white/15 rounded-xl p-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-200" />
                  <span className="text-xs sm:text-sm font-semibold">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </BounceCard>

        {/* Card 2: Pencegahan Mandiri */}
        <BounceCard className={`col-span-12 md:col-span-8 ${danger.card}`}>
          <CardTitle className={danger.title}>Pencegahan Mandiri</CardTitle>
          <div
            className={`mt-8 flex flex-col items-start gap-2 rounded-2xl bg-gradient-to-br p-4 text-slate-900 shadow-md ${danger.panel}`}
          >
            <CheckCircle2 className="w-7 h-7 shrink-0 text-[#11354A]" />
            <div className="grid gap-2 text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed sm:grid-cols-2 w-full">
              {result.pencegahan_mandiri.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 bg-white/40 rounded-xl p-2 border border-white/30"
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#379FD2]" />
                  <span className="text-xs sm:text-sm text-[#0C2A3C]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </BounceCard>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Card 3: Rekomendasi Obat */}
        <BounceCard className={`col-span-12 md:col-span-8 ${danger.card}`}>
          <CardTitle className={danger.title}>Rekomendasi Obat & Medis</CardTitle>
          <div
            className={`mt-8 flex flex-col items-start gap-2 rounded-2xl bg-gradient-to-br p-4 text-slate-900 shadow-md ${danger.panel}`}
          >
            <Pill className="w-7 h-7 shrink-0 text-[#0C2A3C]" />
            {result.obat_rekomendasi.length === 0 ? (
              <span className="text-xs sm:text-sm font-semibold text-[#0C2A3C]">
                Tidak ada saran obat bebas untuk kondisi ini — konsultasikan ke dokter/apoteker.
              </span>
            ) : (
              <div className="grid gap-2 text-xs sm:text-sm font-semibold text-slate-900 sm:grid-cols-2 w-full">
                {result.obat_rekomendasi.map((med, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-0.5 bg-white/50 rounded-xl p-2.5 border border-white/40 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-[#092231] text-xs sm:text-sm">
                        {med.nama}
                      </span>
                      <span className="rounded-full bg-[#379FD2] px-2 py-0.5 text-[11px] font-bold text-white">
                        {med.dosis}
                      </span>
                    </div>
                    <span className="text-xs text-[#143B52]">{med.catatan}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </BounceCard>

        {/* Card 4: Obat Herbal Alami */}
        <BounceCard className={`col-span-12 md:col-span-4 ${danger.card}`}>
          <CardTitle className={danger.title}>Obat Herbal Alami</CardTitle>
          <div
            className={`mt-8 flex flex-col items-start gap-2 rounded-2xl bg-gradient-to-br p-4 text-slate-900 shadow-md ${danger.panel}`}
          >
            <Leaf className="w-7 h-7 shrink-0 text-[#0C2A3C]" />
            {result.obat_herbal.length === 0 ? (
              <span className="text-xs sm:text-sm font-semibold text-[#0C2A3C]">
                Tidak ada saran obat herbal spesifik.
              </span>
            ) : (
              <div className="space-y-2 text-xs sm:text-sm font-semibold text-slate-900 w-full">
                {result.obat_herbal.map((herb, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-0.5 bg-white/40 rounded-xl p-2 border border-white/30"
                  >
                    <span className="font-bold text-[#092231] text-xs sm:text-sm">{herb.nama}</span>
                    <span className="text-xs text-[#143B52]">{herb.cara_pakai}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </BounceCard>
      </div>

      {/* Peta Fasilitas Kesehatan / Apotek / Rumah Sakit Terdekat */}
      <PharmacyMap dangerLevel={result.tingkat_bahaya} conditionName={result.nama_penyakit} />

      {result.catatan_tambahan && (
        <p
          className="animate-fade-up text-center text-xs text-[color:var(--color-clinic-muted)]"
          style={{ animationDelay: "0.35s" }}
        >
          {result.catatan_tambahan}
        </p>
      )}

      <div className="flex justify-center pt-2">
        <div className="flex gap-3">
          <AiConsultation
            initialContext={`Nama kondisi: ${result.nama_penyakit}\nRingkasan: ${result.ringkasan}\nTingkat keyakinan: ${result.tingkat_keyakinan}`}
          />
          <Button
            onClick={onReset}
            variant="outline"
            className="gap-2 rounded-full border-[color:var(--color-clinic-blue)]/30"
          >
            <RotateCcw className="h-4 w-4" />
            Scan Foto Lain
          </Button>
        </div>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-[color:var(--color-clinic-muted)]">
        <Sparkles className="h-3 w-3" />
        Hasil ini dibuat oleh AI dan bersifat edukatif, bukan pengganti diagnosis dokter
        profesional.
      </p>
    </div>
  );
}
