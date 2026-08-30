import type { MedicineReminder, ReminderLog } from "@/lib/supabase/types";

/**
 * Dosage-frequency presets. "dosis" here means how many times a day the
 * medicine is taken — the interval between reminders is derived directly
 * from it (24 jam / frekuensi), so the user only ever picks 1x, 2x, or 3x
 * sehari and never has to think in hours.
 */
export const DOSIS_FREQUENCY_OPTIONS = [
  { value: 1, label: "1x sehari", intervalJam: 24 },
  { value: 2, label: "2x sehari", intervalJam: 12 },
  { value: 3, label: "3x sehari", intervalJam: 8 },
] as const;

export type DosisFrequency = (typeof DOSIS_FREQUENCY_OPTIONS)[number]["value"];

export function intervalForDosis(dosis: DosisFrequency): number {
  return DOSIS_FREQUENCY_OPTIONS.find((o) => o.value === dosis)?.intervalJam ?? 8;
}

export function dosisForInterval(intervalJam: number): DosisFrequency {
  const match = DOSIS_FREQUENCY_OPTIONS.find((o) => o.intervalJam === intervalJam);
  return (match?.value ?? 3) as DosisFrequency;
}

function relevantLogsDesc(reminderId: string, logs: ReminderLog[]): ReminderLog[] {
  return logs
    .filter((log) => log.reminder_id === reminderId && !log.skipped)
    .slice()
    .sort((a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime());
}

/**
 * Next dose time. If the medicine has already been taken at least once,
 * the next dose is simply "last taken time + interval" — e.g. tap "Sudah
 * Minum" at 06:30 with a 12-jam interval and the next dose shows 18:30.
 * Before the first dose, it falls back to the configured start time.
 */
export function getNextDoseDate(reminder: MedicineReminder, logs: ReminderLog[]): Date {
  const intervalMs = reminder.interval_jam * 60 * 60 * 1000;
  const taken = relevantLogsDesc(reminder.id, logs);

  if (taken.length > 0) {
    const lastTaken = new Date(taken[0].taken_at);
    return new Date(lastTaken.getTime() + intervalMs);
  }

  const start = new Date(reminder.waktu_mulai);
  const now = new Date();
  let next = new Date(start.getTime());
  while (next <= now) {
    next = new Date(next.getTime() + intervalMs);
  }
  return next;
}

export function formatDoseTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Whether the current dose window has already been marked as taken — used
 * to disable the "Sudah Minum" button until the next interval begins.
 */
export function isTakenForCurrentSlot(reminder: MedicineReminder, logs: ReminderLog[]): boolean {
  const taken = relevantLogsDesc(reminder.id, logs);
  if (taken.length === 0) return false;

  const intervalMs = reminder.interval_jam * 60 * 60 * 1000;
  const lastTakenTime = new Date(taken[0].taken_at).getTime();
  return lastTakenTime + intervalMs > Date.now();
}

export function getLastTakenLabel(reminderId: string, logs: ReminderLog[]): string {
  const taken = relevantLogsDesc(reminderId, logs);
  if (taken.length === 0) return "Belum pernah";

  const date = new Date(taken[0].taken_at);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const timeString = formatDoseTime(date);

  if (isToday) return `Hari ini pukul ${timeString}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Kemarin pukul ${timeString}`;

  return `${date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} pukul ${timeString}`;
}
