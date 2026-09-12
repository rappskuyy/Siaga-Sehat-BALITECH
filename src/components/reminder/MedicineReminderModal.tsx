import { useState, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Store,
  Building2,
  Check,
  Pill,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Tablet,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Bell,
  Lock,
} from "lucide-react";
import type { RecommendedMed } from "@/hooks/useLastConsultationMeds";
import { useLastConsultationMeds } from "@/hooks/useLastConsultationMeds";
import { useMedicineReminders, notifyRemindersUpdated } from "@/hooks/useMedicineReminders";
import type { MedicineReminderInsert, PurchaseLocation } from "@/lib/supabase/types";
import {
  DOSIS_FREQUENCY_OPTIONS,
  intervalForDosis,
  type DosisFrequency,
} from "@/lib/reminders/scheduling";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialDisease?: string | null;
}

type Step = "location" | "select_meds" | "configure" | "success";

interface MedConfig {
  med: RecommendedMed;
  jumlah_tablet: number;
  dosis_per_minum: string;
  dosis_per_hari: DosisFrequency;
}

function StepIndicator({ current }: { current: Step }) {
  const steps: Step[] = ["location", "select_meds", "configure", "success"];
  const idx = steps.indexOf(current);
  return (
    <div className="flex items-center justify-between gap-1 px-4 sm:px-6 py-3 border-b border-slate-100 overflow-x-auto scrollbar-none min-w-0">
      {["Lokasi", "Pilih Obat", "Atur Dosis"].map((label, i) => (
        <div key={label} className="flex items-center gap-1 shrink-0 whitespace-nowrap">
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all shrink-0 ${
              i < idx
                ? "bg-emerald-500 text-white"
                : i === idx
                  ? "bg-[color:var(--color-clinic-blue)] text-white"
                  : "bg-slate-100 text-slate-400"
            }`}
          >
            {i < idx ? <Check className="h-2.5 w-2.5" /> : i + 1}
          </div>
          <span
            className={`text-[10px] sm:text-xs font-medium ${
              i === idx ? "text-[color:var(--color-clinic-blue)] font-bold" : "text-slate-400"
            }`}
          >
            {label}
          </span>
          {i < 2 && <ChevronRight className="h-3 w-3 text-slate-300 mx-0.5 shrink-0" />}
        </div>
      ))}
    </div>
  );
}

export function MedicineReminderModal({ open, onClose, onSuccess, initialDisease }: Props) {
  const { meds, loading: medsLoading } = useLastConsultationMeds();
  const { reminders, createReminder } = useMedicineReminders();

  const [step, setStep] = useState<Step>("location");
  const [location, setLocation] = useState<PurchaseLocation | null>(null);
  const [selectedMeds, setSelectedMeds] = useState<Set<string>>(new Set());
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
  const [showAllDiseases, setShowAllDiseases] = useState(false);
  const [configs, setConfigs] = useState<MedConfig[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (initialDisease) {
        setSelectedDisease(initialDisease);
      }
    } else {
      setShowAllDiseases(false);
    }
  }, [open, initialDisease]);

  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  const reset = useCallback(() => {
    setStep("location");
    setLocation(null);
    setSelectedMeds(new Set());
    setSelectedDisease(null);
    setShowAllDiseases(false);
    setConfigs([]);
    setErrorMsg(null);
  }, []);

  const handleClose = () => {
    notifyRemindersUpdated();
    if (step === "success") {
      onSuccess?.();
    }
    reset();
    onClose();
  };

  const handleLocationSelect = (loc: PurchaseLocation) => {
    setLocation(loc);
    setStep("select_meds");
  };

  const toggleMed = (nama: string) => {
    setSelectedMeds((prev) => {
      const next = new Set(prev);
      if (next.has(nama)) next.delete(nama);
      else next.add(nama);
      return next;
    });
  };

  const normalizeDisease = (value: string) =>
    value.trim().replace(/[.,;:!?]+$/, "").toLocaleLowerCase("id-ID");

  const usedDiseases = new Set(
    reminders
      .map((reminder) => {
        const match = reminder.catatan?.match(/Untuk kondisi:\s*(.+?)(?:\.|\n|$)/i);
        return match?.[1] ? normalizeDisease(match[1]) : null;
      })
      .filter((disease): disease is string => Boolean(disease)),
  );
  const usedSourceIds = new Set(
    reminders.map((reminder) => reminder.source_id).filter((sourceId): sourceId is string => Boolean(sourceId)),
  );
  const hasUsedDisease = (disease: string) =>
    usedDiseases.has(normalizeDisease(disease)) ||
    meds.some(
      (med) =>
        normalizeDisease(med.penyakit) === normalizeDisease(disease) &&
        Boolean(med.sourceId) &&
        usedSourceIds.has(med.sourceId),
    );

  const diseases = Array.from(
    meds
      .filter((med) => Boolean(med.penyakit?.trim()) && !hasUsedDisease(med.penyakit))
      .reduce((map, med) => {
        const norm = normalizeDisease(med.penyakit);
        if (norm && !map.has(norm)) {
          map.set(norm, med.penyakit.trim());
        }
        return map;
      }, new Map<string, string>())
      .values(),
  );

  const visibleDiseases = useMemo(() => {
    if (showAllDiseases || diseases.length <= 4) return diseases;
    const base = diseases.slice(0, 4);
    if (
      selectedDisease &&
      !base.some((d) => normalizeDisease(d) === normalizeDisease(selectedDisease))
    ) {
      const found = diseases.find(
        (d) => normalizeDisease(d) === normalizeDisease(selectedDisease),
      );
      if (found) return [...base, found];
    }
    return base;
  }, [diseases, showAllDiseases, selectedDisease]);

  const diseaseMeds = selectedDisease
    ? meds.filter((med) => normalizeDisease(med.penyakit) === normalizeDisease(selectedDisease))
    : [];

  const handleProceedToConfig = () => {
    const chosen = meds.filter(
      (m) =>
        selectedMeds.has(m.nama) &&
        (!selectedDisease || normalizeDisease(m.penyakit) === normalizeDisease(selectedDisease)),
    );
    setConfigs(
      chosen.map((m) => ({
        med: m,
        jumlah_tablet: 10,
        dosis_per_minum: m.dosis || "1 tablet",
        dosis_per_hari: 3,
      })),
    );
    setStep("configure");
  };

  const updateConfig = (
    idx: number,
    field: keyof Omit<MedConfig, "med">,
    value: number | string,
  ) => {
    setConfigs((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  };

  const handleSave = async () => {
    if (!location) return;
    if (selectedDisease && hasUsedDisease(selectedDisease)) {
      setErrorMsg("Penyakit ini sudah memiliki reminder. Pilih penyakit lain.");
      setStep("select_meds");
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    try {
      for (const cfg of configs) {
        const interval_jam = intervalForDosis(cfg.dosis_per_hari);
        const waktu_mulai = new Date().toISOString();
        const totalHours = interval_jam * cfg.jumlah_tablet;
        const waktu_berakhir = new Date(Date.now() + totalHours * 3600 * 1000).toISOString();
        const payload: MedicineReminderInsert = {
          source_type: cfg.med.sourceType,
          source_id: cfg.med.sourceId,
          purchase_location: location,
          nama_obat: cfg.med.nama,
          dosis_per_minum: cfg.dosis_per_minum,
          jumlah_tablet: cfg.jumlah_tablet,
          interval_jam,
          waktu_mulai,
          waktu_berakhir,
          is_active: true,
          tablet_tersisa: cfg.jumlah_tablet,
          catatan: [`Untuk kondisi: ${cfg.med.penyakit}`, cfg.med.catatan]
            .filter(Boolean)
            .join(". ") || null,
        };
        const created = await createReminder(payload);
        if (!created) {
          throw new Error("Reminder gagal disimpan");
        }
      }
      notifyRemindersUpdated();
      onSuccess?.();
      setStep("success");
    } catch {
      setErrorMsg("Terjadi kesalahan saat menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  // Guard: jangan render di server (SSR)
  if (typeof document === "undefined") return null;
  if (!open) return null;

  return createPortal(
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[9999] flex items-end justify-center overscroll-none sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Medicine Reminder Modal"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Panel */}
      <div data-lenis-prevent className="relative z-10 flex min-h-0 w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-[#f8fafc] shadow-2xl sm:max-h-[90vh] sm:rounded-[28px] max-h-[92dvh]">
        {/* Header */}
        {step === "success" ? (
          <div className="relative overflow-hidden bg-[#17324d] px-6 pb-6 pt-6 sm:px-8">
            <button
              onClick={handleClose}
              className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative z-10 flex max-w-[calc(100%-3rem)] items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#35d399] text-[#123049] shadow-[0_8px_20px_rgba(53,211,153,0.22)]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ee6c5]">
                  Jadwal tersimpan
                </p>
                <p className="mt-1 font-display text-xl font-extrabold tracking-tight text-white">
                  Pengingat obat aktif
                </p>
                <p className="mt-1 text-xs leading-relaxed text-white/65">
                  Pengingat akan berjalan selama halaman browser tetap terbuka.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div className="flex items-center gap-2">
              {step !== "location" && (
                <button
                  onClick={() => setStep(step === "configure" ? "select_meds" : "location")}
                  className="mr-1 grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                  aria-label="Kembali"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
              )}
              <div className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[color:var(--color-clinic-ink)]">
                  Pengingat Obat
                </p>
                <p className="text-[10px] text-[color:var(--color-clinic-muted)]">
                  Setup jadwal minum obat
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step indicator */}
        {step !== "success" && <StepIndicator current={step} />}

        {/* Content */}
        <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y">
          {/* ─── STEP 1: PILIH LOKASI ─── */}
          {step === "location" && (
            <div className="px-6 py-6">
              <p className="text-sm font-semibold text-[color:var(--color-clinic-ink)] mb-1">
                Kamu sudah ke mana?
              </p>
              <p className="text-xs text-[color:var(--color-clinic-muted)] mb-5">
                Pilih lokasi tempat kamu membeli obat berdasarkan rekomendasi konsultasi/scan.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="reminder-location-apotek"
                  onClick={() => handleLocationSelect("apotek")}
                  className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent bg-[color:var(--color-clinic-blue-soft)] p-5 text-center transition hover:border-[color:var(--color-clinic-blue)] hover:bg-white active:scale-95"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[color:var(--color-clinic-blue)] shadow-sm group-hover:shadow-md transition">
                    <Store className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-[color:var(--color-clinic-ink)]">
                      Ke Apotek
                    </p>
                    <p className="text-[10px] text-[color:var(--color-clinic-muted)] mt-0.5">
                      Beli obat di apotek terdekat
                    </p>
                  </div>
                </button>
                <button
                  id="reminder-location-rs"
                  onClick={() => handleLocationSelect("rs")}
                  className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent bg-[color:var(--color-clinic-blue-soft)] p-5 text-center transition hover:border-[color:var(--color-clinic-blue)] hover:bg-white active:scale-95"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[color:var(--color-clinic-blue)] shadow-sm group-hover:shadow-md transition">
                    <Building2 className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-[color:var(--color-clinic-ink)]">
                      Ke Rumah Sakit
                    </p>
                    <p className="text-[10px] text-[color:var(--color-clinic-muted)] mt-0.5">
                      Ambil resep dari RS/klinik
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 2: PILIH OBAT ─── */}
          {step === "select_meds" && (
            <div className="px-6 py-5">
              <p className="text-sm font-semibold text-[color:var(--color-clinic-ink)] mb-1">
                Obat apa yang dibeli?
              </p>
              <p className="text-xs text-[color:var(--color-clinic-muted)] mb-4">
                Pilih penyakit dari riwayat scan, lalu centang obat yang ingin diingatkan.
              </p>

              {medsLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-[color:var(--color-clinic-muted)]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat daftar obat...
                </div>
              ) : meds.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-amber-50 p-5 text-center">
                  <AlertCircle className="h-8 w-8 text-amber-400" />
                  <p className="text-sm font-semibold text-amber-700">Belum ada data obat</p>
                  <p className="text-xs text-amber-600">
                    Lakukan konsultasi atau scan AI terlebih dahulu untuk mendapatkan rekomendasi
                    obat.
                  </p>
                </div>
              ) : diseases.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-emerald-50 p-5 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  <p className="text-sm font-semibold text-emerald-700">
                    Semua penyakit sudah memiliki reminder
                  </p>
                  <p className="text-xs text-emerald-600">
                    Satu penyakit hanya dapat dibuatkan satu reminder.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-clinic-muted)]">
                        Penyakit dari riwayat terbaru
                      </p>
                      {diseases.length > 4 && (
                        <button
                          type="button"
                          onClick={() => setShowAllDiseases((prev) => !prev)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[color:var(--color-clinic-blue)] hover:underline"
                        >
                          {showAllDiseases ? (
                            <>
                              <span>Tampilkan lebih sedikit</span>
                              <ChevronUp className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              <span>Lihat Semua ({diseases.length})</span>
                              <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {visibleDiseases.map((disease) => {
                      const isSelected =
                        selectedDisease != null &&
                        normalizeDisease(selectedDisease) === normalizeDisease(disease);
                      const medCount = meds.filter(
                        (med) => normalizeDisease(med.penyakit) === normalizeDisease(disease),
                      ).length;

                      return (
                        <button
                          key={disease}
                          type="button"
                          onClick={() => {
                            setSelectedDisease(disease);
                            setSelectedMeds(new Set());
                          }}
                          className={`flex items-center justify-between rounded-xl border-2 p-3 text-left transition ${
                            isSelected
                              ? "border-[color:var(--color-clinic-blue)] bg-[color:var(--color-clinic-blue-soft)]"
                              : "border-slate-100 bg-white hover:border-slate-200"
                          }`}
                        >
                          <span className="min-w-0 pr-2 text-sm font-semibold text-[color:var(--color-clinic-ink)]">
                            {disease}
                          </span>
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                            {medCount} obat
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedDisease && (
                    <div className="flex flex-col gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-clinic-muted)]">
                        Obat untuk {selectedDisease}
                      </p>
                      {diseaseMeds.map((med) => {
                    const checked = selectedMeds.has(med.nama);
                    return (
                      <button
                        key={med.nama}
                        id={`reminder-med-${med.nama.replace(/\s/g, "-")}`}
                        onClick={() => toggleMed(med.nama)}
                        className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition ${
                          checked
                            ? "border-[color:var(--color-clinic-blue)] bg-[color:var(--color-clinic-blue-soft)]"
                            : "border-slate-100 bg-white hover:border-slate-200"
                        }`}
                      >
                        <div
                          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition ${
                            checked
                              ? "border-[color:var(--color-clinic-blue)] bg-[color:var(--color-clinic-blue)] text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {checked && <Check className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[color:var(--color-clinic-ink)]">
                            {med.nama}
                          </p>
                          {med.dosis && (
                            <p className="text-xs text-[color:var(--color-clinic-muted)] mt-0.5 truncate">
                              Dosis: {med.dosis}
                            </p>
                          )}
                          {med.catatan && (
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                              {med.catatan}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-medium text-slate-400 border border-slate-100 uppercase">
                          {med.sourceType === "scan" ? "Scan" : "Konsultasi"}
                        </span>
                      </button>
                    );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 3: KONFIGURASI DOSIS ─── */}
          {step === "configure" && (
            <div className="px-6 py-5 flex flex-col gap-4">
              <p className="text-sm font-semibold text-[color:var(--color-clinic-ink)]">
                Atur dosis & jadwal
              </p>
              {configs.map((cfg, idx) => (
                <div
                  key={cfg.med.nama}
                  className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="h-4 w-4 text-[color:var(--color-clinic-blue)]" />
                    <p className="font-semibold text-sm text-[color:var(--color-clinic-ink)]">
                      {cfg.med.nama}
                    </p>
                  </div>

                  {/* Jumlah tablet */}
                  <div className="mb-3">
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[color:var(--color-clinic-muted)]">
                      <Tablet className="h-3.5 w-3.5" />
                      Jumlah tablet yang dibeli
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateConfig(idx, "jumlah_tablet", Math.max(1, cfg.jumlah_tablet - 1))
                        }
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-[color:var(--color-clinic-ink)] hover:bg-slate-50 text-lg font-bold"
                      >
                        −
                      </button>
                      <input
                        id={`config-tablet-${idx}`}
                        type="number"
                        min={1}
                        value={cfg.jumlah_tablet}
                        onChange={(e) =>
                          updateConfig(idx, "jumlah_tablet", Math.max(1, Number(e.target.value)))
                        }
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold outline-none focus:border-[color:var(--color-clinic-blue)] transition"
                      />
                      <button
                        onClick={() => updateConfig(idx, "jumlah_tablet", cfg.jumlah_tablet + 1)}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-[color:var(--color-clinic-ink)] hover:bg-slate-50 text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Dosis per hari — drives the reminder schedule automatically */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[color:var(--color-clinic-muted)]">
                      <Clock className="h-3.5 w-3.5" />
                      Berapa kali sehari?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {DOSIS_FREQUENCY_OPTIONS.map((opt) => {
                        const selected = cfg.dosis_per_hari === opt.value;
                        return (
                          <button
                            key={opt.value}
                            id={`config-dosis-hari-${idx}-${opt.value}`}
                            onClick={() => updateConfig(idx, "dosis_per_hari", opt.value)}
                            className={`relative flex flex-col items-center gap-0.5 rounded-xl border-2 py-2.5 transition ${
                              selected
                                ? "border-[color:var(--color-clinic-blue)] bg-[color:var(--color-clinic-blue-soft)]"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            {selected && (
                              <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-[color:var(--color-clinic-blue)] text-white shadow-sm">
                                <Check className="h-2.5 w-2.5" />
                              </span>
                            )}
                            <span
                              className={`font-display text-base font-extrabold ${
                                selected
                                  ? "text-[color:var(--color-clinic-blue)]"
                                  : "text-[color:var(--color-clinic-ink)]"
                              }`}
                            >
                              {opt.value}x
                            </span>
                            <span className="text-[9px] text-[color:var(--color-clinic-muted)]">
                              /{opt.intervalJam} jam
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Auto-derived schedule, shown as locked/read-only info */}
                    <div className="mt-2 flex items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-2 text-[11px] text-slate-500">
                      <Lock className="h-3 w-3 shrink-0" />
                      <span>
                        Pengingat otomatis diatur{" "}
                        <strong className="text-[color:var(--color-clinic-ink)]">
                          setiap {intervalForDosis(cfg.dosis_per_hari)} jam
                        </strong>, mengikuti dosis di atas.
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {errorMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {errorMsg}
                </div>
              )}
            </div>
          )}

          {/* ─── SUCCESS ─── */}
          {step === "success" && (
            <div className="flex flex-col px-5 pb-6 pt-6 sm:px-8">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                  <p className="font-display text-xl font-extrabold text-[color:var(--color-clinic-ink)]">
                    {configs.length}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-[color:var(--color-clinic-muted)]">
                    Obat aktif
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                  <p className="font-display text-xl font-extrabold text-[color:var(--color-clinic-ink)]">
                    {configs[0]?.dosis_per_hari ?? 0}x
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-[color:var(--color-clinic-muted)]">
                    Per hari
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                  <p className="font-display text-xl font-extrabold text-[#099268]">Aktif</p>
                  <p className="mt-0.5 text-[10px] font-medium text-[color:var(--color-clinic-muted)]">
                    Status jadwal
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-clinic-blue)]">
                    Rencana terapi
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[color:var(--color-clinic-ink)]">
                    Yang perlu kamu minum
                  </h2>
                </div>
                <Pill className="mb-1 h-5 w-5 text-[color:var(--color-clinic-blue)]" />
              </div>

              {/* Scheduled meds summary */}
              {configs.length > 0 && (
                <div className="mt-4 flex w-full flex-col gap-2 text-left">
                  {configs.map((cfg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_4px_14px_rgba(23,50,77,0.04)]"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f7f2] text-[#099268]">
                        <Bell className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[color:var(--color-clinic-ink)]">
                          {cfg.med.nama}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[color:var(--color-clinic-muted)]">
                          {cfg.dosis_per_minum} · setiap {intervalForDosis(cfg.dosis_per_hari)} jam
                        </p>
                        <p className="mt-1 truncate text-[10px] font-medium text-[color:var(--color-clinic-blue)]">
                          Untuk kondisi: {cfg.med.penyakit}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#e8f7f2] px-2 py-1 text-[9px] font-bold text-[#087f5b]">
                        Aktif
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex w-full flex-col gap-2.5">
                <a
                  href="/reminders"
                  id="reminder-go-to-page"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--color-clinic-blue)] py-3.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(57,105,166,0.22)] transition hover:bg-[color:var(--color-clinic-blue-dark)] active:scale-[0.98]"
                >
                  <Bell className="h-4 w-4" />
                  Buka jadwal pengingat
                </a>
                <button
                  onClick={handleClose}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-[color:var(--color-clinic-muted)] transition hover:border-slate-300 hover:text-[color:var(--color-clinic-ink)]"
                >
                  Selesai
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer action */}
        {step === "select_meds" && selectedDisease && diseaseMeds.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-4">
            <button
              id="reminder-next-to-config"
              onClick={handleProceedToConfig}
              disabled={selectedMeds.size === 0}
              className="w-full rounded-xl bg-[color:var(--color-clinic-blue)] py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-clinic-blue-dark)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              Lanjut ({selectedMeds.size} obat dipilih)
            </button>
          </div>
        )}

        {step === "configure" && (
          <div className="border-t border-slate-100 px-6 py-4">
            <button
              id="reminder-save"
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[color:var(--color-clinic-blue)] py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-clinic-blue-dark)] disabled:opacity-60 active:scale-95"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" /> Aktifkan Pengingat
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
