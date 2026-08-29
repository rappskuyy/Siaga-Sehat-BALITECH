import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, BellOff, Clock, History, Pill, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useMedicineReminders } from "@/hooks/useMedicineReminders";
import { ReminderCard } from "@/components/reminder/ReminderCard";
import { MedicineReminderModal } from "@/components/reminder/MedicineReminderModal";
import { ReminderNotificationManager } from "@/components/reminder/ReminderNotificationManager";

export const Route = createFileRoute("/reminders")({
  head: () => ({
    meta: [
      { title: "Pengingat Obat — SiagaSehat" },
      {
        name: "description",
        content:
          "Kelola jadwal pengingat minum obat kamu di SiagaSehat. Berdasarkan rekomendasi dokter AI dari konsultasi dan scan kesehatan.",
      },
    ],
  }),
  component: RemindersPage,
});

function RemindersPage() {
  const { user } = useAuth();
  const { activeReminders, inactiveReminders, loading, markTaken, deactivateReminder, logs } =
    useMedicineReminders();
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState<"active" | "history">("active");

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f4ee] p-6 text-center font-sans">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
          <BellOff className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-[color:var(--color-clinic-ink)]">Login Diperlukan</h1>
        <p className="max-w-xs text-sm text-[color:var(--color-clinic-muted)]">
          Fitur Pengingat Obat hanya tersedia untuk pengguna yang sudah login.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--color-clinic-blue-dark)] transition"
        >
          Masuk Sekarang
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] pb-16 font-sans">
      <ReminderNotificationManager activeReminders={activeReminders} />

      {/* Header */}
      <div className="px-5 pt-4 sm:px-6 md:px-8 lg:px-10">
        <header className="relative mx-auto flex w-full max-w-3xl items-center justify-between gap-4 overflow-hidden rounded-3xl bg-[color:var(--color-clinic-blue)] px-6 py-5 shadow-md">
          {/* Subtle radial glow */}
          <div className="pointer-events-none absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(60% 80% at 20% 20%, #2ee6c4, transparent)" }}
          />
          <Link to="/" className="flex items-center gap-2.5 z-10">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white shadow-sm">
              <span className="h-3 w-3 rounded-full bg-[color:var(--color-clinic-blue)]" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">SiagaSehat</span>
          </Link>
          <div className="z-10 flex items-center gap-2">
            <Bell className="h-5 w-5 text-white/80" />
            <span className="font-semibold text-white text-sm">Pengingat Obat</span>
          </div>
          <Link
            to="/"
            className="z-10 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/30"
          >
            <ArrowLeft className="h-4 w-4" />
            Beranda
          </Link>
        </header>
      </div>

      {/* Body */}
      <div className="mx-auto mt-6 w-full max-w-3xl px-5 sm:px-6 md:px-8 lg:px-10">
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
            Tambah Reminder
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
            {activeReminders.length > 0 && (
              <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                tab === "active" ? "bg-white/30 text-white" : "bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]"
              }`}>
                {activeReminders.length}
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
            {inactiveReminders.length > 0 && (
              <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                tab === "history" ? "bg-white/30 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {inactiveReminders.length}
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
        ) : tab === "active" ? (
          activeReminders.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl bg-white py-12 text-center shadow-sm">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
                <Pill className="h-7 w-7" />
              </div>
              <div>
                <p className="font-semibold text-[color:var(--color-clinic-ink)]">
                  Belum ada pengingat aktif
                </p>
                <p className="mt-1 text-sm text-[color:var(--color-clinic-muted)] max-w-xs mx-auto">
                  Setelah konsultasi atau scan AI, tambahkan pengingat obat untuk jadwal minum yang teratur.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-clinic-blue-dark)]"
              >
                <Plus className="h-4 w-4" />
                Tambah Pengingat
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeReminders.map((r) => {
                const taken = (() => {
                  const reminderLogs = logs.filter((log) => log.reminder_id === r.id && !log.skipped);
                  if (reminderLogs.length === 0) return false;
                  const lastLog = reminderLogs[0];
                  const lastTakenTime = new Date(lastLog.taken_at).getTime();

                  const start = new Date(r.waktu_mulai);
                  const now = new Date();
                  const intervalMs = r.interval_jam * 60 * 60 * 1000;
                  let next = new Date(start.getTime());
                  while (next <= now) {
                    next = new Date(next.getTime() + intervalMs);
                  }
                  const currentIntervalStart = next.getTime() - intervalMs;
                  return lastTakenTime >= currentIntervalStart;
                })();

                return (
                  <ReminderCard
                    key={r.id}
                    reminder={r}
                    onMarkTaken={(id) => markTaken(id, false)}
                    onSkip={(id) => markTaken(id, true)}
                    onDeactivate={deactivateReminder}
                    alreadyTaken={taken}
                  />
                );
              })}
            </div>
          )
        ) : (
          inactiveReminders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-3xl bg-white py-10 text-center shadow-sm">
              <History className="h-10 w-10 text-slate-300" />
              <p className="text-sm text-[color:var(--color-clinic-muted)]">Belum ada riwayat pengingat.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {inactiveReminders.map((r) => (
                <ReminderCard
                  key={r.id}
                  reminder={r}
                  onMarkTaken={() => {}}
                  onSkip={() => {}}
                  onDeactivate={() => {}}
                />
              ))}
            </div>
          )
        )}

        {/* Tip card */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <Bell className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-clinic-blue)]" />
          <p className="text-xs leading-relaxed text-[color:var(--color-clinic-muted)]">
            <strong className="text-[color:var(--color-clinic-ink)]">Tips:</strong> Notifikasi pengingat muncul selama halaman browser terbuka. 
            Pastikan kamu mengizinkan notifikasi dari browser saat diminta untuk pengalaman terbaik.
          </p>
        </div>
      </div>

      {/* Add reminder modal */}
      <MedicineReminderModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}
