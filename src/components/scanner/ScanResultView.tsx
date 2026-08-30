import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronDown,
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
    card: "border-slate-200 bg-slate-50",
    panel: "from-[color:var(--color-clinic-blue)] to-[color:var(--color-clinic-blue-dark)]",
    title: "text-slate-800",
    accent: "text-[color:var(--color-clinic-blue-soft)]",
  },
  sedang: {
    label: "Perlu Diperhatikan",
    badge: "bg-amber-100 text-amber-700",
    icon: ShieldQuestion,
    ring: "from-amber-400 to-amber-500",
    card: "border-slate-200 bg-slate-50",
    panel: "from-[color:var(--color-clinic-blue)] to-[color:var(--color-clinic-blue-dark)]",
    title: "text-slate-800",
    accent: "text-[color:var(--color-clinic-blue-soft)]",
  },
  tinggi: {
    label: "Bahaya Tinggi",
    badge: "bg-red-100 text-red-700",
    icon: ShieldAlert,
    ring: "from-red-400 to-red-500",
    card: "border-slate-200 bg-slate-50",
    panel: "from-[color:var(--color-clinic-blue)] to-[color:var(--color-clinic-blue-dark)]",
    title: "text-slate-800",
    accent: "text-[color:var(--color-clinic-blue-soft)]",
  },
};

const ResultCard = ({
  title,
  icon: Icon,
  className,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: typeof Stethoscope;
  className?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className="flex w-full shrink-0 items-center gap-2.5 px-4 py-3.5 text-left sm:px-7 sm:py-5 md:pointer-events-none md:justify-center md:px-7 md:pt-7 md:pb-0"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-800/5 text-slate-700 md:hidden">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="flex-1 font-display text-base font-bold text-slate-800 sm:text-lg md:mx-auto md:flex-none md:text-center md:text-2xl">
          {title}
        </h3>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 md:hidden ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div className={`${isOpen ? "block" : "hidden"} md:block`}>
        <div className="px-4 pb-4 sm:px-7 sm:pb-7 md:pt-8">{children}</div>
      </div>
    </motion.div>
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
      <div className="animate-fade-up grid w-full gap-6 rounded-[28px] border border-emerald-200 bg-emerald-50/60 p-6 shadow-[var(--shadow-clinic-lg)] md:grid-cols-[280px_1fr] md:p-8 lg:grid-cols-[320px_1fr]">
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
          <h2 className="mt-3 font-display text-2xl font-extrabold text-emerald-950 md:text-3xl lg:text-4xl">
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
        <ResultCard
          title="Kemungkinan Penyebab"
          icon={Stethoscope}
          defaultOpen={false}
          className="col-span-12 border-slate-200 bg-slate-50 md:col-span-4"
        >
          <div
            className={`flex flex-col items-start gap-2 rounded-2xl bg-gradient-to-br p-4 text-white shadow-md ${danger.panel}`}
          >
            <Stethoscope className={`hidden h-7 w-7 shrink-0 md:block ${danger.accent}`} />
            <ul className="space-y-1.5 text-xs sm:text-sm font-medium text-white leading-relaxed w-full">
              {result.penyebab.map((item, i) => (
                <li key={i} className="flex items-start gap-2 bg-white/15 rounded-xl p-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-clinic-blue-soft)]" />
                  <span className="text-xs sm:text-sm font-semibold">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </ResultCard>

        {/* Card 2: Pencegahan Mandiri */}
        <ResultCard
          title="Pencegahan Mandiri"
          icon={CheckCircle2}
          defaultOpen={false}
          className="col-span-12 border-slate-200 bg-slate-50 md:col-span-8"
        >
          <div
            className={`flex flex-col items-start gap-2 rounded-2xl bg-gradient-to-br p-4 text-slate-900 shadow-md ${danger.panel}`}
          >
            <CheckCircle2 className="hidden h-7 w-7 shrink-0 text-white md:block" />
            <div className="grid gap-2 text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed sm:grid-cols-2 w-full">
              {result.pencegahan_mandiri.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 bg-white/40 rounded-xl p-2 border border-white/30"
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--color-clinic-blue)]" />
                  <span className="text-xs sm:text-sm text-[color:var(--color-clinic-ink)]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ResultCard>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Card 3: Rekomendasi Obat */}
        <ResultCard
          title="Rekomendasi Obat & Medis"
          icon={Pill}
          defaultOpen={false}
          className="col-span-12 border-slate-200 bg-slate-50 md:col-span-8"
        >
          <div
            className={`flex flex-col items-start gap-2 rounded-2xl bg-gradient-to-br p-4 text-slate-900 shadow-md ${danger.panel}`}
          >
            <Pill className="hidden h-7 w-7 shrink-0 text-white md:block" />
            {result.obat_rekomendasi.length === 0 ? (
              <span className="text-xs sm:text-sm font-semibold text-[color:var(--color-clinic-ink)]">
                Tidak ada saran obat bebas untuk kondisi ini — konsultasikan ke dokter/apoteker.
              </span>
            ) : (
              <div className="grid gap-2 text-xs sm:text-sm font-semibold text-slate-900 sm:grid-cols-2 w-full">
                {result.obat_rekomendasi.map((med, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1 bg-white/50 rounded-xl p-2.5 border border-white/40 shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-[color:var(--color-clinic-ink)] sm:text-sm">
                        {med.nama}
                      </span>
                      <span className="rounded-full bg-[color:var(--color-clinic-blue-dark)] px-2 py-0.5 text-[11px] font-bold text-white">
                        {med.dosis}
                      </span>
                    </div>
                    <span className="text-xs text-[color:var(--color-clinic-ink)]">
                      {med.catatan}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ResultCard>

        {/* Card 4: Obat Herbal Alami */}
        <ResultCard
          title="Obat Herbal Alami"
          icon={Leaf}
          defaultOpen={false}
          className="col-span-12 border-slate-200 bg-slate-50 md:col-span-4"
        >
          <div
            className={`flex flex-col items-start gap-2 rounded-2xl bg-gradient-to-br p-4 text-slate-900 shadow-md ${danger.panel}`}
          >
            <Leaf className="hidden h-7 w-7 shrink-0 text-white md:block" />
            {result.obat_herbal.length === 0 ? (
              <span className="text-xs sm:text-sm font-semibold text-[color:var(--color-clinic-ink)]">
                Tidak ada saran obat herbal spesifik.
              </span>
            ) : (
              <div className="space-y-2 text-xs sm:text-sm font-semibold text-slate-900 w-full">
                {result.obat_herbal.map((herb, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-0.5 bg-white/40 rounded-xl p-2 border border-white/30"
                  >
                    <span className="text-xs font-bold text-[color:var(--color-clinic-ink)] sm:text-sm">
                      {herb.nama}
                    </span>
                    <span className="text-xs text-[color:var(--color-clinic-ink)]">
                      {herb.cara_pakai}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ResultCard>
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
        <div className="flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
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
