import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, CircleCheck, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type TabKey = "kemungkinan" | "pencegahan";

const TABS: { key: TabKey; label: string; icon: typeof Activity }[] = [
  { key: "kemungkinan", label: "Kemungkinan", icon: Activity },
  { key: "pencegahan", label: "Pencegahan", icon: CircleCheck },
];

export function ConditionTabs({
  penyebab,
  pencegahan,
}: {
  penyebab: string[];
  pencegahan: string[];
}) {
  const [active, setActive] = useState<TabKey>("kemungkinan");

  const counts: Record<TabKey, number> = {
    kemungkinan: penyebab?.length ?? 0,
    pencegahan: pencegahan?.length ?? 0,
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-[color:var(--color-clinic-blue-soft)] shadow-sm">
      {/* Header + tab track */}
      <div className="flex flex-col gap-4 px-5 pb-0 pt-5 sm:px-7 sm:pt-6">
        <h3 className="font-display text-lg font-bold leading-tight text-[color:var(--color-clinic-ink)] sm:text-xl">
          Analisis Kondisi
        </h3>

        <div
          role="tablist"
          aria-label="Analisis kondisi"
          className="relative flex w-full gap-1 rounded-full bg-slate-100 p-1 sm:w-fit"
        >
          {TABS.map((tab) => {
            const isActive = active === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.key}`}
                id={`tab-${tab.key}`}
                onClick={() => setActive(tab.key)}
                className={cn(
                  "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:flex-none sm:px-5",
                  isActive
                    ? "text-[color:var(--color-clinic-blue-dark)]"
                    : "text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="condition-tab-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_2px_10px_rgba(15,23,42,0.12)]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                    isActive
                      ? "bg-[color:var(--color-clinic-blue)]/10 text-[color:var(--color-clinic-blue-dark)]"
                      : "bg-slate-200/70 text-slate-500",
                  )}
                >
                  {counts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel body */}
      <div className="px-5 pb-6 pt-4 sm:px-7 sm:pb-7">
        <AnimatePresence mode="wait" initial={false}>
          {active === "kemungkinan" ? (
            <motion.div
              key="kemungkinan"
              role="tabpanel"
              id="panel-kemungkinan"
              aria-labelledby="tab-kemungkinan"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {penyebab && penyebab.length > 0 ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {penyebab.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 rounded-2xl border border-slate-200/70 bg-white/70 p-3 text-sm font-medium leading-relaxed text-[color:var(--color-clinic-ink)]"
                    >
                      <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--color-clinic-blue)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyNote text="Tidak ada data penyebab yang tersedia." />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="pencegahan"
              role="tabpanel"
              id="panel-pencegahan"
              aria-labelledby="tab-pencegahan"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {pencegahan && pencegahan.length > 0 ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {pencegahan.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-3 text-sm font-medium leading-relaxed text-[color:var(--color-clinic-ink)]"
                    >
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-emerald-400 text-emerald-600">
                        <CircleCheck className="h-3 w-3" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyNote text="Tidak ada data pencegahan yang tersedia." />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-6 text-center text-sm font-medium text-[color:var(--color-clinic-muted)]">
      {text}
    </p>
  );
}
