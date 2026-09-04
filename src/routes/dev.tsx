import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Code2,
  Database,
  Cpu,
  Palette,
  Terminal,
  Globe,
  Server,
  Sparkles,
  Github,
  Linkedin,
  Heart,
  Zap,
  GraduationCap,
  School,
  Award,
  SparkleIcon,
  Info,
  Stethoscope,
  Eye,
  Activity,
  MapPin,
  Bell,
  ShieldCheck,
  Target,
  Lightbulb,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/clinic/Footer";

export const Route = createFileRoute("/dev")({
  head: () => ({
    meta: [
      { title: "Tim Pengembang | Siaga Sehat" },
      {
        name: "description",
        content:
          "Mengenal tim pengembang di balik platform kesehatan digital Siaga Sehat.",
      },
    ],
  }),
  component: DevPage,
});

const TEAM_MEMBERS = [
  {
    name: "Raffasya Javas Niscala Widjaja",
    role: "Lead Developer & System Architect & UI/UX",
    specialty: "Fullstack Architecture & AI Integration",
    skills: ["React 19", "Vite", "AI Integration", "TypeScript"],
    bio: "Merancang arsitektur sistem SiagaSehat, mengembangkan fitur utama dan integrasi AI, serta merancang antarmuka yang responsif, intuitif, dan adaptif terhadap kebutuhan pengguna.",
    icon: Terminal,
    avatar: "https://dvtakououwyiejsudzey.supabase.co/storage/v1/object/sign/img/Raffasya%20Javas%20Niscala%20Widjaja.avif?token=eyJraWQiOiIzMmU4MWVjMy0wZWQzLTQ1N2EtYmQ3Yi04ZmE4YTU4YzUwM2YiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWcvUmFmZmFzeWEgSmF2YXMgTmlzY2FsYSBXaWRqYWphLmF2aWYiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg4MjI3NzAyLCJleHAiOjE4MTk3NjM3MDJ9.HIn4-zAuQTHyk4wTnhzjkyE54v1QpsW72CDghC1GaYg",
    gradient: "from-blue-600 to-indigo-700",
    accent: "#4a6fa5",
  },
  {
    name: "Ahmad Rhezki Prasetya",
    role: "UI/UX & Frontend Engineer",
    specialty: "Responsive Styling & Motion Design",
    skills: ["Tailwind CSS", "Framer Motion", "Responsive Layouts", "Aesthetics"],
    bio: "Berfokus menghadirkan estetika premium, transisi dinamis (SlideTabs), serta kegunaan tata letak di segala perangkat display.",
    icon: Palette,
    avatar: "https://dvtakououwyiejsudzey.supabase.co/storage/v1/object/sign/img/Ahmad%20Rhezki%20Prasetya.avif?token=eyJraWQiOiIzMmU4MWVjMy0wZWQzLTQ1N2EtYmQ3Yi04ZmE4YTU4YzUwM2YiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWcvQWhtYWQgUmhlemtpIFByYXNldHlhLmF2aWYiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg4MjI3NzgxLCJleHAiOjE4MTk3NjM3ODF9.uR1PPi7HtQUaEIJ9fvWg7xhQOh8XttTFQEn6cYOaKV8",
    gradient: "from-emerald-500 to-teal-600",
    accent: "#17a690",
  },
  {
    name: "Muhamad Fedliansyah Ilham",
    role: "Backend & Database Engineer",
    specialty: "Data Pipeline & Infrastructure",
    skills: ["Supabase", "PostgreSQL", "API Security", "Patient Data Flow"],
    bio: "Mengelola keandalan data klinis, infrastruktur autentikasi aman, serta performa pertukaran data triase medis.",
    icon: Database,
    avatar: "https://dvtakououwyiejsudzey.supabase.co/storage/v1/object/sign/img/Muhamad%20Fedliansyah%20Ilham.avif?token=eyJraWQiOiIzMmU4MWVjMy0wZWQzLTQ1N2EtYmQ3Yi04ZmE4YTU4YzUwM2YiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWcvTXVoYW1hZCBGZWRsaWFuc3lhaCBJbGhhbS5hdmlmIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4ODIyNzc2NiwiZXhwIjoxODE5NzYzNzY2fQ.6TKpgDEEZ5tktyEv_ZB-WkIcPda0jjbc3rYtlDEPPv4",
    gradient: "from-violet-600 to-purple-700",
    accent: "#35517d",
  },
];

