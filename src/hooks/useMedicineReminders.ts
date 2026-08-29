import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { MedicineReminder, MedicineReminderInsert, ReminderLogInsert, ReminderLog } from "@/lib/supabase/types";
import { useAuth } from "@/lib/auth/auth-context";

export function useMedicineReminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [logs, setLogs] = useState<ReminderLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    if (!user) { setReminders([]); setLogs([]); return; }
    setLoading(true);
    setError(null);
    
    // Fetch reminders
    const { data: remindersData, error: err } = await supabase
      .from("medicine_reminders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Fetch logs
    const { data: logsData } = await supabase
      .from("reminder_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("taken_at", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setReminders((remindersData as MedicineReminder[]) ?? []);
      setLogs((logsData as ReminderLog[]) ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const createReminder = useCallback(
    async (payload: MedicineReminderInsert): Promise<MedicineReminder | null> => {
      if (!user) return null;
      const { data, error: err } = await supabase
        .from("medicine_reminders")
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();
      if (err) { setError(err.message); return null; }
      await fetchReminders();
      return data as MedicineReminder;
    },
    [user, fetchReminders],
  );

  const markTaken = useCallback(
    async (reminderId: string, skipped = false) => {
      if (!user) return;
      // Log the action
      const log: ReminderLogInsert = { reminder_id: reminderId, taken_at: new Date().toISOString(), skipped, catatan: null };
      await supabase.from("reminder_logs").insert({ ...log, user_id: user.id });

      if (!skipped) {
        // Decrement tablet_tersisa
        const reminder = reminders.find((r) => r.id === reminderId);
        if (reminder && reminder.tablet_tersisa !== null) {
          const newCount = Math.max(0, (reminder.tablet_tersisa ?? 1) - 1);
          await supabase
            .from("medicine_reminders")
            .update({ tablet_tersisa: newCount, is_active: newCount > 0 })
            .eq("id", reminderId);
        }
      }
      await fetchReminders();
    },
    [user, reminders, fetchReminders],
  );

  const deactivateReminder = useCallback(
    async (reminderId: string) => {
      if (!user) return;
      await supabase
        .from("medicine_reminders")
        .update({ is_active: false })
        .eq("id", reminderId);
      await fetchReminders();
    },
    [user, fetchReminders],
  );

  const activeReminders = reminders.filter((r) => r.is_active);
  const inactiveReminders = reminders.filter((r) => !r.is_active);

  return {
    reminders,
    activeReminders,
    inactiveReminders,
    logs,
    loading,
    error,
    fetchReminders,
    createReminder,
    markTaken,
    deactivateReminder,
  };
}
