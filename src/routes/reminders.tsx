import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle2,
  Clock,
  History,
  Pill,
  Plus,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useMedicineReminders } from "@/hooks/useMedicineReminders";
import { ReminderCard } from "@/components/reminder/ReminderCard";
import { MedicineReminderModal } from "@/components/reminder/MedicineReminderModal";
import { ReminderNotificationManager } from "@/components/reminder/ReminderNotificationManager";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/clinic/Footer";

interface RemindersSearch {
  scan?: string;
  penyakit?: string;
}

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
  const { activeReminders, inactiveReminders, loading, markTaken, deactivateReminder, logs } =
    useMedicineReminders();
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState<"active" | "history">("active");

  const clearFilter = () => navigate({ to: "/reminders", search: {} });

  const filteredActive = useMemo(
    () =>
      scanFilter
        ? activeReminders.filter((r) => r.source_type === "scan" && r.source_id === scanFilter)
        : activeReminders,
    [activeReminders, scanFilter],
  );
  const filteredInactive = useMemo(
    () =>
      scanFilter
        ? inactiveReminders.filter((r) => r.source_type === "scan" && r.source_id === scanFilter)
        : inactiveReminders,
    [inactiveReminders, scanFilter],
  );

  const lowStockCount = activeReminders.filter(
    (r) => r.tablet_tersisa != null && r.tablet_tersisa <= 3 && r.tablet_tersisa > 0,
  ).length;

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
        <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl bg-[color:var(--color-clinic-blue)] px-6 py-6 shadow-md sm:px-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{ background: "radial-gradient(60% 90% at 90% 0%, #2ee6c4, transparent)" }}
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
            {activeList.map((r) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                logs={logs}
                onMarkTaken={tab === "active" ? (id) => markTaken(id, false) : () => {}}
                onSkip={tab === "active" ? (id) => markTaken(id, true) : () => {}}
                onDeactivate={tab === "active" ? deactivateReminder : () => {}}
              />
            ))}
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
      <MedicineReminderModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <Footer />
    </main>
  );
}
