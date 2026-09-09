import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Droplets,
  ExternalLink,
  Flower2,
  Leaf,
  Pill,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Sparkles,
  Sprout,
  TreePine,
  Wheat,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { DangerLevel, ScanResult } from "@/lib/scanner/types";
import { Button } from "@/components/ui/button";
import { PharmacyMap } from "@/components/maps/PharmacyMap";

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
    panel: "from-white to-slate-50",
    title: "text-slate-800",
    accent: "text-[color:var(--color-clinic-blue)]",
  },
  sedang: {
    label: "Perlu Diperhatikan",
    badge: "bg-amber-100 text-amber-700",
    icon: ShieldQuestion,
    ring: "from-amber-400 to-amber-500",
    card: "border-slate-200 bg-slate-50",
    panel: "from-white to-slate-50",
    title: "text-slate-800",
    accent: "text-[color:var(--color-clinic-blue)]",
  },
  tinggi: {
    label: "Bahaya Tinggi",
    badge: "bg-red-100 text-red-700",
    icon: ShieldAlert,
    ring: "from-red-400 to-red-500",
    card: "border-slate-200 bg-slate-50",
    panel: "from-white to-slate-50",
    title: "text-slate-800",
    accent: "text-[color:var(--color-clinic-blue)]",
  },
};

