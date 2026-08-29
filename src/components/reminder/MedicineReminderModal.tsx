import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Store,
  Building2,
  Check,
  Pill,
  ChevronRight,
  Clock,
  Tablet,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Bell,
} from "lucide-react";
import type { RecommendedMed } from "@/hooks/useLastConsultationMeds";
import { useLastConsultationMeds } from "@/hooks/useLastConsultationMeds";
import { useMedicineReminders } from "@/hooks/useMedicineReminders";
import type { MedicineReminderInsert, PurchaseLocation } from "@/lib/supabase/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = "location" | "select_meds" | "configure" | "success";

interface MedConfig {
  med: RecommendedMed;
  jumlah_tablet: number;
  dosis_per_minum: string;
  interval_jam: number;
}

const INTERVAL_OPTIONS = [
  { label: "Tiap 4 jam", value: 4 },
  { label: "Tiap 6 jam", value: 6 },
  { label: "Tiap 8 jam", value: 8 },
  { label: "Tiap 12 jam", value: 12 },
  { label: "Tiap 24 jam", value: 24 },
];

function StepIndicator({ current }: { current: Step }) {
  const steps: Step[] = ["location", "select_meds", "configure", "success"];
  const idx = steps.indexOf(current);
  return (
    <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-100">
      {["Lokasi", "Pilih Obat", "Atur Dosis"].map((label, i) => (
        <div key={label} className="flex items-center gap-1">
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
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
            className={`text-[10px] font-medium ${
              i === idx ? "text-[color:var(--color-clinic-blue)]" : "text-slate-400"
            }`}
          >
            {label}
          </span>
          {i < 2 && <ChevronRight className="h-3 w-3 text-slate-300 mx-0.5" />}
        </div>
      ))}
    </div>
  );
}