const TECH_STACK = [
  { name: "React 19", sub: "Vite + UI", icon: Code2 },
  { name: "TypeScript", sub: "DX & Safety", icon: Terminal },
  { name: "TanStack", sub: "Router + Start", icon: Server },
  { name: "Tailwind", sub: "Design System", icon: Palette },
  { name: "Framer", sub: "Motion", icon: Sparkles },
  { name: "Supabase", sub: "Auth + DB", icon: Database },
  { name: "PostgreSQL", sub: "Relational data", icon: Database },
  { name: "Gemini API", sub: "AI Vision", icon: Cpu },
  { name: "OpenAI / GPT", sub: "LLM inference", icon: Cpu },
  { name: "Leaflet", sub: "Interactive Maps", icon: Globe },
  { name: "Cloudflare", sub: "Deployment", icon: Server },
  { name: "Bun", sub: "Runtime", icon: Zap },
];

const TECH_STACK_MARQUEE = [...TECH_STACK, ...TECH_STACK];

import type { Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

function DevPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f4ee] font-sans flex flex-col justify-between">
      <div>
        <SiteHeader />

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-14 lg:px-8">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 md:mb-12"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[color:var(--color-clinic-ink)] shadow-2xs border border-black/5 hover:shadow-sm transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Beranda
            </Link>
          </motion.div>

          {/* Hero heading */}
          <div className="mb-16 md:mb-20 relative">
            {/* Decorative blurs */}
            <span className="pointer-events-none absolute -left-20 -top-10 h-56 w-56 rounded-full bg-[color:var(--color-clinic-blue)]/[0.06] blur-3xl" />
            <span className="pointer-events-none absolute -right-20 top-0 h-48 w-48 rounded-full bg-emerald-400/[0.06] blur-3xl" />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative text-center"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue)]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--color-clinic-blue)]">
                <Heart className="h-3 w-3" />
                SIAGA SEHAT DEV TEAM
              </span>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-[color:var(--color-clinic-ink)] sm:text-5xl md:text-6xl mt-5 leading-[1.1]">
                Di Balik Layar
                <br />
                <span className="text-[color:var(--color-clinic-blue)]">SiagaSehat</span>
              </h1>
              <p className="mt-5 mx-auto max-w-lg text-sm md:text-base text-[color:var(--color-clinic-muted)] leading-relaxed">
                Inovasi rekayasa perangkat lunak, keindahan visual, dan kecerdasan
                buatan, mempermudah triase kesehatan awal bagi masyarakat Indonesia.
              </p>
            </motion.div>
          </div>

          {/* School & Project Identity Showcase Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-14 rounded-3xl border border-black/5 bg-white p-6 sm:p-8 shadow-[var(--shadow-clinic)] relative overflow-hidden"
          >
            <span className="pointer-events-none absolute -right-10 -bottom-10 h-44 w-44 rounded-full bg-[color:var(--color-clinic-blue)]/10 blur-2xl" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start sm:items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] font-extrabold text-xl shadow-xs">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue)]/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-clinic-blue)]">
                    <Award className="h-3 w-3" /> Karya Pengembangan Perangkat Lunak & Gim ( PPLG )
                  </span>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[color:var(--color-clinic-ink)] mt-1">
                    Karya Inovasi Siswa SMK Wikrama Bogor
                  </h3>
                  <p className="text-xs sm:text-sm text-[color:var(--color-clinic-muted)] mt-1 max-w-xl leading-relaxed">
                    Aplikasi SiagaSehat merupakan proyek inovasi kesehatan digital yang dirancang dan dikembangkan oleh tim siswa bertalenta sebagai bagian dari wujud apresiasi rekayasa teknologi informasi dan kecerdasan buatan.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-[#f7f4ee] px-4 py-3 border border-black/5 w-full md:w-auto">
                <School className="h-5 w-5 text-[color:var(--color-clinic-blue)] shrink-0" />
                <div className="text-left">
                  <div className="text-[10px] text-[color:var(--color-clinic-muted)] font-medium">Sekolah</div>
                  <div className="text-xs font-bold text-[color:var(--color-clinic-ink)]">SMK Wikrama Bogor</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tentang Website / Platform Showcase Section */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16 rounded-[32px] border border-black/5 bg-white p-6 sm:p-10 shadow-[var(--shadow-clinic)] relative overflow-hidden"
          >
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[color:var(--color-clinic-blue)]">
                <Info className="h-3.5 w-3.5" /> Tentang Website & Platform
              </span>
              <h2 className="font-display text-2xl font-extrabold text-[color:var(--color-clinic-ink)] sm:text-3xl md:text-4xl mt-3 leading-tight">
                Mengenal Platform <span className="text-[color:var(--color-clinic-blue)]">SiagaSehat</span>
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-[color:var(--color-clinic-muted)] leading-relaxed">
                SiagaSehat adalah platform kesehatan digital terpadu yang memadukan keandalan <strong>Kecerdasan Buatan (AI)</strong> dengan <strong>pendekatan manusiawi</strong>. Platform ini hadir sebagai garda terdepan untuk pertolongan kesehatan awal, analisis gejala medis, dan navigasi fasilitas kesehatan yang aman, cepat, dan mudah diakses oleh seluruh lapisan masyarakat Indonesia.
              </p>
            </div>

            {/* Core Pillars / Mission */}
            <div className="grid gap-4 sm:grid-cols-3 mb-10">
              <div className="rounded-2xl bg-[#faf9f6] p-5 border border-black/[0.05] hover:border-[color:var(--color-clinic-blue)]/30 hover:bg-white transition-all">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] mb-3">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-[color:var(--color-clinic-ink)]">
                  Visi Triase Inklusif
                </h3>
                <p className="mt-1 text-xs text-[color:var(--color-clinic-muted)] leading-relaxed">
                  Memberikan akses pertolongan awal dan evaluasi keluhan kesehatan secara merata tanpa kendala waktu dan jarak.
                </p>
              </div>

              <div className="rounded-2xl bg-[#faf9f6] p-5 border border-black/[0.05] hover:border-[color:var(--color-clinic-blue)]/30 hover:bg-white transition-all">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] mb-3">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-[color:var(--color-clinic-ink)]">
                  Teknologi Berempati
                </h3>
                <p className="mt-1 text-xs text-[color:var(--color-clinic-muted)] leading-relaxed">
                  Menyajikan komunikasi responsif yang ramah dan menenangkan pasien saat menghadapi situasi kesehatan.
                </p>
              </div>

              <div className="rounded-2xl bg-[#faf9f6] p-5 border border-black/[0.05] hover:border-[color:var(--color-clinic-blue)]/30 hover:bg-white transition-all">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] mb-3">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-[color:var(--color-clinic-ink)]">
                  Keamanan & Privasi
                </h3>
                <p className="mt-1 text-xs text-[color:var(--color-clinic-muted)] leading-relaxed">
                  Menjaga kerahasiaan data medis dan data pribadi pengguna dengan enkripsi serta standar infrastruktur aman.
                </p>
              </div>
            </div>

            {/* Fitur Utama Ekosistem Grid */}
            <div className="border-t border-black/5 pt-8">
              <h3 className="font-display text-center text-lg font-bold text-[color:var(--color-clinic-ink)] mb-6">
                Ekosistem Fitur Utama SiagaSehat
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-start gap-3 rounded-2xl border border-black/[0.05] bg-white p-4 transition-all hover:border-[color:var(--color-clinic-blue)]/30 hover:shadow-xs">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[color:var(--color-clinic-ink)]">Konsultasi AI Medis 24/7</h4>
                    <p className="mt-0.5 text-[11px] text-[color:var(--color-clinic-muted)] leading-normal">
                      Tanya jawab langsung dengan AI responsif untuk rekomendasi awal dan pertolongan pertama.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-black/[0.05] bg-white p-4 transition-all hover:border-[color:var(--color-clinic-blue)]/30 hover:shadow-xs">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[color:var(--color-clinic-ink)]">Scan Penyakit Visual (AI Vision)</h4>
                    <p className="mt-0.5 text-[11px] text-[color:var(--color-clinic-muted)] leading-normal">
                      Analisis citra visual fisik untuk mendeteksi indikasi kondisi kulit dan keluhan luar secara cepat.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-black/[0.05] bg-white p-4 transition-all hover:border-[color:var(--color-clinic-blue)]/30 hover:shadow-xs">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[color:var(--color-clinic-ink)]">Visualisasi Anatomi Interaktif</h4>
                    <p className="mt-0.5 text-[11px] text-[color:var(--color-clinic-muted)] leading-normal">
                      Panduan eksplorasi anatomi tubuh 3D/2D untuk memahami titik gangguan kesehatan.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-black/[0.05] bg-white p-4 transition-all hover:border-[color:var(--color-clinic-blue)]/30 hover:shadow-xs">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[color:var(--color-clinic-ink)]">Peta Faskes & Rujukan</h4>
                    <p className="mt-0.5 text-[11px] text-[color:var(--color-clinic-muted)] leading-normal">
                      Pencarian lokasi rumah sakit, puskesmas, apotek terdekat dengan rute navigasi presisi.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-black/[0.05] bg-white p-4 transition-all hover:border-[color:var(--color-clinic-blue)]/30 hover:shadow-xs sm:col-span-2 lg:col-span-2">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[color:var(--color-clinic-ink)]">Pengingat Obat & Dosis Medis</h4>
                    <p className="mt-0.5 text-[11px] text-[color:var(--color-clinic-muted)] leading-normal">
                      Sistem pengingat konsumsi obat berkala untuk menjaga kepatuhan dan jadwal pengobatan pasien.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fast Stats Bar */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl bg-[#f7f4ee] p-4 text-center border border-black/5">
              <div>
                <div className="font-display text-lg sm:text-xl font-black text-[color:var(--color-clinic-blue-dark)]">24/7</div>
                <div className="text-[10px] sm:text-xs font-medium text-[color:var(--color-clinic-muted)]">Respon AI Medis</div>
              </div>
              <div>
                <div className="font-display text-lg sm:text-xl font-black text-[color:var(--color-clinic-blue-dark)] inline-flex items-center justify-center gap-1.5">
                  <Zap className="h-4 w-4 text-[color:var(--color-clinic-blue-dark)] fill-[color:var(--color-clinic-blue-dark)]" />
                  <span>Fast</span>
                </div>
                <div className="text-[10px] sm:text-xs font-medium text-[color:var(--color-clinic-muted)]">Analisis Real-time</div>
              </div>
              <div>
                <div className="font-display text-lg sm:text-xl font-black text-[color:var(--color-clinic-blue-dark)]">100%</div>
                <div className="text-[10px] sm:text-xs font-medium text-[color:var(--color-clinic-muted)]">Akses Edukasi Gratis</div>
              </div>
              <div>
                <div className="font-display text-lg sm:text-xl font-black text-[color:var(--color-clinic-blue-dark)]">BALITECH</div>
                <div className="text-[10px] sm:text-xs font-medium text-[color:var(--color-clinic-muted)]">Ajang Inovasi 2026</div>
              </div>
            </div>
          </motion.div>

          {/* Developer Cards — Bento-style grid */}
          <div className="grid gap-5 md:grid-cols-3">
            {TEAM_MEMBERS.map((member, i) => {
              const Icon = member.icon;
              return (
                <motion.div
                  key={member.name}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  className="group relative flex flex-col rounded-[24px] border border-black/[0.04] bg-white shadow-[var(--shadow-clinic)] transition-shadow hover:shadow-[var(--shadow-clinic-lg)]"
                >
                  {/* Gradient header strip */}
                  <div className={`relative h-28 rounded-t-[24px] bg-gradient-to-br ${member.gradient} overflow-hidden`}>
                    {/* Animated geometric decoration */}
                    <div className="absolute inset-0 opacity-25">
                      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full border-[3px] border-white/30" />
                      <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full border-[3px] border-white/25" />
                      <div className="absolute left-6 bottom-3 h-8 w-8 rounded-lg rotate-45 border-2 border-white/25" />
                    </div>

                    {/* Specialty tag */}
                    <span className="absolute right-4 top-4 rounded-full bg-white/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                      {member.specialty.split(" & ")[0]}
                    </span>
                  </div>

                  {/* Photo avatar — positioned outside the gradient so it won't clip */}
                  <div className="absolute left-6 top-[112px] -translate-y-1/2 z-10 h-16 w-16 rounded-2xl overflow-hidden bg-white shadow-lg border-[3px] border-white transition-transform duration-300 group-hover:scale-110">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Card body */}
                  <div className="flex flex-1 flex-col p-6 pt-12">
                    <h2 className="font-display text-xl font-extrabold text-[color:var(--color-clinic-ink)]">
                      {member.name}
                    </h2>
                    <p className="mt-0.5 text-xs font-semibold text-slate-700">
                      {member.role}
                    </p>

                    <p className="mt-4 flex-1 text-[13px] leading-relaxed text-slate-600">
                      {member.bio}
                    </p>

                    {/* Skills */}
                    <div className="mt-6 flex flex-wrap gap-1.5">
                      {member.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Social links */}
                    <div className="mt-5 flex items-center gap-2 border-t border-black/5 pt-4">
                      <a
                        href="#"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-[color:var(--color-clinic-blue)] hover:text-white transition-all duration-200"
                        title="GitHub"
                      >
                        <Github className="h-3.5 w-3.5" />
                      </a>
                      <a
                        href="#"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-[color:var(--color-clinic-blue)] hover:text-white transition-all duration-200"
                        title="LinkedIn"
                      >
                        <Linkedin className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Tech Stack Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-20 md:mt-28"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                <Zap className="h-3 w-3" />
                Technology Stack
              </div>
              <h2 className="font-display text-2xl font-bold text-[color:var(--color-clinic-ink)] sm:text-3xl">
                Arsitektur & Teknologi
              </h2>
              <p className="mt-2 text-sm text-[color:var(--color-clinic-muted)]">
                Perkakas modern yang mendukung keandalan platform SiagaSehat.
              </p>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/80 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-sm">
              <div className="flex min-w-max gap-3 motion-safe:animate-[tech-scroll_24s_linear_infinite]">
                {TECH_STACK_MARQUEE.map((tech, i) => {
                  const Icon = tech.icon;
                  return (
                    <motion.div
                      key={`${tech.name}-${i}`}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (i % TECH_STACK.length) * 0.04, duration: 0.35 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="group flex min-w-[170px] flex-col items-center text-center rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm transition-all duration-200 hover:border-sky-200 hover:bg-white"
                    >
                      <div className="mb-2.5 grid h-10 w-10 place-items-center rounded-xl bg-sky-100 text-sky-700 transition-colors duration-200 group-hover:bg-[color:var(--color-clinic-blue)] group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-xs font-bold leading-tight text-slate-800">
                        {tech.name}
                      </h3>
                      <p className="mt-0.5 text-[10px] text-slate-500">{tech.sub}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
