import { Clock, Pill, CheckCircle2, XCircle, AlertTriangle, Building2, Store } from "lucide-react";
import type { MedicineReminder, ReminderLog } from "@/lib/supabase/types";
import { formatDoseTime, getNextDoseDate, isTakenForCurrentSlot } from "@/lib/reminders/scheduling";

interface Props {
  reminder: MedicineReminder;
  logs: ReminderLog[];
  onMarkTaken: (id: string) => void;
  onSkip: (id: string) => void;
  onDeactivate: (id: string) => void;
}

function progressPercent(reminder: MedicineReminder): number {
  if (!reminder.tablet_tersisa) return 0;
  return Math.round((reminder.tablet_tersisa / reminder.jumlah_tablet) * 100);
}

export function ReminderCard({ reminder, logs, onMarkTaken, onSkip, onDeactivate }: Props) {
  const pct = progressPercent(reminder);
  const nextDose = formatDoseTime(getNextDoseDate(reminder, logs));
  const alreadyTaken = isTakenForCurrentSlot(reminder, logs);
  const isDepleted = (reminder.tablet_tersisa ?? 0) === 0;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${
        reminder.is_active ? "border-blue-100" : "border-gray-100 opacity-60"
      }`}
    >
      {/* Top accent bar */}
      <div
        className="h-1.5 w-full"
        style={{ background: reminder.is_active ? "var(--color-clinic-blue)" : "#e5e7eb" }}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] shadow-inner">
              <Pill className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display font-bold text-[color:var(--color-clinic-ink)] leading-tight">
                {reminder.nama_obat}
              </p>
              <p className="text-xs text-[color:var(--color-clinic-muted)] mt-0.5">
                {reminder.dosis_per_minum} · {Math.round(24 / reminder.interval_jam)}x sehari · tiap{" "}
                {reminder.interval_jam} jam
              </p>
            </div>
          </div>

          {/* Location badge */}
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
            {reminder.purchase_location === "apotek" ? (
              <Store className="h-3 w-3" />
            ) : (
              <Building2 className="h-3 w-3" />
            )}
            {reminder.purchase_location === "apotek" ? "Apotek" : "RS"}
          </span>
        </div>

        {/* Tablet progress */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between text-xs text-[color:var(--color-clinic-muted)] mb-1.5">
            <span>Tablet tersisa</span>
            <span className="font-semibold text-[color:var(--color-clinic-ink)]">
              {reminder.tablet_tersisa ?? reminder.jumlah_tablet} / {reminder.jumlah_tablet}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background:
                  pct > 50 ? "var(--color-clinic-blue)" : pct > 20 ? "#f59e0b" : "#ef4444",
              }}
            />
          </div>
        </div>

        {/* Next dose confirmation — shown only after user marks the current dose taken */}
        {reminder.is_active && !isDepleted && alreadyTaken && (
          <div className="mt-3.5 flex items-center gap-2 rounded-xl bg-[color:var(--color-clinic-blue-soft)] px-3 py-2.5 text-xs text-[color:var(--color-clinic-blue-dark)]">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[color:var(--color-clinic-blue)] shadow-sm">
              <Clock className="h-3.5 w-3.5" />
            </span>
            <span>
              Dosis berikutnya jam <strong className="font-display">{nextDose}</strong>
            </span>
          </div>
        )}

        {isDepleted && reminder.is_active && (
          <div className="mt-3.5 flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>Tablet habis — segera beli lagi</span>
          </div>
        )}

        {/* Action buttons */}
        {reminder.is_active && !isDepleted && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onMarkTaken(reminder.id)}
              id={`reminder-taken-${reminder.id}`}
              disabled={alreadyTaken}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition active:scale-95 ${
                alreadyTaken
                  ? "cursor-not-allowed bg-emerald-50 border border-emerald-100 text-emerald-600"
                  : "bg-[color:var(--color-clinic-blue)] text-white hover:bg-[color:var(--color-clinic-blue-dark)]"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {alreadyTaken ? "Sudah Diminum" : "Sudah Minum"}
            </button>
            {!alreadyTaken && (
              <button
                onClick={() => onSkip(reminder.id)}
                id={`reminder-skip-${reminder.id}`}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
              >
                Lewati
              </button>
            )}
          </div>
        )}

        {/* Deactivate */}
        {reminder.is_active && (
          <button
            onClick={() => onDeactivate(reminder.id)}
            id={`reminder-stop-${reminder.id}`}
            className="mt-2 flex w-full items-center justify-center gap-1 text-[10px] text-slate-400 transition hover:text-red-400"
          >
            <XCircle className="h-3 w-3" />
            Hentikan pengingat ini
          </button>
        )}
      </div>
    </div>
  );
}
