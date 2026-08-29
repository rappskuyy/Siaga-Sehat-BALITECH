import { Clock, Pill, CheckCircle2, XCircle, AlertTriangle, Building2, Store } from "lucide-react";
import type { MedicineReminder } from "@/lib/supabase/types";

interface Props {
  reminder: MedicineReminder;
  onMarkTaken: (id: string) => void;
  onSkip: (id: string) => void;
  onDeactivate: (id: string) => void;
  alreadyTaken?: boolean;
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

function progressPercent(reminder: MedicineReminder): number {
  if (!reminder.tablet_tersisa) return 0;
  return Math.round((reminder.tablet_tersisa / reminder.jumlah_tablet) * 100);
}

export function ReminderCard({ reminder, onMarkTaken, onSkip, onDeactivate, alreadyTaken = false }: Props) {
  const pct = progressPercent(reminder);
  const nextDose = getNextDoseTime(reminder);
  const isDepleted = (reminder.tablet_tersisa ?? 0) === 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
        reminder.is_active ? "border-blue-100" : "border-gray-100 opacity-60"
      }`}
    >
      {/* Top accent bar */}
      <div
        className="h-1 w-full"
        style={{
          background: reminder.is_active
            ? "linear-gradient(90deg, #4a6fa5, #2ee6c4)"
            : "#e5e7eb",
        }}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
              <Pill className="h-4 w-4" />
            </span>
            <div>
              <p className="font-semibold text-[color:var(--color-clinic-ink)] leading-tight">
                {reminder.nama_obat}
              </p>
              <p className="text-xs text-[color:var(--color-clinic-muted)] mt-0.5">
                {reminder.dosis_per_minum} · tiap {reminder.interval_jam} jam
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
        <div className="mt-3">
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
                  pct > 50
                    ? "linear-gradient(90deg, #4a6fa5, #2ee6c4)"
                    : pct > 20
                      ? "#f59e0b"
                      : "#ef4444",
              }}
            />
          </div>
        </div>

        {/* Next dose & status */}
        {reminder.is_active && !isDepleted && (
          <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Dosis berikutnya jam <strong>{nextDose}</strong></span>
          </div>
        )}

        {isDepleted && reminder.is_active && (
          <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>Tablet habis — segera beli lagi</span>
          </div>
        )}

        {/* Action buttons */}
        {reminder.is_active && !isDepleted && (
          <div className="mt-3 flex gap-2">
            {alreadyTaken ? (
              <div className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-100 py-2.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Sudah Diminum untuk Dosis Ini
              </div>
            ) : (
              <>
                <button
                  onClick={() => onMarkTaken(reminder.id)}
                  id={`reminder-taken-${reminder.id}`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[color:var(--color-clinic-blue)] py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--color-clinic-blue-dark)] active:scale-95"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Sudah Minum
                </button>
                <button
                  onClick={() => onSkip(reminder.id)}
                  id={`reminder-skip-${reminder.id}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
                >
                  Lewati
                </button>
              </>
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
