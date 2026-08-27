import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bone,
  Camera,
  CircleDot,
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
    desc: "Foto keluhan, ketuk bagian tubuh, atau ketik/ucapkan gejala — sesuai yang paling nyaman.",
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

type Tab = "scan" | "konsultasi" | "anatomi";

const TAB_COPY: Record<
  Tab,
  { label: string; steps: string[]; cta: string; to: string; accent: string; accentDim: string }
> = {
  scan: {
    label: "Scan AI",
    steps: [
      "Ambil atau unggah foto area yang bermasalah",
      "Tunggu AI membaca pola dan tingkat risikonya",
      "Baca penyebab serta rekomendasi perawatan",
    ],
    cta: "Coba Scan AI",
    to: "/scanner",
    accent: "var(--color-clinic-blue)",
    accentDim: "var(--color-clinic-blue-dark)",
  },
  konsultasi: {
    label: "Konsultasi AI",
    steps: [
      "Ceritakan keluhan dan bagian tubuh yang sakit",
      "Jawab pertanyaan AI satu per satu",
      "Terima saran perawatan dan langkah berikutnya",
    ],
    cta: "Mulai Konsultasi",
    to: "/consultation",
    accent: "var(--color-clinic-blue)",
    accentDim: "var(--color-clinic-blue-dark)",
  },
  anatomi: {
    label: "Anatomi AI",
    steps: [
      "Ketuk bagian tubuh pada model interaktif",
      "Pilih gejala dan kondisi yang dirasakan",
      "Generate assessment untuk melihat hasil awal",
    ],
    cta: "Jelajahi Anatomi",
    to: "/anatomy",
    accent: "var(--color-clinic-blue)",
    accentDim: "var(--color-clinic-blue-dark)",
  },
};

const TAB_GLOW: Record<Tab, string> = {
  scan: "rgba(74,111,165,0.16)",
  konsultasi: "rgba(74,111,165,0.16)",
  anatomi: "rgba(74,111,165,0.16)",
};

function PhoneMockup({ tab }: { tab: Tab }) {
  return (
    <div className="relative mx-auto w-[min(260px,calc(100vw-32px))] lg:w-[300px]">
      {/* Ambient glow behind the device — pulses gently */}
      <div
        className="animate-siaga-glow pointer-events-none absolute inset-x-6 top-10 -z-10 h-[500px] rounded-[3rem] blur-3xl transition-colors duration-500"
        style={{ backgroundColor: TAB_GLOW[tab] }}
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

            <div key={tab} className="animate-phone-switch min-h-[500px] px-5 pb-7 pt-12">
              {tab === "scan" && <ScanScreen />}
              {tab === "konsultasi" && <ConsultScreen />}
              {tab === "anatomi" && <AnatomyScreen />}
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
        className="animate-fade-up inline-flex w-fit items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-2.5 py-1 text-[10px] font-semibold text-[color:var(--color-clinic-blue-dark)]"
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
              stroke="var(--color-clinic-blue)"
              strokeOpacity="0.2"
              strokeWidth="4"
            />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke="var(--color-clinic-blue-dark)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 24}
              strokeDashoffset={2 * Math.PI * 24 * (1 - 0.92)}
              style={{
                transition: "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.3s",
              }}
            />
          </svg>
          <span className="font-display text-sm font-extrabold text-[color:var(--color-clinic-blue-dark)]">
            92%
          </span>
        </div>
        <div>
          <p className="text-xs font-bold text-[color:var(--color-clinic-ink)]">
            Iritasi Kulit Ringan
          </p>
          <span className="mt-1 inline-block rounded-full bg-[color:var(--color-clinic-blue-soft)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-clinic-blue-dark)]">
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
        className="animate-fade-up mt-auto flex items-center gap-2 rounded-2xl bg-[color:var(--color-clinic-blue-soft)] p-2.5"
        style={{ animationDuration: "0.4s", animationDelay: "0.3s" }}
      >
        <Leaf className="h-4 w-4 shrink-0 text-[color:var(--color-clinic-blue)]" />
        <p className="text-[10px] leading-snug text-[color:var(--color-clinic-ink)]">
          Kompres dingin & hindari sabun beraroma kuat
        </p>
      </div>
    </div>
  );
}

