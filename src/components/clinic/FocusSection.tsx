import { useState } from "react";
import {
  ArrowRight,
  Bone,
  Camera,
  ClipboardCheck,
  Leaf,
  MessageCircleHeart,
  PersonStanding,
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

type Tab = "scan" | "anatomi" | "konsultasi";

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
  anatomi: {
    label: "Cek Anatomi",
    bullets: [
      "Pilih bagian tubuh yang terasa tidak nyaman",
      "Kenali area dan kemungkinan keluhan secara visual",
      "Lanjutkan langsung ke Konsultasi AI",
    ],
    cta: "Cek Anatomi",
    to: "/anatomy",
    accent: "var(--color-clinic-blue)",
    accentDim: "var(--color-clinic-blue-dark)",
  },
};

function PhoneMockup({ tab }: { tab: Tab }) {
  return (
    <div className="animate-phone-float relative mx-auto w-[260px]">
      {/* Ambient glow behind the device */}
      <div
        className="pointer-events-none absolute inset-x-6 top-10 -z-10 h-[420px] rounded-[3rem] blur-3xl transition-colors duration-500"
        style={{
          backgroundColor: tab === "scan" ? "rgba(46,230,196,0.18)" : "rgba(160,139,255,0.18)",
        }}
      />

      {/* Titanium-style outer frame */}
      <div className="relative rounded-[2.6rem] bg-gradient-to-br from-[#3a3d44] via-[#111318] to-[#050608] p-[3px] shadow-[0_35px_70px_rgba(17,17,17,0.35)]">
        <div className="rounded-[2.5rem] bg-gradient-to-b from-[#0c0d10] to-[#1a1c21] p-2">
          {/* Screen */}
          <div className="relative overflow-hidden rounded-[2rem] bg-white">
            {/* Dynamic island */}
            <div className="absolute left-1/2 top-2.5 z-30 h-6 w-24 -translate-x-1/2 rounded-full bg-[color:var(--color-clinic-ink)]" />

            {/* Glass sheen */}
            <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-white/25 via-transparent to-transparent" />

            <div key={tab} className="animate-fade-up min-h-[420px] px-4 pb-6 pt-11">
              {tab === "scan" ? <ScanScreen /> : tab === "anatomi" ? <AnatomyScreen /> : <ConsultScreen />}
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
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[color:var(--color-siaga-scan)]/12 px-2.5 py-1 text-[10px] font-semibold text-[color:var(--color-siaga-scan-dim)]">
        <ScanLine className="h-3 w-3" /> Analisis Selesai
      </span>
      <div className="flex items-center gap-3 rounded-2xl bg-[color:var(--color-clinic-blue-soft)]/60 p-3">
        <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full border-4 border-[color:var(--color-siaga-scan)]/25">
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
      <div className="flex flex-col gap-2 text-[11px] text-[color:var(--color-clinic-muted)]">
        <p className="font-semibold text-[color:var(--color-clinic-ink)]">Kemungkinan penyebab:</p>
        <p>• Reaksi alergi ringan pada kulit</p>
        <p>• Gesekan atau iritasi bahan tekstil</p>
      </div>
      <div className="mt-auto flex items-center gap-2 rounded-2xl bg-[color:var(--color-siaga-scan)]/8 p-2.5">
        <Leaf className="h-4 w-4 shrink-0 text-[color:var(--color-siaga-scan-dim)]" />
        <p className="text-[10px] leading-snug text-[color:var(--color-clinic-ink)]">
          Kompres dingin & hindari sabun beraroma kuat
        </p>
      </div>
    </div>
  );
}

function ConsultScreen() {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[color:var(--color-siaga-consult)]/12 px-2.5 py-1 text-[10px] font-semibold text-[color:var(--color-siaga-consult-dim)]">
        <MessageCircleHeart className="h-3 w-3" /> SiagaSehat AI
      </span>
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-[color:var(--color-clinic-blue-soft)]/60 px-3 py-2 text-[11px] text-[color:var(--color-clinic-ink)]">
        Bagian tubuh mana yang terasa sakit?
      </div>
      <div className="ml-auto flex max-w-[85%] items-center gap-1.5 rounded-2xl rounded-br-md bg-[color:var(--color-siaga-consult)] px-3 py-2 text-[11px] text-white">
        <Bone className="h-3 w-3 shrink-0" /> Kepala, sejak 2 hari
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-[color:var(--color-clinic-blue-soft)]/60 px-3 py-2 text-[11px] text-[color:var(--color-clinic-ink)]">
        Baik, apakah disertai demam atau mual?
      </div>
      <div className="mt-auto flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-[10px] text-[color:var(--color-clinic-muted)]">
        Tulis gejala atau pertanyaanmu...
      </div>
    </div>
  );
}

function AnatomyScreen() {
  return (
    <div className="flex flex-col gap-3">
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue)]/10 px-2.5 py-1 text-[10px] font-semibold text-[color:var(--color-clinic-blue-dark)]">
        <PersonStanding className="h-3 w-3" /> Cek Anatomi
      </span>
      <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-[color:var(--color-clinic-blue-soft)]">
        <span className="absolute h-24 w-24 rounded-full border border-[color:var(--color-clinic-blue)]/20" />
        <span className="absolute h-32 w-32 rounded-full border border-dashed border-[color:var(--color-clinic-blue)]/20" />
        <PersonStanding className="relative h-32 w-32 text-[color:var(--color-clinic-blue)]" strokeWidth={1.2} />
        <span className="absolute left-1/2 top-10 h-3 w-3 -translate-x-1/2 rounded-full bg-[color:var(--color-siaga-scan)] shadow-[0_0_0_5px_rgba(46,230,196,0.2)]" />
        <span className="absolute bottom-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[color:var(--color-clinic-blue-dark)] shadow-sm">Kepala dipilih</span>
      </div>
      <div className="rounded-2xl border border-[color:var(--color-clinic-blue)]/15 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-clinic-muted)]">Area keluhan</p>
        <p className="mt-1 text-xs font-bold text-[color:var(--color-clinic-ink)]">Kepala dan leher</p>
        <p className="mt-1 text-[10px] leading-relaxed text-[color:var(--color-clinic-muted)]">Pilih area lain atau ceritakan keluhanmu.</p>
      </div>
      <div className="mt-auto flex items-center justify-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue)] px-3 py-2 text-[10px] font-semibold text-white">
        Lanjut konsultasi <ArrowRight className="h-3 w-3" />
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