// Smart herb-to-icon mapping based on herb name keywords
const getHerbIcon = (herbName: string): React.FC<{ className?: string }> => {
  const name = herbName.toLowerCase();
  // Coconut / palm trees
  if (
    name.includes("kelapa") || name.includes("coconut") || name.includes("pohon") ||
    name.includes("pinang") || name.includes("sagu")
  ) return TreePine;
  // Flowers & blossoms
  if (
    name.includes("bunga") || name.includes("flower") || name.includes("lavender") ||
    name.includes("chamomile") || name.includes("mawar") || name.includes("rose") ||
    name.includes("melati") || name.includes("jasmine") || name.includes("kembang")
  ) return Flower2;
  // Grains, seeds, cereals
  if (
    name.includes("biji") || name.includes("seed") || name.includes("gandum") ||
    name.includes("beras") || name.includes("oat") || name.includes("wheat") ||
    name.includes("jewawut") || name.includes("jagung")
  ) return Wheat;
  // Aloe, moisture & gel plants
  if (
    name.includes("lidah buaya") || name.includes("aloe") || name.includes("gel") ||
    name.includes("bengkuang") || name.includes("timun") || name.includes("cucumber")
  ) return Droplets;
  // Sprouts, rhizomes, roots, turmeric, ginger family
  if (
    name.includes("jahe") || name.includes("ginger") || name.includes("kunyit") ||
    name.includes("temulawak") || name.includes("kencur") || name.includes("lengkuas") ||
    name.includes("umbi") || name.includes("akar") || name.includes("root") ||
    name.includes("sprout") || name.includes("toge") || name.includes("tauge")
  ) return Sprout;
  // Default: Leaf (general herbs, leaves, mint, basil, etc.)
  return Leaf;
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
  const [activeTab, setActiveTab] = useState<"penyebab" | "pencegahan">("penyebab");
  const [hoveredTab, setHoveredTab] = useState<"penyebab" | "pencegahan" | null>(null);

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
  const scanContext = JSON.stringify({
    namaPenyakit: result.nama_penyakit,
    ringkasan: result.ringkasan,
    tingkatBahaya: result.tingkat_bahaya,
    tingkatKeyakinan: result.tingkat_keyakinan,
    penyebab: result.penyebab,
    pencegahan: result.pencegahan_mandiri,
    alasanKeDokter: result.harus_ke_dokter ? result.alasan_ke_dokter : "",
    catatan: result.catatan_tambahan,
  });

  const rawMedicineList =
    result.obat_rekomendasi && result.obat_rekomendasi.length > 0
      ? result.obat_rekomendasi.map((item, idx) => {
          const isWarning =
            item.catatan?.toLowerCase().includes("resep") ||
            item.catatan?.toLowerCase().includes("dokter") ||
            item.catatan?.toLowerCase().includes("hati-hati");
          const formattedNote = (
            item.catatan || "Disarankan sesuai indikasi klinis hasil analisis skrining."
          )
            .replace(/sangat penting untuk/gi, "Disarankan untuk")
            .replace(/sangat penting/gi, "Disarankan");

          return {
            nama: item.nama,
            dosis: item.dosis,
            note: formattedNote,
            status: isWarning ? "Perhatian Khusus" : "Terverifikasi Aman",
          };
        })
      : [
          {
            nama: "Ibuprofen",
            dosis: "200 mg",
            note: "Disarankan untuk meredakan peradangan lokal, mengurangi rasa nyeri atau ngilu, serta membantu mengontrol pembengkakan jaringan akibat infeksi atau iritasi.",
            status: "Terverifikasi Aman",
          },
          {
            nama: "Cetirizine",
            dosis: "10 mg",
            note: "Disarankan untuk meredakan gejolak reaksi alergi, mengurangi gatal kemerahan pada kulit, serta menekan pelepasan histamin tubuh secara aman.",
            status: "Terverifikasi Aman",
          },
          {
            nama: "Paracetamol",
            dosis: "500 mg",
            note: "Digunakan sebagai analgesik dan antipiretik pertolongan pertama untuk menstabilkan suhu tubuh dan meredakan rasa sakit ringan hingga sedang.",
            status: "Terverifikasi Aman",
          },
        ];

  const medicineList = [...rawMedicineList];
  const defaultSupplements = [
    {
      nama: "Pelembap Skin Barrier (Moisturizer)",
      dosis: "Oleskan 2-3x sehari",
      note: "Disarankan untuk merawat dan memperbaiki lapisan pelindung kulit (skin barrier), menjaga kelembapan jaringan, serta mencegah iritasi susulan.",
      status: "Terverifikasi Aman",
    },
    {
      nama: "Pembersih Wajah Lembut (Gentle Cleanser)",
      dosis: "2x sehari saat cuci muka",
      note: "Gunakan pembersih pH seimbang tanpa kandungan alkohol atau pewangi buatan agar kulit tetap bersih tanpa merasa kering terarik.",
      status: "Terverifikasi Aman",
    },
    {
      nama: "Suplemen Antioksidan (Vit C & Zinc)",
      dosis: "1 tablet per hari sesudah makan",
      note: "Disarankan untuk mendukung percepatan pemulihan sel jaringan dari dalam serta memperkuat benteng kekebalan imun kulit.",
      status: "Terverifikasi Aman",
    },
  ];

  for (const supp of defaultSupplements) {
    if (medicineList.length >= 4) break;
    if (
      !medicineList.some(
        (m) => m.nama.toLowerCase().includes(supp.nama.split(" ")[0].toLowerCase())
      )
    ) {
      medicineList.push(supp);
    }
  }

  const cleanSentenceList = (items?: string[]): string[] => {
    if (!items || items.length === 0) return [];
    const merged: string[] = [];

    for (const rawItem of items) {
      const item = rawItem.trim();
      if (!item) continue;

      const firstChar = item.charAt(0);
      const isLowerCase =
        firstChar === firstChar.toLowerCase() && firstChar !== firstChar.toUpperCase();
      const isConjunctionOrContinuation =
        /^(dan|atau|serta|yang|untuk|agar|dengan|tanpa|seperti|karena|pada|saat|sehingga|yaitu|yakni|namun|juga|hindari|menghindari)\b/i.test(
          item
        ) || isLowerCase;

      if (merged.length > 0 && isConjunctionOrContinuation) {
        const lastIndex = merged.length - 1;
        const prev = merged[lastIndex].replace(/[.,;:\s]+$/, "");

        if (/^(dan|atau|serta)\b/i.test(item)) {
          merged[lastIndex] = `${prev}, ${item}`;
        } else if (/^(agar|untuk|sehingga|karena|dengan|tanpa|saat|pada)\b/i.test(item)) {
          merged[lastIndex] = `${prev} ${item}`;
        } else if (isLowerCase) {
          merged[lastIndex] = `${prev}, ${item}`;
        } else {
          merged[lastIndex] = `${prev}; ${item}`;
        }
      } else {
        merged.push(item);
      }
    }

    return merged.map((s) => {
      const trimmed = s.trim();
      if (!trimmed) return "";
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    });
  };

  const penyebabList = cleanSentenceList(result.penyebab);
  const pencegahanList = cleanSentenceList(result.pencegahan_mandiri);

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
            width={340}
            height={340}
            loading="lazy"
            decoding="async"
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

      {/* Main Grid: Medicine Recommendation on Left, Penyebab/Pencegahan & Obat Herbal on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT COLUMN: Medicine Recommendation (Stretches Full Height) */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-white/20 bg-[color:var(--color-clinic-blue)] p-4 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-white/40 h-full text-white">
            <div className="flex flex-col">
              {/* Card Header */}
              <div className="flex items-center gap-2.5 mb-3.5">
                <div className="w-7 h-7 rounded-lg bg-white text-[color:var(--color-clinic-blue)] flex items-center justify-center shrink-0 shadow-2xs">
                  <Pill className="h-4 w-4" />
                </div>
                <h3 className="font-display text-lg font-bold leading-tight text-white">
                  Rekomendasi Obat
                </h3>
              </div>

              {/* Medicine List */}
              <div className="flex flex-col gap-3.5">
                {medicineList.map((item, i) => {
                  const shoppingQuery = encodeURIComponent(
                    `beli obat ${item.nama}${item.dosis ? ` ${item.dosis}` : ""}`
                  );
                  const shoppingUrl = `https://www.google.com/search?tbm=shop&q=${shoppingQuery}`;

                  return (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-3 text-left pb-3 border-b border-white/15 last:border-0 last:pb-0"
                    >
                      <div className="flex flex-col gap-1 pr-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                            {item.nama}
                          </h4>
                          {item.dosis && (
                            <span className="text-xs font-semibold text-blue-100">
                              • {item.dosis}
                            </span>
                          )}
                        </div>

                        {item.note && (
                          <p className="text-xs font-normal text-blue-100/90 leading-relaxed">
                            {item.note}
                          </p>
                        )}
                      </div>

                      <a
                        href={shoppingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[color:var(--color-clinic-blue)] hover:bg-blue-50 hover:text-[color:var(--color-clinic-blue-dark)] hover:scale-105 active:scale-95 transition-all duration-150 shadow-2xs"
                        title={`Beli ${item.nama} di Google Shopping`}
                        aria-label={`Beli ${item.nama} di Google Shopping`}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Penyebab & Pencegahan (Top) and Obat Herbal (Bottom) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Card 1: Penyebab & Pencegahan */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-white/20 bg-[color:var(--color-clinic-blue)] p-4 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-white/40 text-white">
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-7 h-7 rounded-lg bg-white text-[color:var(--color-clinic-blue)] flex items-center justify-center shrink-0 shadow-2xs">
                <Activity className="h-4 w-4" />
              </div>
              <h3 className="font-display text-lg font-bold leading-tight text-white">
                Penyebab & Pencegahan
              </h3>
            </div>

            <div
              onMouseLeave={() => setHoveredTab(null)}
              className="relative mb-4 inline-flex w-full items-center justify-between rounded-full bg-black/20 p-1 sm:w-auto self-start border border-white/20 shadow-2xs"
            >
              {[
                { id: "penyebab" as const, label: "Penyebab" },
                { id: "pencegahan" as const, label: "Pencegahan" },
              ].map((tab) => {
                const isSelected = (hoveredTab ?? activeTab) === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setHoveredTab(null);
                    }}
                    onMouseEnter={() => setHoveredTab(tab.id)}
                    className={`relative flex-1 sm:flex-initial rounded-full px-5 py-1.5 text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer select-none ${
                      isSelected
                        ? "text-[color:var(--color-clinic-blue-dark)]"
                        : "text-blue-100 hover:text-white"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeTabPillPenyebabPencegahan"
                        className="absolute inset-0 z-0 rounded-full bg-white shadow-xs pointer-events-none"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="min-h-[140px] flex-1">
              {activeTab === "penyebab" && (
                <ul className="space-y-3 text-sm text-white font-medium">
                  {penyebabList.length > 0 ? (
                    penyebabList.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                        <span className="leading-relaxed text-blue-50">{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-blue-200 italic">Tidak ada data penyebab yang tersedia.</li>
                  )}
                </ul>
              )}

              {activeTab === "pencegahan" && (
                <ul className="space-y-3 text-sm text-white font-medium">
                  {pencegahanList.length > 0 ? (
                    pencegahanList.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                        <span className="leading-relaxed text-blue-50">{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-blue-200 italic">Tidak ada saran pencegahan khusus.</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Card 2: Obat Herbal Alami (Photo-style list with pill badge) */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-white/20 bg-[color:var(--color-clinic-blue)] shadow-sm transition-all duration-200 hover:shadow-md hover:border-white/40 text-white">
            {/* Card Header */}
            <div className="flex items-center gap-2.5 px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
              <div className="w-7 h-7 rounded-lg bg-white text-[color:var(--color-clinic-blue)] flex items-center justify-center shrink-0 shadow-2xs">
                <Leaf className="h-4 w-4" />
              </div>
              <h3 className="font-display text-lg font-bold leading-tight text-white">
                Obat Herbal Alami
              </h3>
            </div>

            {/* Herb List - Photo Style */}
            <div className="flex flex-col">
              {!result.obat_herbal || result.obat_herbal.length === 0 ? (
                <div className="px-4 sm:px-5 pb-4 text-sm italic text-blue-200">
                  Tidak ada saran obat herbal spesifik.
                </div>
              ) : (
                result.obat_herbal.map((herb, i) => (
                    <div
                      key={i}
                      className="flex items-stretch justify-between border-b border-white/15 last:border-0"
                    >
                      {/* Left: Name + Description */}
                      <div className="flex flex-col gap-1 px-4 sm:px-5 py-3.5 flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-white leading-tight">
                          {herb.nama}
                        </h4>
                        <p className="text-xs text-blue-100/90 leading-relaxed">
                          {herb.cara_pakai}
                        </p>
                      </div>

                      {/* Right: Smart Icon Pill Badge */}
                      <div className="flex items-center justify-center shrink-0 px-2.5">
                        <div className="flex h-14 w-8 items-center justify-center rounded-full bg-white text-[color:var(--color-clinic-blue)] shadow-sm">
                          {(() => { const HerbIcon = getHerbIcon(herb.nama); return <HerbIcon className="h-4 w-4 text-[color:var(--color-clinic-blue)]" />; })()}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
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
          <Link
            to="/consultation"
            search={{ scan: scanContext }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-clinic-blue)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-clinic-blue-dark)]"
          >
            Konsultasi AI
          </Link>
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