function ConsultScreen() {
  const [showReply, setShowReply] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowReply(true), 1350);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-2.5">
      <span
        className="animate-fade-up inline-flex w-fit items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-2.5 py-1 text-[10px] font-semibold text-[color:var(--color-clinic-blue-dark)]"
        style={{ animationDuration: "0.4s" }}
      >
        <MessageCircleHeart className="h-3 w-3" /> SiagaSehat AI
      </span>
      <div className="animate-fade-up max-w-[85%] rounded-2xl rounded-bl-md bg-[color:var(--color-clinic-blue-soft)]/60 px-3 py-2 text-[11px] text-[color:var(--color-clinic-ink)]">
        Bagian tubuh mana yang terasa sakit?
      </div>
      <div className="animate-fade-up ml-auto flex max-w-[85%] items-center gap-1.5 rounded-2xl rounded-br-md bg-[color:var(--color-clinic-blue)] px-3 py-2 text-[11px] text-white">
        <Bone className="h-3 w-3 shrink-0" />
        Kepala, sejak 2 hari
      </div>
      {!showReply ? (
        <div className="flex max-w-[85%] items-center gap-1.5 rounded-2xl rounded-bl-md bg-[color:var(--color-clinic-blue-soft)]/60 px-3 py-2 text-[11px] text-[color:var(--color-clinic-muted)]">
          <span className="animate-bounce">•</span>
          <span className="animate-bounce [animation-delay:150ms]">•</span>
          <span className="animate-bounce [animation-delay:300ms]">•</span>
          <span className="sr-only">AI sedang mengetik</span>
        </div>
      ) : (
        <div className="animate-fade-up max-w-[85%] rounded-2xl rounded-bl-md bg-[color:var(--color-clinic-blue-soft)]/60 px-3 py-2 text-[11px] text-[color:var(--color-clinic-ink)]">
          Baik, apakah disertai demam atau mual?
        </div>
      )}
      <div
        className="animate-fade-up mt-auto flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-[10px] text-[color:var(--color-clinic-muted)]"
        style={{ animationDuration: "0.4s", animationDelay: "0.45s" }}
      >
        Tulis gejala atau pertanyaanmu...
      </div>
    </div>
  );
}

