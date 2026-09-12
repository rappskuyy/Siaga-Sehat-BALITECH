import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  Pill,
  Plus,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useMedicineReminders } from "@/hooks/useMedicineReminders";
import { useLastConsultationMeds } from "@/hooks/useLastConsultationMeds";
import { ReminderCard } from "@/components/reminder/ReminderCard";
import { MedicineReminderModal } from "@/components/reminder/MedicineReminderModal";
import { ReminderNotificationManager } from "@/components/reminder/ReminderNotificationManager";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/clinic/Footer";

interface RemindersSearch {
  scan?: string;
  penyakit?: string;
}

function getScanFilter(value: string | undefined, fallbackDisease?: string) {
  if (!value) return { id: undefined, disease: fallbackDisease };

  try {
    const parsed = JSON.parse(value) as { namaPenyakit?: unknown };
    if (typeof parsed.namaPenyakit === "string" && parsed.namaPenyakit.trim()) {
      return { id: undefined, disease: parsed.namaPenyakit };
    }
  } catch {
    // Profile links use a scan history id; scanner links may contain a result payload.
  }

  return { id: value, disease: fallbackDisease };
}

function reminderDisease(reminder: { catatan: string | null }) {
  if (!reminder.catatan) return undefined;
  const match = reminder.catatan.match(/Untuk kondisi:\s*(.+?)(?:\.|\n|$)/i);
  return match?.[1]?.trim();
}

const normalizeDisease = (value: string) =>
  value.trim().replace(/[.,;:!?]+$/, "").toLocaleLowerCase("id-ID");

export const Route = createFileRoute("/reminders")({
  validateSearch: (search: Record<string, unknown>): RemindersSearch => ({
    scan: typeof search.scan === "string" ? search.scan : undefined,
    penyakit: typeof search.penyakit === "string" ? search.penyakit : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Notifikasi & Pengingat Obat | Siaga Sehat" },
      {
        name: "description",
        content:
          "Kelola notifikasi dan jadwal pengingat minum obat kamu di SiagaSehat. Berdasarkan rekomendasi dokter AI dari konsultasi dan scan kesehatan.",
      },
    ],
  }),
  component: RemindersPage,
});

