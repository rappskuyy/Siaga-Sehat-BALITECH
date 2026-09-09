import { useEffect, useRef } from "react";
import type { MedicineReminder } from "@/lib/supabase/types";
import { getNextDoseDate } from "@/lib/reminders/scheduling";

interface Props {
  activeReminders: MedicineReminder[];
}

function scheduleNotification(reminder: MedicineReminder) {
  const intervalMs = reminder.interval_jam * 60 * 60 * 1000;
  const notify = () => {
    if (Notification.permission === "granted") {
      new Notification(" Waktunya Minum Obat!", {
        body: `${reminder.nama_obat} (${reminder.dosis_per_minum})\nTablet tersisa: ${reminder.tablet_tersisa ?? "?"}`,
        icon: "/favicon.ico",
        tag: `reminder-${reminder.id}`,
        requireInteraction: true,
      });
    }
  };

  const nextDose = getNextDoseDate(reminder, []);
  const delay = Math.max(0, nextDose.getTime() - Date.now());
  let intervalId: ReturnType<typeof setInterval> | undefined;
  const timeoutId = setTimeout(() => {
    notify();
    intervalId = setInterval(notify, intervalMs);
  }, delay);

  return () => {
    clearTimeout(timeoutId);
    if (intervalId) clearInterval(intervalId);
  };
}

export function ReminderNotificationManager({ activeReminders }: Props) {
  const intervalsRef = useRef<Map<string, () => void>>(new Map());

  useEffect(() => {
    // Request notification permission if not granted
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!("Notification" in window)) return;

    // Clear intervals that are no longer active
    for (const [id, cleanup] of intervalsRef.current.entries()) {
      if (!activeReminders.find((r) => r.id === id)) {
        cleanup();
        intervalsRef.current.delete(id);
      }
    }

    // Schedule new intervals
    for (const reminder of activeReminders) {
      if (!intervalsRef.current.has(reminder.id)) {
        const cleanup = scheduleNotification(reminder);
        intervalsRef.current.set(reminder.id, cleanup);
      }
    }

    return () => {
      for (const cleanup of intervalsRef.current.values()) cleanup();
      intervalsRef.current.clear();
    };
  }, [activeReminders]);

  return null;
}
