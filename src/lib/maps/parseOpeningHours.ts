export interface DailyOperatingHours {
  open: string;
  close: string;
}

export interface OperatingHours {
  monday?: DailyOperatingHours;
  tuesday?: DailyOperatingHours;
  wednesday?: DailyOperatingHours;
  thursday?: DailyOperatingHours;
  friday?: DailyOperatingHours;
  saturday?: DailyOperatingHours;
  sunday?: DailyOperatingHours;
  weekdayText?: string[];
  isClosedToday?: boolean;
  isOpen24Hours?: boolean;
}

export interface ParsedOpeningHoursResult {
  isOpenNow: boolean;
  openingStatus: "open" | "closed" | "closing-soon";
  openingHoursText: string;
  hoursUntilClose?: number; // in minutes
  operatingHours?: OperatingHours;
}

const DAY_NAMES: (keyof Omit<OperatingHours, "weekdayText" | "isClosedToday" | "isOpen24Hours">)[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/**
 * Parse Google Places opening_hours object or string into structured status.
 */
export function parseOpeningHours(
  googleOpeningHours?: {
    open_now?: boolean;
    weekday_text?: string[];
    periods?: Array<{
      open: { day: number; time: string };
      close?: { day: number; time: string };
    }>;
  },
  rawOsmHours?: string
): ParsedOpeningHoursResult {
  const now = new Date();
  const currentDayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  // 1. Google Places parsing
  if (googleOpeningHours) {
    const { open_now, weekday_text, periods } = googleOpeningHours;

    // Check 24 Hours
    const is24Hours =
      (periods && periods.length === 1 && periods[0].open?.time === "0000" && !periods[0].close) ||
      (weekday_text && weekday_text.some((t) => t.toLowerCase().includes("open 24 hours") || t.toLowerCase().includes("buka 24 jam")));

    if (is24Hours) {
      return {
        isOpenNow: true,
        openingStatus: "open",
        openingHoursText: "Buka 24 Jam",
        operatingHours: {
          isOpen24Hours: true,
          weekdayText: weekday_text || ["Setiap Hari: Buka 24 Jam"],
        },
      };
    }

    const operatingSchedule: OperatingHours = {
      weekdayText: weekday_text,
    };

    let todayOpenMinutes: number | null = null;
    let todayCloseMinutes: number | null = null;

    if (periods && periods.length > 0) {
      for (const period of periods) {
        const dayKey = DAY_NAMES[period.open.day];
        if (dayKey && period.open && period.close) {
          const openStr = `${period.open.time.slice(0, 2)}:${period.open.time.slice(2, 4)}`;
          const closeStr = `${period.close.time.slice(0, 2)}:${period.close.time.slice(2, 4)}`;
          operatingSchedule[dayKey] = { open: openStr, close: closeStr };

          if (period.open.day === currentDayIndex) {
            todayOpenMinutes = parseInt(period.open.time.slice(0, 2), 10) * 60 + parseInt(period.open.time.slice(2, 4), 10);
            todayCloseMinutes = parseInt(period.close.time.slice(0, 2), 10) * 60 + parseInt(period.close.time.slice(2, 4), 10);
          }
        }
      }
    }

    let calculatedIsOpen = typeof open_now === "boolean" ? open_now : true;
    let status: "open" | "closed" | "closing-soon" = "open";
    let minutesUntilClose: number | undefined = undefined;

    if (todayOpenMinutes !== null && todayCloseMinutes !== null) {
      if (todayCloseMinutes > todayOpenMinutes) {
        if (currentTimeMinutes >= todayOpenMinutes && currentTimeMinutes < todayCloseMinutes) {
          calculatedIsOpen = true;
          minutesUntilClose = todayCloseMinutes - currentTimeMinutes;
          status = minutesUntilClose <= 30 ? "closing-soon" : "open";
        } else {
          calculatedIsOpen = false;
          status = "closed";
        }
      } else {
        if (currentTimeMinutes >= todayOpenMinutes || currentTimeMinutes < todayCloseMinutes) {
          calculatedIsOpen = true;
          const remaining = currentTimeMinutes >= todayOpenMinutes
            ? (1440 - currentTimeMinutes) + todayCloseMinutes
            : todayCloseMinutes - currentTimeMinutes;
          minutesUntilClose = remaining;
          status = minutesUntilClose <= 30 ? "closing-soon" : "open";
        } else {
          calculatedIsOpen = false;
          status = "closed";
        }
      }
    } else if (open_now !== undefined) {
      calculatedIsOpen = open_now;
      status = open_now ? "open" : "closed";
    }

    // Build user-friendly text
    let openingHoursText = "Buka";
    const currentDayKey = DAY_NAMES[currentDayIndex];
    const todaySchedule = currentDayKey ? operatingSchedule[currentDayKey] : undefined;

    if (todaySchedule) {
      if (status === "closing-soon" && minutesUntilClose !== undefined) {
        openingHoursText = `Tutup dlm ${minutesUntilClose} mnt (${todaySchedule.close})`;
      } else if (calculatedIsOpen) {
        openingHoursText = `Buka • Tutup ${todaySchedule.close}`;
      } else {
        openingHoursText = `Tutup • Buka ${todaySchedule.open}`;
      }
    } else if (weekday_text && weekday_text.length > 0) {
      const todayText = weekday_text[currentDayIndex === 0 ? 6 : currentDayIndex - 1] || weekday_text[0];
      const colonIndex = todayText.indexOf(":");
      const hoursPart = colonIndex !== -1 ? todayText.slice(colonIndex + 1).trim() : todayText;
      openingHoursText = calculatedIsOpen ? `Buka (${hoursPart})` : `Tutup (${hoursPart})`;
    } else {
      openingHoursText = calculatedIsOpen ? "Sedang Buka" : "Tutup Sekarang";
    }

    return {
      isOpenNow: calculatedIsOpen,
      openingStatus: status,
      openingHoursText,
      hoursUntilClose: minutesUntilClose,
      operatingHours: operatingSchedule,
    };
  }

  // 2. OpenStreetMap raw string fallback parsing
  if (rawOsmHours) {
    const lower = rawOsmHours.trim().toLowerCase();
    if (lower === "24/7" || lower.includes("24 jam") || lower.includes("24 hours")) {
      return {
        isOpenNow: true,
        openingStatus: "open",
        openingHoursText: "Buka 24 Jam",
        operatingHours: {
          isOpen24Hours: true,
          weekdayText: ["Setiap Hari: 24 Jam"],
        },
      };
    }

    const timeMatch = rawOsmHours.match(/(\d{1,2})[:.](\d{2})\s*[-–]\s*(\d{1,2})[:.](\d{2})/);
    if (timeMatch) {
      const openH = parseInt(timeMatch[1], 10);
      const openM = parseInt(timeMatch[2], 10);
      const closeH = parseInt(timeMatch[3], 10);
      const closeM = parseInt(timeMatch[4], 10);

      const openMinutes = openH * 60 + openM;
      const closeMinutes = closeH * 60 + closeM;

      let isOpen = false;
      let status: "open" | "closed" | "closing-soon" = "closed";
      let minutesUntilClose: number | undefined = undefined;

      if (closeMinutes > openMinutes) {
        if (currentTimeMinutes >= openMinutes && currentTimeMinutes < closeMinutes) {
          isOpen = true;
          minutesUntilClose = closeMinutes - currentTimeMinutes;
          status = minutesUntilClose <= 30 ? "closing-soon" : "open";
        }
      } else {
        if (currentTimeMinutes >= openMinutes || currentTimeMinutes < closeMinutes) {
          isOpen = true;
          minutesUntilClose = currentTimeMinutes >= openMinutes
            ? (1440 - currentTimeMinutes) + closeMinutes
            : closeMinutes - currentTimeMinutes;
          status = minutesUntilClose <= 30 ? "closing-soon" : "open";
        }
      }

      const formattedOpen = `${String(openH).padStart(2, "0")}:${String(openM).padStart(2, "0")}`;
      const formattedClose = `${String(closeH).padStart(2, "0")}:${String(closeM).padStart(2, "0")}`;

      return {
        isOpenNow: isOpen,
        openingStatus: status,
        openingHoursText: isOpen
          ? (status === "closing-soon" ? `Tutup dlm ${minutesUntilClose} mnt (${formattedClose})` : `Buka • Tutup ${formattedClose}`)
          : `Tutup • Buka ${formattedOpen}`,
        hoursUntilClose: minutesUntilClose,
        operatingHours: {
          weekdayText: [`Operasional: ${formattedOpen} - ${formattedClose}`],
        },
      };
    }

    return {
      isOpenNow: true,
      openingStatus: "open",
      openingHoursText: `Buka (${rawOsmHours})`,
      operatingHours: {
        weekdayText: [rawOsmHours],
      },
    };
  }

  // 3. Fallback when no hours data provided
  return {
    isOpenNow: true,
    openingStatus: "open",
    openingHoursText: "Jam operasional tidak tersedia",
  };
}