export function MedicineReminderModal({ open, onClose }: Props) {
  const { meds, loading: medsLoading } = useLastConsultationMeds();
  const { createReminder } = useMedicineReminders();

  const [step, setStep] = useState<Step>("location");
  const [location, setLocation] = useState<PurchaseLocation | null>(null);
  const [selectedMeds, setSelectedMeds] = useState<Set<string>>(new Set());
  const [configs, setConfigs] = useState<MedConfig[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep("location");
    setLocation(null);
    setSelectedMeds(new Set());
    setConfigs([]);
    setErrorMsg(null);
  }, []);

  const handleClose = () => {
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

  const handleProceedToConfig = () => {
    const chosen = meds.filter((m) => selectedMeds.has(m.nama));
    setConfigs(
      chosen.map((m) => ({
        med: m,
        jumlah_tablet: 10,
        dosis_per_minum: m.dosis || "1 tablet",
        interval_jam: 8,
      })),
    );
    setStep("configure");
  };

  const updateConfig = (idx: number, field: keyof Omit<MedConfig, "med">, value: number | string) => {
    setConfigs((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)),
    );
  };

  const handleSave = async () => {
    if (!location) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      for (const cfg of configs) {
        const waktu_mulai = new Date().toISOString();
        const totalHours = cfg.interval_jam * cfg.jumlah_tablet;
        const waktu_berakhir = new Date(Date.now() + totalHours * 3600 * 1000).toISOString();
        const payload: MedicineReminderInsert = {
          source_type: cfg.med.sourceType,
          source_id: cfg.med.sourceId,
          purchase_location: location,
          nama_obat: cfg.med.nama,
          dosis_per_minum: cfg.dosis_per_minum,
          jumlah_tablet: cfg.jumlah_tablet,
          interval_jam: cfg.interval_jam,
          waktu_mulai,
          waktu_berakhir,
          is_active: true,
          tablet_tersisa: cfg.jumlah_tablet,
          catatan: cfg.med.catatan || null,
        };
        await createReminder(payload);
      }
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
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Medicine Reminder Modal"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            {step !== "location" && step !== "success" && (
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

        {/* Step indicator */}
        {step !== "success" && <StepIndicator current={step} />}

        {/* Content */}
        <div className="overflow-y-auto flex-1">

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
                    <p className="font-semibold text-sm text-[color:var(--color-clinic-ink)]">Ke Apotek</p>
                    <p className="text-[10px] text-[color:var(--color-clinic-muted)] mt-0.5">Beli obat di apotek terdekat</p>
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
                    <p className="font-semibold text-sm text-[color:var(--color-clinic-ink)]">Ke Rumah Sakit</p>
                    <p className="text-[10px] text-[color:var(--color-clinic-muted)] mt-0.5">Ambil resep dari RS/klinik</p>
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
                Centang obat dari hasil konsultasi/scan terakhirmu.
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
                    Lakukan konsultasi atau scan AI terlebih dahulu untuk mendapatkan rekomendasi obat.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {meds.map((med) => {
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
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{med.catatan}</p>
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

          {/* ─── STEP 3: KONFIGURASI DOSIS ─── */}
          {step === "configure" && (
            <div className="px-6 py-5 flex flex-col gap-4">
              <p className="text-sm font-semibold text-[color:var(--color-clinic-ink)]">
                Atur dosis & jadwal
              </p>
              {configs.map((cfg, idx) => (
                <div key={cfg.med.nama} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="h-4 w-4 text-[color:var(--color-clinic-blue)]" />
                    <p className="font-semibold text-sm text-[color:var(--color-clinic-ink)]">{cfg.med.nama}</p>
                  </div>

                  {/* Dosis per minum */}
                  <div className="mb-3">
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[color:var(--color-clinic-muted)]">
                      <Pill className="h-3.5 w-3.5" />
                      Dosis per minum
                    </label>
                    <input
                      id={`config-dosis-${idx}`}
                      type="text"
                      value={cfg.dosis_per_minum}
                      onChange={(e) => updateConfig(idx, "dosis_per_minum", e.target.value)}
                      placeholder="contoh: 500mg / 1 tablet"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[color:var(--color-clinic-blue)] transition"
                    />
                  </div>

                  {/* Jumlah tablet */}
                  <div className="mb-3">
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[color:var(--color-clinic-muted)]">
                      <Tablet className="h-3.5 w-3.5" />
                      Jumlah tablet yang dibeli
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateConfig(idx, "jumlah_tablet", Math.max(1, cfg.jumlah_tablet - 1))}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-[color:var(--color-clinic-ink)] hover:bg-slate-50 text-lg font-bold"
                      >
                        −
                      </button>
                      <input
                        id={`config-tablet-${idx}`}
                        type="number"
                        min={1}
                        value={cfg.jumlah_tablet}
                        onChange={(e) => updateConfig(idx, "jumlah_tablet", Math.max(1, Number(e.target.value)))}
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

                  {/* Interval */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[color:var(--color-clinic-muted)]">
                      <Clock className="h-3.5 w-3.5" />
                      Ingatkan setiap
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {INTERVAL_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          id={`config-interval-${idx}-${opt.value}`}
                          onClick={() => updateConfig(idx, "interval_jam", opt.value)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                            cfg.interval_jam === opt.value
                              ? "bg-[color:var(--color-clinic-blue)] text-white shadow-sm"
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
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
            <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <p className="text-lg font-bold text-[color:var(--color-clinic-ink)]">
                  Pengingat Aktif! 🎉
                </p>
                <p className="mt-1 text-sm text-[color:var(--color-clinic-muted)]">
                  {configs.length} obat berhasil dijadwalkan. Browser akan mengingatkanmu sesuai jadwal.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full mt-2">
                <a
                  href="/reminders"
                  id="reminder-go-to-page"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--color-clinic-blue)] py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-clinic-blue-dark)]"
                >
                  <Bell className="h-4 w-4" />
                  Lihat Semua Reminder
                </a>
                <button
                  onClick={handleClose}
                  className="w-full rounded-xl border border-slate-200 py-2.5 text-sm text-slate-500 hover:bg-slate-50 transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer action */}
        {step === "select_meds" && meds.length > 0 && (
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
                <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
              ) : (
                <><Bell className="h-4 w-4" /> Aktifkan Pengingat</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
