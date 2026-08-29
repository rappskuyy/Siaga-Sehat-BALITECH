import { useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/auth-context";
import { useMedicineReminders } from "@/hooks/useMedicineReminders";
import { MedicineReminderModal } from "./MedicineReminderModal";
import { ActiveRemindersOverviewModal } from "./ActiveRemindersOverviewModal";
import { ReminderNotificationManager } from "./ReminderNotificationManager";

interface Props {
  /** Visual variant: "light" for dark backgrounds, "dark" for light backgrounds */
  variant?: "light" | "dark";
  className?: string;
}

export function ReminderBell({ variant = "dark", className = "" }: Props) {
  const { user } = useAuth();
  const { activeReminders, logs, markTaken } = useMedicineReminders();
  const [setupOpen, setSetupOpen] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);

  const badgeCount = activeReminders.length;

  const bgClass =
    variant === "light"
      ? "bg-white/15 text-white hover:bg-white/25"
      : "bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue)]/20";

  if (!user) {
    // Not logged in: link to login
    return (
      <Link
        to="/login"
        className={`relative grid h-10 w-10 place-items-center rounded-full transition ${bgClass} ${className}`}
        aria-label="Login untuk pengingat obat"
        title="Login untuk akses Pengingat Obat"
      >
        <Bell className="h-4 w-4" />
      </Link>
    );
  }

  const handleBellClick = () => {
    if (activeReminders.length > 0) {
      setOverviewOpen(true);
    } else {
      setSetupOpen(true);
    }
  };

  return (
    <>
      {/* Background notification scheduler */}
      <ReminderNotificationManager activeReminders={activeReminders} />

      <button
        id="reminder-bell-btn"
        onClick={handleBellClick}
        className={`relative grid h-10 w-10 place-items-center rounded-full transition ${bgClass} ${className}`}
        aria-label={`Pengingat obat${badgeCount > 0 ? ` — ${badgeCount} aktif` : ""}`}
        title="Pengingat Obat"
      >
        <Bell className="h-4 w-4" />
        {badgeCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-1 ring-white animate-pulse">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </button>

      {/* Setup wizard modal */}
      <MedicineReminderModal open={setupOpen} onClose={() => setSetupOpen(false)} />

      {/* Overview status modal */}
      <ActiveRemindersOverviewModal
        open={overviewOpen}
        onClose={() => setOverviewOpen(false)}
        activeReminders={activeReminders}
        logs={logs}
        onMarkTaken={markTaken}
        onOpenSetup={() => setSetupOpen(true)}
      />
    </>
  );
}
