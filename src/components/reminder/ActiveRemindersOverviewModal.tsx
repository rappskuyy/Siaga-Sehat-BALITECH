import { createPortal } from "react-dom";
import { X, CheckCircle2, Bell, Clock, Calendar, Plus, ExternalLink } from "lucide-react";
import type { MedicineReminder, ReminderLog } from "@/lib/supabase/types";

interface Props {
  open: boolean;
  onClose: () => void;
  activeReminders: MedicineReminder[];
  logs: ReminderLog[];
  onMarkTaken: (id: string) => void;
  onOpenSetup: () => void;
}

function getLastTakenTime(reminderId: string, logs: ReminderLog[]): string {
  const reminderLogs = logs.filter((log) => log.reminder_id === reminderId && !log.skipped);
  if (reminderLogs.length === 0) return "Belum pernah";
  
  const lastLog = reminderLogs[0]; // Already ordered by taken_at desc
  const date = new Date(lastLog.taken_at);
  
  // Format to local readable string: e.g. "Hari ini, 08:30" or "Kemarin, 21:00"
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  const timeString = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  if (isToday) {
    return `Hari ini pukul ${timeString}`;
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isYesterday) {
    return `Kemarin pukul ${timeString}`;
  }
  
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) + ` pukul ${timeString}`;
}

function getNextDoseTime(reminder: MedicineReminder): string {
  const start = new Date(reminder.waktu_mulai);
  const now = new Date();
  const intervalMs = reminder.interval_jam * 60 * 60 * 1000;
  let next = new Date(start.getTime());
  while (next <= now) {
    next = new Date(next.getTime() + intervalMs);
  }
  return next.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export function ActiveRemindersOverviewModal({
  open,
  onClose,
  activeReminders,
  logs,
  onMarkTaken,
  onOpenSetup,
}: Props) {
  if (typeof document === "undefined") return null;
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Active Reminders Overview"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[color:var(--color-clinic-ink)]">
                Status Obat Kamu
              </h3>
              <p className="text-[10px] text-[color:var(--color-clinic-muted)]">
                Lihat riwayat minum obat terakhir
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-4">
          {activeReminders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Bell className="h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Tidak ada pengingat aktif</p>
              <p className="text-xs text-[color:var(--color-clinic-muted)] max-w-xs">
                Mulai atur pengingat agar minum obatmu lebih teratur.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeReminders.map((reminder) => {
                const lastTaken = getLastTakenTime(reminder.id, logs);
                const nextDose = getNextDoseTime(reminder);
                const isDepleted = (reminder.tablet_tersisa ?? 0) === 0;

                return (
                  <div
                    key={reminder.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 flex flex-col gap-3 transition hover:border-slate-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-[color:var(--color-clinic-ink)]">
                          {reminder.nama_obat}
                        </h4>
                        <p className="text-[11px] text-[color:var(--color-clinic-muted)] mt-0.5">
                          {reminder.dosis_per_minum} · Tiap {reminder.interval_jam} jam
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-blue-100/60 px-2 py-0.5 text-[9px] font-semibold text-[color:var(--color-clinic-blue)]">
                        Sisa: {reminder.tablet_tersisa ?? reminder.jumlah_tablet} tab
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-2 text-[11px]">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          Terakhir minum:
                        </span>
                        <span className="font-medium text-slate-700">{lastTaken}</span>
                      </div>
                      {!isDepleted && (
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            Dosis berikutnya:
                          </span>
                          <span className="font-medium text-[color:var(--color-clinic-blue)]">
                            {nextDose}
                          </span>
                        </div>
                      )}
                    </div>

                    {!isDepleted && (() => {
                      const taken = (() => {
                        const reminderLogs = logs.filter((log) => log.reminder_id === reminder.id && !log.skipped);
                        if (reminderLogs.length === 0) return false;
                        const lastLog = reminderLogs[0];
                        const lastTakenTime = new Date(lastLog.taken_at).getTime();

                        const start = new Date(reminder.waktu_mulai);
                        const now = new Date();
                        const intervalMs = reminder.interval_jam * 60 * 60 * 1000;
                        let next = new Date(start.getTime());
                        while (next <= now) {
                          next = new Date(next.getTime() + intervalMs);
                        }
                        const currentIntervalStart = next.getTime() - intervalMs;
                        return lastTakenTime >= currentIntervalStart;
                      })();

                      return taken ? (
                        <div className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 border border-emerald-100">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Sudah Diminum untuk Dosis Ini
                        </div>
                      ) : (
                        <button
                          onClick={() => onMarkTaken(reminder.id)}
                          className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-[color:var(--color-clinic-blue)] py-1.5 text-xs font-semibold text-white transition hover:bg-[color:var(--color-clinic-blue-dark)] active:scale-95"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Sudah Minum Sekarang
                        </button>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 flex gap-2">
          <button
            onClick={() => {
              onClose();
              onOpenSetup();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Tambah Baru
          </button>
          <a
            href="/reminders"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[color:var(--color-clinic-blue)] py-2.5 text-xs font-semibold text-white hover:bg-[color:var(--color-clinic-blue-dark)] transition active:scale-95"
          >
            Semua Pengingat
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}