function AnatomyScreen() {
  const hotspots = [
    { x: 50, y: 16, active: false },
    { x: 50, y: 40, active: true },
    { x: 38, y: 62, active: false },
    { x: 62, y: 62, active: false },
  ];
  const symptoms = [
    { label: "Nyeri dada", checked: true },
    { label: "Sesak napas", checked: true },
    { label: "Jantung berdebar", checked: false },
  ];

  return (
    <div className="flex flex-col gap-3">
      <span
        className="animate-fade-up inline-flex w-fit items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-2.5 py-1 text-[10px] font-semibold text-[color:var(--color-clinic-blue-dark)]"
        style={{ animationDuration: "0.4s" }}
      >
        <Activity className="h-3 w-3" /> 1 · Pilih Bagian Tubuh
      </span>

      <div
        className="animate-fade-up relative h-[150px] rounded-2xl bg-[color:var(--color-clinic-blue-soft)]/40"
        style={{ animationDuration: "0.4s", animationDelay: "0.1s" }}
      >
        {/* Minimal body silhouette */}
        <svg
          viewBox="0 0 100 150"
          className="absolute inset-0 h-full w-full opacity-70"
          fill="none"
        >
          <circle cx="50" cy="16" r="10" fill="var(--color-clinic-blue)" fillOpacity="0.15" />
          <path
            d="M32 42c0-10 8-16 18-16s18 6 18 16v34c0 6-3 10-8 12l2 48h-24l2-48c-5-2-8-6-8-12z"
            fill="var(--color-clinic-blue)"
            fillOpacity="0.12"
          />
        </svg>
        {hotspots.map((h, i) => (
          <span
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
          >
            {h.active && (
              <span className="absolute inset-0 -m-1.5 animate-ping rounded-full bg-[color:var(--color-clinic-blue)]/40" />
            )}
            <CircleDot
              className={`relative h-4 w-4 ${
                h.active
                  ? "text-[color:var(--color-clinic-blue)]"
                  : "text-[color:var(--color-clinic-blue)]/40"
              }`}
              strokeWidth={h.active ? 2.5 : 2}
            />
          </span>
        ))}
      </div>

      <div
        className="animate-fade-up flex flex-col gap-1.5"
        style={{ animationDuration: "0.4s", animationDelay: "0.2s" }}
      >
        <p className="text-[10px] font-semibold text-[color:var(--color-clinic-ink)]">
          Gejala di area Dada:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {symptoms.map((s) => (
            <span
              key={s.label}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                s.checked
                  ? "border-[color:var(--color-clinic-blue)] bg-[color:var(--color-clinic-blue)] text-white"
                  : "border-black/10 text-[color:var(--color-clinic-muted)]"
              }`}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div
        className="animate-fade-up mt-auto flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-clinic-blue)] py-2.5 text-[11px] font-semibold text-white"
        style={{ animationDuration: "0.4s", animationDelay: "0.3s" }}
      >
        <Sparkles className="h-3 w-3" /> Lihat Analisis AI
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
      className="relative w-full overflow-hidden bg-white px-5 py-14 sm:px-6 md:px-8 md:py-20 lg:px-10"
    >
      <span className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[color:var(--color-clinic-blue)]/[0.06] blur-3xl" />
      <span className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[color:var(--color-clinic-blue)]/[0.06] blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <Reveal className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-3 py-1 text-xs uppercase tracking-[0.25em] text-[color:var(--color-clinic-blue)]">
              <Sparkles className="h-3 w-3" />
              Titik Fokus Kami
            </span>
            <h2 className="mt-4 max-w-xl font-display text-4xl font-extrabold leading-tight tracking-tight text-[color:var(--color-clinic-ink)] md:text-5xl">
              Tiga cara mengenal tubuhmu,{" "}
              <span className="text-[color:var(--color-clinic-blue)]">satu tujuan</span>
            </h2>
          </div>
          <p className="max-w-[240px] text-sm leading-relaxed text-[color:var(--color-clinic-muted)]">
            Sama-sama diproses AI, sama-sama gratis dicoba — tinggal pilih yang paling nyaman
            buatmu.
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
          <div className="mx-auto grid w-full max-w-3xl grid-cols-3 gap-1.5 rounded-2xl border border-black/10 bg-white p-2.5 shadow-[var(--shadow-clinic)] sm:p-3">
            {(Object.keys(TAB_COPY) as Tab[]).map((key) => {
              const isActive = key === tab;
              const c = TAB_COPY[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className="relative min-w-0 rounded-xl px-2 py-3 text-center text-xs font-semibold transition sm:px-5 sm:text-sm"
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

          <div className="mx-auto mt-10 grid max-w-5xl items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
            <div
              key={`copy-${tab}`}
              className="animate-fade-up order-2 translate-x-4 pl-4 sm:translate-x-8 sm:pl-8 lg:order-1 lg:translate-x-12 lg:pl-10"
            >
              <h3 className="font-display text-2xl font-extrabold text-[color:var(--color-clinic-ink)] md:text-3xl">
                {copy.label}
              </h3>
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--color-clinic-blue)]">
                  Cara menggunakan
                </p>
                <ol className="mt-3 flex list-none flex-col gap-3 pl-0">
                  {copy.steps.map((step, index) => (
                    <li
                      key={step}
                      className="flex items-start gap-3 text-sm leading-relaxed text-[color:var(--color-clinic-muted)]"
                    >
                      <span
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: copy.accentDim }}
                      >
                        {index + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
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
      </div>
    </section>
  );
}
