import { Leaf } from "lucide-react";
import type { ScanHerbal } from "@/lib/scanner/types";
import { cn } from "@/lib/utils";

type HerbalCategory = "diminum" | "topikal" | "inhalasi" | "lainnya";

const CATEGORY_META: Record<HerbalCategory, { label: string; pill: string }> = {
  diminum: { label: "Diminum", pill: "bg-emerald-500 text-white" },
  topikal: { label: "Topikal", pill: "bg-amber-500 text-white" },
  inhalasi: {
    label: "Dihirup",
    pill: "bg-[color:var(--color-siaga-scan-dim)] text-white",
  },
  lainnya: {
    label: "Alami",
    pill: "bg-[color:var(--color-clinic-blue)] text-white",
  },
};

function detectCategory(caraPakai: string): HerbalCategory {
  const t = caraPakai.toLowerCase();
  if (/(oles|tempel|balur|kompres|topikal)/.test(t)) return "topikal";
  if (/(kumur|hirup|hisap|hidung|uap)/.test(t)) return "inhalasi";
  if (/(minum|seduh|rebus|konsumsi|telan)/.test(t)) return "diminum";
  return "lainnya";
}

export function HerbalOrderList({ herbal }: { herbal: ScanHerbal[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
          <Leaf className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold leading-tight text-[color:var(--color-clinic-ink)]">
            Obat Herbal Alami
          </h3>
          <p className="text-xs text-[color:var(--color-clinic-muted)]">
            Alternatif alami yang bisa dicoba di rumah
          </p>
        </div>
      </div>

      {!herbal || herbal.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center">
          <Leaf className="h-6 w-6 text-slate-300" />
          <p className="text-sm font-medium text-[color:var(--color-clinic-muted)]">
            Belum ada saran herbal spesifik untuk kondisi ini.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {herbal.map((herb, i) => {
            const category = detectCategory(herb.cara_pakai ?? "");
            const meta = CATEGORY_META[category];
            return (
              <li
                key={i}
                className="group flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50/70 hover:shadow-[0_8px_20px_rgba(16,185,129,0.12)]"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold text-[color:var(--color-clinic-ink)] sm:text-base">
                    {herb.nama}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[color:var(--color-clinic-muted)] sm:text-sm">
                    {herb.cara_pakai}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide",
                    meta.pill,
                  )}
                >
                  {meta.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
