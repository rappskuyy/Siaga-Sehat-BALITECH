import { useEffect, useRef } from "react";
import type { MedicineReminder } from "@/lib/supabase/types";

interface Props {
  activeReminders: MedicineReminder[];
}

function scheduleNotification(reminder: MedicineReminder) {
  const intervalMs = reminder.interval_jam * 60 * 60 * 1000;
  const id = setInterval(() => {
    if (Notification.permission === "granted") {
      new Notification("💊 Waktunya Minum Obat!", {
        body: `${reminder.nama_obat} — ${reminder.dosis_per_minum}\nTablet tersisa: ${reminder.tablet_tersisa ?? "?"}`,
        icon: "/favicon.ico",
        tag: `reminder-${reminder.id}`,
        requireInteraction: true,
      });
    }
  }, intervalMs);
  return id;
}

export function ReminderNotificationManager({ activeReminders }: Props) {
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  useEffect(() => {
    // Request notification permission if not granted
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!("Notification" in window)) return;

    // Clear intervals that are no longer active
    for (const [id, intervalId] of intervalsRef.current.entries()) {
      if (!activeReminders.find((r) => r.id === id)) {
        clearInterval(intervalId);
        intervalsRef.current.delete(id);
      }
    }

    // Schedule new intervals
    for (const reminder of activeReminders) {
      if (!intervalsRef.current.has(reminder.id)) {
        const intervalId = scheduleNotification(reminder);
        intervalsRef.current.set(reminder.id, intervalId);
      }
    }

    return () => {
      for (const intervalId of intervalsRef.current.values()) {
        clearInterval(intervalId);
      }
      intervalsRef.current.clear();
    };
  }, [activeReminders]);

  return null;
}
