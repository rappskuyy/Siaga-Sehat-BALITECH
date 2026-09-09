import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Plus, ShieldAlert, X } from "lucide-react";
import type { ScanMedicine } from "@/lib/scanner/types";
import { cn } from "@/lib/utils";

type UsageTag = { label: string; tone: "emerald" | "amber" };

function detectUsageTag(catatan: string): UsageTag {
  const t = (catatan ?? "").toLowerCase();
  const needsCaution = /(konsultasi|dokter|hati-hati|awasi|resep|alergi)/.test(t);

  if (/(nyeri|sakit|pusing|pegal)/.test(t)) {
    return { label: "Pereda Nyeri", tone: needsCaution ? "amber" : "emerald" };
  }
  if (/(demam|panas)/.test(t)) {
    return { label: "Penurun Panas", tone: needsCaution ? "amber" : "emerald" };
  }
  if (/(alergi|gatal|ruam)/.test(t)) {
    return { label: "Anti-Alergi", tone: needsCaution ? "amber" : "emerald" };
  }
  if (/(radang|infeksi|antibiotik)/.test(t)) {
    return { label: "Anti-Radang", tone: "amber" };
  }
  return {
    label: needsCaution ? "Perlu Konsultasi" : "Sesuai Kondisi",
    tone: needsCaution ? "amber" : "emerald",
  };
}

export function MedicineAdvisoryPanel({ obat }: { obat: ScanMedicine[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasData = obat && obat.length > 0;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Trigger row — hidden by default on BOTH mobile and desktop */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls="medicine-advisory-body"
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left sm:px-6 sm:py-5"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[color:var(--color-clinic-blue)]/10 text-[color:var(--color-clinic-blue)]">
            <Pill className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold leading-tight text-[color:var(--color-clinic-ink)] sm:text-lg">
              Saran Obat &amp; Medis
            </h3>
            <p className="truncate text-xs text-[color:var(--color-clinic-muted)] sm:text-sm">
              {hasData
                ? `${obat.length} saran obat tersedia — ketuk untuk lihat dosis`
                : "Belum ada saran obat bebas untuk kondisi ini"}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-full text-white shadow-md transition-transform duration-200",
            "bg-[color:var(--color-clinic-blue-dark)]",
            expanded && "rotate-90",
          )}
        >
          {expanded ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id="medicine-advisory-body"
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {!hasData ? (
              <div className="mx-5 mb-5 rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm font-medium text-[color:var(--color-clinic-muted)] sm:mx-6 sm:mb-6">
                Tidak ada saran obat bebas untuk kondisi ini, konsultasikan ke dokter/apoteker.
              </div>
            ) : (
              <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                {/* Authentication-style dark header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[color:var(--color-siaga-navy)] to-[color:var(--color-siaga-indigo)] px-5 py-4">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.07]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                      backgroundSize: "16px 16px",
                    }}
                  />
                  <div className="relative flex items-center gap-2.5">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-[color:var(--color-siaga-scan)]">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold text-white sm:text-base">
                        Saran Obat — Bukan Resep Dokter
                      </p>
                      <p className="text-[11px] text-white/60 sm:text-xs">
                        Hasil analisis AI, bukan pengganti resep tenaga medis
                      </p>
                    </div>
                  </div>
                </div>

                {/* Medicine list */}
                <ul className="mt-3 flex flex-col gap-2">
                  {obat.map((med, i) => {
                    const tag = detectUsageTag(med.catatan ?? "");
                    return (
                      <li
                        key={i}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-display text-sm font-bold text-[color:var(--color-clinic-ink)]">
                              {med.nama}
                            </span>
                            <span className="rounded-md bg-[color:var(--color-clinic-blue)]/10 px-1.5 py-0.5 text-[11px] font-bold text-[color:var(--color-clinic-blue-dark)]">
                              {med.dosis}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-[color:var(--color-clinic-muted)] sm:text-sm">
                            {med.catatan}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                            tag.tone === "emerald"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700",
                          )}
                        >
                          {tag.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] text-[color:var(--color-clinic-muted)]">
                  Selalu cek dengan apoteker sebelum konsumsi.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
