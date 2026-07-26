import { Sparkles } from "lucide-react";

const SCAN_STEPS = [
  "Membaca gambar...",
  "Mendeteksi ciri-ciri visual...",
  "Mencocokkan dengan data kesehatan...",
  "Menyusun rekomendasi...",
];

export function ScanningOverlay({ previewUrl, step }: { previewUrl: string; step: number }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] shadow-[var(--shadow-clinic-lg)]">
      <img src={previewUrl} alt="Menganalisis foto" className="aspect-[4/3] w-full object-cover" />

      {/* dark scan tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--color-clinic-blue)]/25 via-transparent to-[color:var(--color-clinic-blue)]/35" />

      {/* corner brackets */}
      {[
        "left-4 top-4 border-l-2 border-t-2 rounded-tl-lg",
        "right-4 top-4 border-r-2 border-t-2 rounded-tr-lg",
        "left-4 bottom-4 border-l-2 border-b-2 rounded-bl-lg",
        "right-4 bottom-4 border-r-2 border-b-2 rounded-br-lg",
      ].map((cls) => (
        <span key={cls} className={`absolute h-8 w-8 border-white/80 ${cls}`} />
      ))}

      {/* rotating dashed rings, centered */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative grid h-24 w-24 place-items-center">
          <span className="absolute inset-0 animate-scanner-spin rounded-full border-2 border-dashed border-white/70" />
          <span className="absolute inset-2 animate-scanner-spin-reverse rounded-full border-2 border-dashed border-white/40" />
          <span className="absolute inset-0 animate-scanner-ring rounded-full border-2 border-white/50" />
          <Sparkles className="h-8 w-8 text-white drop-shadow" />
        </div>
      </div>

      {/* sweeping scan line */}
      <div className="absolute inset-x-0 animate-scanner-sweep">
        <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_16px_4px_rgba(255,255,255,0.7)]" />
      </div>

      {/* status pill */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-medium text-white backdrop-blur">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-scanner-dot rounded-full bg-white"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </span>
        {SCAN_STEPS[Math.min(step, SCAN_STEPS.length - 1)]}
      </div>
    </div>
  );
}

export { SCAN_STEPS };
