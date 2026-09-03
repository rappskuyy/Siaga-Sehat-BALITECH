import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity,
  Bot,
  Home,
  MapPin,
  ScanLine,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export function NotFoundView() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-[#f7f4ee] px-4 py-8 font-sans sm:px-6 md:py-12">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-[color:var(--color-clinic-blue)]/10 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-[#2ee6c4]/10 blur-3xl sm:h-96 sm:w-96" />
      </div>

      {/* Top Header Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <BrandLogo size="sm" />
      </motion.div>

      {/* Central 404 Card */}
      <div className="relative z-10 my-auto flex w-full max-w-xl flex-col items-center text-center">

        {/* 404 Number with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue)]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[color:var(--color-clinic-blue)]">
            <Activity className="h-3.5 w-3.5" /> Error 404 | Not Found
          </span>
          <h1 className="mt-3 font-display text-7xl font-extrabold tracking-tight text-[color:var(--color-clinic-ink)] sm:text-8xl md:text-9xl">
            4<span className="text-[color:var(--color-clinic-blue)]">0</span>4
          </h1>
        </motion.div>

        {/* Title & Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-2"
        >
          <h2 className="font-display text-2xl font-bold text-[color:var(--color-clinic-ink)] sm:text-3xl">
            Diagnosis: Halaman Tidak Ditemukan
          </h2>
          <p className="mx-auto mt-3 max-w-md text-xs sm:text-sm leading-relaxed text-[color:var(--color-clinic-muted)]">
            Halaman atau tautan kesehatan yang Anda tuju mungkin telah dipindahkan, dihapus, atau sedang dalam perawatan sistem.
          </p>
        </motion.div>

        {/* Primary CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:var(--color-clinic-blue)]/25 transition-all duration-200 hover:bg-[color:var(--color-clinic-blue-dark)] hover:scale-105"
          >
            <Home className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            Kembali ke Beranda
          </Link>
        </motion.div>

        {/* Quick Service Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-10 w-full"
        >
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[color:var(--color-clinic-muted)]">
            Atau akses layanan utama kami:
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <Link
              to="/consultation"
              className="flex items-center gap-2.5 rounded-2xl border border-black/5 bg-white p-3 text-left shadow-2xs transition-all duration-200 hover:border-[color:var(--color-clinic-blue)]/30 hover:shadow-sm hover:scale-[1.02]"
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
                <Bot className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-[color:var(--color-clinic-ink)]">Konsultasi AI</div>
                <div className="truncate text-[10px] text-[color:var(--color-clinic-muted)]">Tanya dokter virtual</div>
              </div>
            </Link>

            <Link
              to="/scanner"
              className="flex items-center gap-2.5 rounded-2xl border border-black/5 bg-white p-3 text-left shadow-2xs transition-all duration-200 hover:border-[color:var(--color-clinic-blue)]/30 hover:shadow-sm hover:scale-[1.02]"
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <ScanLine className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-[color:var(--color-clinic-ink)]">Scan Penyakit</div>
                <div className="truncate text-[10px] text-[color:var(--color-clinic-muted)]">Deteksi gejala AI</div>
              </div>
            </Link>

            <Link
              to="/maps"
              className="flex items-center gap-2.5 rounded-2xl border border-black/5 bg-white p-3 text-left shadow-2xs transition-all duration-200 hover:border-[color:var(--color-clinic-blue)]/30 hover:shadow-sm hover:scale-[1.02]"
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-[color:var(--color-clinic-ink)]">Peta Faskes</div>
                <div className="truncate text-[10px] text-[color:var(--color-clinic-muted)]">RS & Apotek terdekat</div>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer copyright */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 mt-8 text-center text-xs text-[color:var(--color-clinic-muted)]/70"
      >
        © {new Date().getFullYear()} Siaga Sehat | Peduli Kesehatan Anda
      </motion.p>
    </main>
  );
}
