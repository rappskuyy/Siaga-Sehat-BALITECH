import { useEffect, useState } from "react";
import { ArrowRight, Bell, Leaf, MapPin, Mic2, Stethoscope, type LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";

export interface Service {
  number: string;
  title: string;
  description: string;
  price: string;
  icon: LucideIcon;
}

const SERVICES: Service[] = [
  {
    number: "01",
    title: "Scanner Penyakit",
    description: "Analisis kesehatan dengan teknologi AI untuk deteksi dini penyakit dari foto.",
    price: "Tersedia",
    icon: Stethoscope,
  },
  {
    number: "02",
    title: "Konsultasi",
    description:
      "Jelaskan gejala Anda dengan mudah melalui speech-to-text untuk diagnosis lebih akurat.",
    price: "Tersedia",
    icon: Mic2,
  },
  {
    number: "03",
    title: "Lokasi & Apotek",
    description: "Temukan klinik terdekat dan apotek dalam satu aplikasi untuk kemudahan Anda.",
    price: "Tersedia",
    icon: MapPin,
  },
  {
    number: "04",
    title: "Edukasi Herbal",
    description: "Pelajari manfaat obat herbal alami untuk kesehatan optimal.",
    price: "Gratis",
    icon: Leaf,
  },
  {
    number: "05",
    title: "Medicine Reminder",
    description: "Pengingat minum obat agar Anda tidak lupa jadwal minum.",
    price: "Tersedia",
    icon: Bell,
  },
];

const AUTO_ADVANCE_MS = 4200;

export function Services() {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActive((a) => (a + 1) % SERVICES.length);
      setCycle((c) => c + 1);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(t);
  }, []);

  const select = (i: number) => {
    setActive(i);
    setCycle((c) => c + 1);
  };

  const current = SERVICES[active];
  const Icon = current.icon;

  return (
    <section
      id="services"
      className="relative w-full overflow-hidden bg-white px-5 py-14 sm:px-6 md:px-8 md:py-20 lg:px-10"
    >
      <span className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[color:var(--color-clinic-blue)]/5 blur-3xl" />
      <span className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[color:var(--color-clinic-blue)]/5 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <Reveal className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-3 py-1 text-xs uppercase tracking-[0.25em] text-[color:var(--color-clinic-blue)]">
              [ Layanan ]
            </span>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-[color:var(--color-clinic-ink)] md:text-5xl">
              Semua yang Anda
              <br />
              butuhkan, dalam satu tempat
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-[color:var(--color-clinic-muted)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-clinic-blue)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--color-clinic-blue)]" />
            </span>
            <span className="font-display font-bold text-[color:var(--color-clinic-ink)]">
              {current.number}
            </span>
            <span>/ {SERVICES.length.toString().padStart(2, "0")}</span>
          </div>
        </Reveal>

        <Reveal
          delay="0.1s"
          className="relative mt-12 grid gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:gap-6"
        >
          {/* Interactive list */}
          <div className="flex flex-col overflow-hidden rounded-[24px] border border-black/5">
            {SERVICES.map((s, i) => {
              const isActive = i === active;
              return (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => select(i)}
                  className={`group relative flex items-center gap-4 overflow-hidden border-b border-black/5 px-5 py-4 text-left transition last:border-b-0 md:px-6 md:py-5 ${
                    isActive
                      ? "bg-[color:var(--color-clinic-blue-soft)]/60"
                      : "hover:bg-black/[0.02]"
                  }`}
                >
                  <span
                    className={`absolute inset-y-0 left-0 w-[3px] transition-colors ${
                      isActive ? "bg-[color:var(--color-clinic-blue)]" : "bg-transparent"
                    }`}
                  />
                  <span
                    className={`font-display text-sm font-bold transition-colors ${
                      isActive ? "text-[color:var(--color-clinic-blue)]" : "text-black/25"
                    }`}
                  >
                    {s.number}
                  </span>
                  <span className="flex-1">
                    <span
                      className={`block font-display text-base font-bold transition-colors md:text-lg ${
                        isActive
                          ? "text-[color:var(--color-clinic-ink)]"
                          : "text-[color:var(--color-clinic-ink)]/70"
                      }`}
                    >
                      {s.title}
                    </span>
                  </span>
                  <ArrowRight
                    className={`h-4 w-4 shrink-0 text-[color:var(--color-clinic-blue)] transition-all ${
                      isActive
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-40"
                    }`}
                  />

                  {isActive && (
                    <span className="absolute bottom-0 left-0 h-[2px] w-full bg-black/5">
                      <span
                        key={cycle}
                        className="animate-progress-fill block h-full bg-[color:var(--color-clinic-blue)]"
                        style={{ animationDuration: `${AUTO_ADVANCE_MS}ms` }}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Preview panel */}
          <div className="relative min-h-[320px] overflow-hidden rounded-[28px] bg-gradient-to-br from-[color:var(--color-clinic-blue-soft)] to-white p-8 md:min-h-[380px] md:p-10">
            <span
              key={`num-${active}`}
              className="animate-fade-up pointer-events-none absolute -bottom-6 -right-2 select-none font-display text-[160px] font-extrabold leading-none text-[color:var(--color-clinic-blue)]/[0.06] md:text-[220px]"
            >
              {current.number}
            </span>

            <div key={active} className="animate-fade-up relative flex h-full flex-col">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--color-clinic-blue)] text-white shadow-lg shadow-[color:var(--color-clinic-blue)]/30 md:h-20 md:w-20">
                <Icon className="h-7 w-7 md:h-9 md:w-9" />
              </div>

              <h3 className="mt-6 font-display text-2xl font-extrabold text-[color:var(--color-clinic-ink)] md:text-3xl">
                {current.title}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[color:var(--color-clinic-muted)] md:text-base">
                {current.description}
              </p>

              <div className="mt-auto flex items-center gap-3 pt-8">
                <a
                  href={active === 0 ? "/scanner" : "#services"}
                  className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--color-clinic-ink)] py-2 pl-5 pr-2 text-sm font-medium text-white transition hover:bg-black/80"
                >
                  Coba sekarang
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-[color:var(--color-clinic-ink)] transition group-hover:rotate-45">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </a>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[color:var(--color-clinic-blue)] shadow-sm">
                  {current.price}
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