function RemindersPage() {
  const { user } = useAuth();
  const { scan: scanFilter, penyakit } = Route.useSearch();
  const navigate = useNavigate();
  const {
    activeReminders,
    inactiveReminders,
    loading,
    fetchReminders,
    markTaken,
    deactivateReminder,
    logs,
  } = useMedicineReminders();
  const {
    meds: recommendedMeds,
    loading: recommendedMedsLoading,
    refetch: refetchRecommendedMeds,
  } = useLastConsultationMeds();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDiseaseForModal, setSelectedDiseaseForModal] = useState<string | null>(null);
  const [showAllPending, setShowAllPending] = useState(false);
  const [showAllReminders, setShowAllReminders] = useState(false);
  const [tab, setTab] = useState<"active" | "history">("active");

  const clearFilter = () => navigate({ to: "/reminders", search: {} });
  const scanSelection = getScanFilter(scanFilter, penyakit);

  const filteredActive = useMemo(
    () =>
      scanFilter
        ? activeReminders.filter(
            (r) =>
              (scanSelection.id && r.source_id === scanSelection.id) ||
              (scanSelection.disease &&
                normalizeDisease(reminderDisease(r) || "") ===
                  normalizeDisease(scanSelection.disease)),
          )
        : activeReminders,
    [activeReminders, scanFilter, scanSelection.id, scanSelection.disease],
  );
  const filteredInactive = useMemo(
    () =>
      scanFilter
        ? inactiveReminders.filter(
            (r) =>
              (scanSelection.id && r.source_id === scanSelection.id) ||
              (scanSelection.disease &&
                normalizeDisease(reminderDisease(r) || "") ===
                  normalizeDisease(scanSelection.disease)),
          )
        : inactiveReminders,
    [inactiveReminders, scanFilter, scanSelection.id, scanSelection.disease],
  );

  const lowStockCount = activeReminders.filter(
    (r) => r.tablet_tersisa != null && r.tablet_tersisa <= 3 && r.tablet_tersisa > 0,
  ).length;

  const usedDiseases = new Set(
    activeReminders
      .concat(inactiveReminders)
      .map(reminderDisease)
      .filter((disease): disease is string => Boolean(disease))
      .map(normalizeDisease),
  );
  const usedSourceIds = new Set(
    activeReminders
      .concat(inactiveReminders)
      .map((r) => r.source_id)
      .filter((id): id is string => Boolean(id)),
  );
  const pendingDiseases = Array.from(
    recommendedMeds
      .filter(
        (med) =>
          Boolean(med.penyakit?.trim()) &&
          !usedDiseases.has(normalizeDisease(med.penyakit)) &&
          (!med.sourceId || !usedSourceIds.has(med.sourceId)),
      )
      .reduce((map, med) => {
        const norm = normalizeDisease(med.penyakit);
        if (norm && !map.has(norm)) {
          map.set(norm, med.penyakit.trim());
        }
        return map;
      }, new Map<string, string>())
      .values(),
  );

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] font-sans">
        <SiteHeader />
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
            <BellOff className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-[color:var(--color-clinic-ink)]">
            Login Diperlukan
          </h1>
          <p className="max-w-xs text-sm text-[color:var(--color-clinic-muted)]">
            Notifikasi dan Pengingat Obat hanya tersedia untuk pengguna yang sudah login.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--color-clinic-blue-dark)] transition"
          >
            Masuk Sekarang
          </Link>
        </div>
      </main>
    );
  }

  const activeList = tab === "active" ? filteredActive : filteredInactive;

  return (
    <main className="min-h-screen bg-[#f7f4ee] pb-16 font-sans">
      <ReminderNotificationManager activeReminders={activeReminders} />
      <SiteHeader />

      {/* Page hero */}
      <div className="px-5 pt-6 sm:px-6 md:px-8 lg:px-10">
        <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#3b5e8c] via-[color:var(--color-clinic-blue)] to-[#2f4b73] px-6 py-6 shadow-md sm:px-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              background:
                "radial-gradient(75% 100% at 85% 15%, rgba(147, 197, 253, 0.45), transparent 70%), radial-gradient(50% 80% at 15% 90%, rgba(99, 102, 241, 0.2), transparent 60%)",
            }}
          />
          <div className="relative z-10 flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur">
              <Bell className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-white">Notifikasi</p>
              <p className="text-xs text-white/75">
                Pengingat minum obat, otomatis dan tepat waktu
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="relative z-10 mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/12 px-3 py-2.5 text-center backdrop-blur">
              <p className="font-display text-lg font-extrabold text-white">
                {activeReminders.length}
              </p>
              <p className="text-[10px] leading-tight text-white/70">Pengingat aktif</p>
            </div>
            <div className="rounded-2xl bg-white/12 px-3 py-2.5 text-center backdrop-blur">
              <p className="font-display text-lg font-extrabold text-white">{lowStockCount}</p>
              <p className="text-[10px] leading-tight text-white/70">Stok menipis</p>
            </div>
            <div className="rounded-2xl bg-white/12 px-3 py-2.5 text-center backdrop-blur">
              <p className="font-display text-lg font-extrabold text-white">
                {inactiveReminders.length}
              </p>
              <p className="text-[10px] leading-tight text-white/70">Riwayat selesai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto mt-6 w-full max-w-3xl px-5 sm:px-6 md:px-8 lg:px-10">
        {/* Scan-origin filter banner */}
        {scanFilter && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--color-clinic-blue)]/20 bg-[color:var(--color-clinic-blue-soft)] px-4 py-3">
            <p className="text-xs text-[color:var(--color-clinic-blue-dark)]">
              Menampilkan notifikasi terkait{" "}
              <span className="font-bold">{penyakit || "hasil scan ini"}</span>
            </p>
            <button
              onClick={clearFilter}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[color:var(--color-clinic-blue)] shadow-xs hover:bg-white/80"
            >
              <X className="h-3 w-3" /> Lihat semua
            </button>
          </div>
        )}

        {lowStockCount > 0 && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>{lowStockCount}</strong> obat kamu tinggal sedikit, segera beli lagi supaya
              jadwal minum obat tidak terputus.
            </span>
          </div>
        )}

        {!recommendedMedsLoading && pendingDiseases.length > 0 && (
          <section className="mb-5 rounded-2xl border border-[color:var(--color-clinic-blue)]/15 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-clinic-blue)]">
                  Rekomendasi belum dijadwalkan
                </p>
                <h2 className="mt-1 font-display text-base font-bold text-[color:var(--color-clinic-ink)]">
                  Tambahkan pengingat penyakit
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-[color:var(--color-clinic-muted)]">
                  Ada {pendingDiseases.length} hasil pemeriksaan yang belum memiliki pengingat obat.
                </p>
              </div>
              <Pill className="mt-1 h-5 w-5 shrink-0 text-[color:var(--color-clinic-blue)]" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {(showAllPending ? pendingDiseases : pendingDiseases.slice(0, 4)).map((disease) => (
                <button
                  key={disease}
                  type="button"
                  onClick={() => {
                    setSelectedDiseaseForModal(disease);
                    setModalOpen(true);
                  }}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[color:var(--color-clinic-blue)]/20 bg-[color:var(--color-clinic-blue-soft)] px-3 py-1.5 text-left text-xs font-semibold text-[color:var(--color-clinic-blue-dark)] transition hover:border-[color:var(--color-clinic-blue)]/50 hover:bg-[color:var(--color-clinic-blue)]/10"
                >
                  <Plus className="h-3 w-3 shrink-0" />
                  <span className="truncate">{disease}</span>
                </button>
              ))}

              {pendingDiseases.length > 4 && (
                <button
                  type="button"
                  onClick={() => setShowAllPending((prev) => !prev)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-[color:var(--color-clinic-muted)] transition hover:border-slate-300 hover:bg-slate-100 hover:text-[color:var(--color-clinic-ink)]"
                >
                  {showAllPending ? (
                    <>
                      <span>Sembunyikan</span>
                      <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      <span>Lihat Semua (+{pendingDiseases.length - 4})</span>
                      <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          </section>
        )}

        {/* Add reminder CTA */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-[color:var(--color-clinic-ink)]">
              Jadwal Minum Obat
            </h2>
            <p className="text-xs text-[color:var(--color-clinic-muted)] mt-0.5">
              {activeReminders.length > 0
                ? `${activeReminders.length} pengingat aktif`
                : "Belum ada pengingat aktif"}
            </p>
          </div>
          <button
            id="reminders-add-btn"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue)] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[color:var(--color-clinic-blue-dark)] hover:scale-105 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah
          </button>
        </div>

        {/* Tab switcher */}
        <div className="mb-4 flex gap-1 rounded-xl bg-white p-1 shadow-sm">
          <button
            id="reminders-tab-active"
            onClick={() => setTab("active")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              tab === "active"
                ? "bg-[color:var(--color-clinic-blue)] text-white shadow-sm"
                : "text-[color:var(--color-clinic-muted)] hover:bg-slate-50"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Aktif
            {filteredActive.length > 0 && (
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                  tab === "active"
                    ? "bg-white/30 text-white"
                    : "bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]"
                }`}
              >
                {filteredActive.length}
              </span>
            )}
          </button>
          <button
            id="reminders-tab-history"
            onClick={() => setTab("history")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              tab === "history"
                ? "bg-[color:var(--color-clinic-blue)] text-white shadow-sm"
                : "text-[color:var(--color-clinic-muted)] hover:bg-slate-50"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            Riwayat
            {filteredInactive.length > 0 && (
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                  tab === "history" ? "bg-white/30 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {filteredInactive.length}
              </span>
            )}
          </button>
        </div>

        {/* Reminders list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        ) : activeList.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-white py-12 text-center shadow-sm">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
              {tab === "active" ? <Pill className="h-7 w-7" /> : <History className="h-7 w-7" />}
            </div>
            <div>
              <p className="font-semibold text-[color:var(--color-clinic-ink)]">
                {tab === "active" ? "Belum ada pengingat aktif" : "Belum ada riwayat pengingat"}
              </p>
              {tab === "active" && (
                <p className="mt-1 text-sm text-[color:var(--color-clinic-muted)] max-w-xs mx-auto">
                  Setelah konsultasi atau scan AI, tambahkan pengingat obat untuk jadwal minum yang
                  teratur.
                </p>
              )}
            </div>
            {tab === "active" && (
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-clinic-blue-dark)]"
              >
                <Plus className="h-4 w-4" />
                Tambah Pengingat
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {(showAllReminders ? activeList : activeList.slice(0, 3)).map((r) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                logs={logs}
                onMarkTaken={tab === "active" ? (id) => markTaken(id, false) : () => {}}
                onSkip={tab === "active" ? (id) => markTaken(id, true) : () => {}}
                onDeactivate={tab === "active" ? deactivateReminder : () => {}}
              />
            ))}

            {activeList.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllReminders((prev) => !prev)}
                className="mt-1 flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white py-3 text-xs font-semibold text-[color:var(--color-clinic-blue)] shadow-xs transition hover:border-[color:var(--color-clinic-blue)]/30 hover:bg-[color:var(--color-clinic-blue-soft)]/50 active:scale-[0.99]"
              >
                {showAllReminders ? (
                  <>
                    <span>Tampilkan Lebih Sedikit</span>
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>
                      Lihat Semua ({activeList.length}{" "}
                      {tab === "active" ? "Pengingat Aktif" : "Riwayat Selesai"})
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Tip card */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          <p className="text-xs leading-relaxed text-[color:var(--color-clinic-muted)]">
            <strong className="text-[color:var(--color-clinic-ink)]">Tips:</strong> Notifikasi
            pengingat muncul selama halaman browser terbuka. Pastikan kamu mengizinkan notifikasi
            dari browser saat diminta untuk pengalaman terbaik. Ikon lonceng di riwayat scan
            profilmu akan membawamu langsung ke sini.
          </p>
        </div>
      </div>

      {/* Add reminder modal */}
      <MedicineReminderModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedDiseaseForModal(null);
          fetchReminders();
          refetchRecommendedMeds();
        }}
        onSuccess={() => {
          setModalOpen(false);
          setSelectedDiseaseForModal(null);
          setTab("active");
          fetchReminders();
          refetchRecommendedMeds();
        }}
        initialDisease={selectedDiseaseForModal}
      />
      <Footer />
    </main>
  );
}
