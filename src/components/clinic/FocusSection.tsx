import { useState } from "react";
import {
  ArrowRight,
  Bone,
  Camera,
  ClipboardCheck,
  Leaf,
  MessageCircleHeart,
  ScanLine,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "./Reveal";

const STEPS = [
  {
    n: "01",
    icon: Camera,
    title: "Pilih Caramu",
    desc: "Foto keluhan untuk Scan AI, atau ketik/ketuk gejala untuk Konsultasi AI.",
  },
  {
    n: "02",
    icon: Wand2,
    title: "AI Menganalisis",
    desc: "Sistem membandingkan data dengan ribuan pola gejala terkini.",
  },
  {
    n: "03",
    icon: ClipboardCheck,
    title: "Dapat Rekomendasi",
    desc: "Ringkasan risiko, penyebab, dan langkah selanjutnya dalam hitungan detik.",
  },
];

type Tab = "scan" | "konsultasi";

const TAB_COPY: Record<
  Tab,
  { label: string; bullets: string[]; cta: string; to: string; accent: string; accentDim: string }
> = {
  scan: {
    label: "Scan AI",
    bullets: [
      "Foto kondisi kulit atau bagian tubuh yang bermasalah",
      "Dapat tingkat bahaya: rendah, sedang, atau tinggi",
      "Rekomendasi obat umum & alternatif herbal",
    ],
    cta: "Coba Scan AI",
    to: "/scanner",
    accent: "var(--color-siaga-scan)",
    accentDim: "var(--color-siaga-scan-dim)",
  },
  konsultasi: {
    label: "Konsultasi AI",
    bullets: [
      "Ceritakan gejala lewat chat yang natural",
      "Ketuk langsung bagian tubuh di peta interaktif",
      "AI menggali detail sebelum memberi rekomendasi",
    ],
    cta: "Mulai Konsultasi",
    to: "/consultation",
    accent: "var(--color-siaga-consult)",
    accentDim: "var(--color-siaga-consult-dim)",
  },
};

function PhoneMockup({ tab }: { tab: Tab }) {
  return (
    <div className="relative mx-auto w-[260px]">
      {/* Ambient glow behind the device — pulses gently */}
      <div
        className="animate-siaga-glow pointer-events-none absolute inset-x-6 top-10 -z-10 h-[420px] rounded-[3rem] blur-3xl transition-colors duration-500"
        style={{
          backgroundColor: tab === "scan" ? "rgba(46,230,196,0.18)" : "rgba(160,139,255,0.18)",
        }}
      />

      {/* Titanium-style outer frame — gentle idle float for a premium, alive feel */}
      <div className="animate-phone-float relative rounded-[2.6rem] bg-gradient-to-br from-[#3a3d44] via-[#111318] to-[#050608] p-[3px] shadow-[0_35px_70px_rgba(17,17,17,0.35)]">
        <div className="rounded-[2.5rem] bg-gradient-to-b from-[#0c0d10] to-[#1a1c21] p-2">
          {/* Screen */}
          <div className="relative overflow-hidden rounded-[2rem] bg-white">
            {/* Dynamic island */}
            <div className="absolute left-1/2 top-2.5 z-30 h-6 w-24 -translate-x-1/2 rounded-full bg-[color:var(--color-clinic-ink)]" />

            {/* Glass sheen */}
            <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-white/25 via-transparent to-transparent" />

            <div key={tab} className="animate-phone-switch min-h-[420px] px-4 pb-6 pt-11">
              {tab === "scan" ? <ScanScreen /> : <ConsultScreen />}
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-1.5 left-1/2 z-30 h-1 w-24 -translate-x-1/2 rounded-full bg-black/20" />
          </div>
        </div>
      </div>

      {/* Side buttons */}
      <span className="absolute -left-[3px] top-24 h-6 w-[3px] rounded-l-sm bg-[#25272c]" />
      <span className="absolute -left-[3px] top-36 h-10 w-[3px] rounded-l-sm bg-[#25272c]" />
      <span className="absolute -left-[3px] top-[11.5rem] h-10 w-[3px] rounded-l-sm bg-[#25272c]" />
      <span className="absolute -right-[3px] top-32 h-14 w-[3px] rounded-r-sm bg-[#25272c]" />
    </div>
  );
}

function ScanScreen() {
  return (
    <div className="flex flex-col gap-3">
      <span
        className="animate-fade-up inline-flex w-fit items-center gap-1.5 rounded-full bg-[color:var(--color-siaga-scan)]/12 px-2.5 py-1 text-[10px] font-semibold text-[color:var(--color-siaga-scan-dim)]"
        style={{ animationDuration: "0.4s" }}
      >
        <ScanLine className="h-3 w-3" /> Analisis Selesai
      </span>
      <div
        className="animate-fade-up flex items-center gap-3 rounded-2xl bg-[color:var(--color-clinic-blue-soft)]/60 p-3"
        style={{ animationDuration: "0.4s", animationDelay: "0.1s" }}
      >
        <div className="relative grid h-14 w-14 shrink-0 place-items-center">
          <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full -rotate-90">
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke="var(--color-siaga-scan)"
              strokeOpacity="0.2"
              strokeWidth="4"
            />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke="var(--color-siaga-scan-dim)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 24}
              strokeDashoffset={2 * Math.PI * 24 * (1 - 0.92)}
              style={{
                transition: "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.3s",
              }}
            />
          </svg>
          <span className="font-display text-sm font-extrabold text-[color:var(--color-siaga-scan-dim)]">
            92%
          </span>
        </div>
        <div>
          <p className="text-xs font-bold text-[color:var(--color-clinic-ink)]">
            Iritasi Kulit Ringan
          </p>
          <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            Risiko Rendah
          </span>
        </div>
      </div>
      <div
        className="animate-fade-up flex flex-col gap-2 text-[11px] text-[color:var(--color-clinic-muted)]"
        style={{ animationDuration: "0.4s", animationDelay: "0.2s" }}
      >
        <p className="font-semibold text-[color:var(--color-clinic-ink)]">Kemungkinan penyebab:</p>
        <p>• Reaksi alergi ringan pada kulit</p>
        <p>• Gesekan atau iritasi bahan tekstil</p>
      </div>
      <div
        className="animate-fade-up mt-auto flex items-center gap-2 rounded-2xl bg-[color:var(--color-siaga-scan)]/8 p-2.5"
        style={{ animationDuration: "0.4s", animationDelay: "0.3s" }}
      >
        <Leaf className="h-4 w-4 shrink-0 text-[color:var(--color-siaga-scan-dim)]" />
        <p className="text-[10px] leading-snug text-[color:var(--color-clinic-ink)]">
          Kompres dingin & hindari sabun beraroma kuat
        </p>
      </div>
    </div>
  );
}

function ConsultScreen() {
  const bubbles = [
    { mine: false, delay: "0s", content: "Bagian tubuh mana yang terasa sakit?" },
    { mine: true, delay: "0.15s", content: "Kepala, sejak 2 hari" },
    { mine: false, delay: "0.3s", content: "Baik, apakah disertai demam atau mual?" },
  ];

  return (
    <div className="flex flex-col gap-2.5">
      <span
        className="animate-fade-up inline-flex w-fit items-center gap-1.5 rounded-full bg-[color:var(--color-siaga-consult)]/12 px-2.5 py-1 text-[10px] font-semibold text-[color:var(--color-siaga-consult-dim)]"
        style={{ animationDuration: "0.4s" }}
      >
        <MessageCircleHeart className="h-3 w-3" /> SiagaSehat AI
      </span>
      {bubbles.map((b) => (
        <div
          key={b.content}
          className={`animate-fade-up max-w-[85%] rounded-2xl px-3 py-2 text-[11px] ${
            b.mine
              ? "ml-auto flex items-center gap-1.5 rounded-br-md bg-[color:var(--color-siaga-consult)] text-white"
              : "rounded-bl-md bg-[color:var(--color-clinic-blue-soft)]/60 text-[color:var(--color-clinic-ink)]"
          }`}
          style={{ animationDuration: "0.35s", animationDelay: b.delay }}
        >
          {b.mine && <Bone className="h-3 w-3 shrink-0" />}
          {b.content}
        </div>
      ))}
      <div
        className="animate-fade-up mt-auto flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-[10px] text-[color:var(--color-clinic-muted)]"
        style={{ animationDuration: "0.4s", animationDelay: "0.45s" }}
      >
        Tulis gejala atau pertanyaanmu...
      </div>
    </div>
  );
}

export function FocusSection() {
  const [tab, setTab] = useState<Tab>("scan");
  const copy = TAB_COPY[tab];

  return (
    <section
      id="titik-fokus"
      className="relative w-full overflow-hidden bg-white px-6 py-16 md:px-10 md:py-24"
    >
      <span className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[color:var(--color-siaga-scan)]/[0.06] blur-3xl" />
      <span className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[color:var(--color-siaga-consult)]/[0.07] blur-3xl" />

      <Reveal className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-3 py-1 text-xs uppercase tracking-[0.25em] text-[color:var(--color-clinic-blue)]">
            <Sparkles className="h-3 w-3" />
            Titik Fokus Kami
          </span>
          <h2 className="mt-4 max-w-xl font-display text-4xl font-extrabold leading-tight tracking-tight text-[color:var(--color-clinic-ink)] md:text-5xl">
            Dua cara mengenal tubuhmu,{" "}
            <span className="bg-gradient-to-r from-[color:var(--color-siaga-scan-dim)] to-[color:var(--color-siaga-consult-dim)] bg-clip-text text-transparent">
              satu tujuan
            </span>
          </h2>
        </div>
        <p className="max-w-[240px] text-sm leading-relaxed text-[color:var(--color-clinic-muted)]">
          Sama-sama diproses AI, sama-sama gratis dicoba — tinggal pilih yang paling nyaman buatmu.
        </p>
      </Reveal>

      {/* Process rail — genuinely sequential, so numbering earns its place */}
      <Reveal delay="0.05s" className="relative mt-12 grid gap-6 sm:grid-cols-3 sm:gap-4">
        <span className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-black/10 sm:block" />
        {STEPS.map((s) => (
          <div key={s.n} className="relative flex flex-col gap-2 bg-white pr-4 sm:pt-0">
            <div className="flex items-center gap-2">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-black/10 bg-white text-[color:var(--color-clinic-ink)] shadow-sm">
                <s.icon className="h-5 w-5" />
              </span>
              <span className="font-display text-xs font-bold text-black/25">{s.n}</span>
            </div>
            <p className="font-display text-sm font-bold text-[color:var(--color-clinic-ink)]">
              {s.title}
            </p>
            <p className="text-xs leading-relaxed text-[color:var(--color-clinic-muted)]">
              {s.desc}
            </p>
          </div>
        ))}
      </Reveal>

      {/* Interactive tab demo — grounded in the real product UI */}
      <Reveal delay="0.1s" className="relative mt-14 md:mt-20">
        <div className="mx-auto flex w-fit items-center gap-1 rounded-full border border-black/10 bg-black/[0.02] p-1">
          {(Object.keys(TAB_COPY) as Tab[]).map((key) => {
            const isActive = key === tab;
            const c = TAB_COPY[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className="relative rounded-full px-4 py-2 text-sm font-semibold transition"
                style={{
                  color: isActive ? "white" : "var(--color-clinic-muted)",
                  backgroundColor: isActive ? c.accentDim : "transparent",
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-6">
          <div key={`copy-${tab}`} className="animate-fade-up order-2 lg:order-1">
            <h3 className="font-display text-2xl font-extrabold text-[color:var(--color-clinic-ink)] md:text-3xl">
              {copy.label}
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              {copy.bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 text-sm text-[color:var(--color-clinic-muted)]"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: copy.accent }}
                  />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              to={copy.to}
              className="group mt-7 inline-flex items-center gap-2 rounded-full py-2 pl-5 pr-2 text-sm font-semibold text-white transition"
              style={{ backgroundColor: copy.accentDim }}
            >
              {copy.cta}
              <span
                className="grid h-8 w-8 place-items-center rounded-full bg-white transition group-hover:rotate-45"
                style={{ color: copy.accentDim }}
              >
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>

          <div className="order-1 lg:order-2">
            <PhoneMockup tab={tab} />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
