import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Github, Linkedin, MessageCircle, Twitter } from "lucide-react";
import { Reveal } from "./Reveal";
import { BrandLogo } from "@/components/ui/BrandLogo";

const SERVICE_LINKS = [
  { label: "Beranda", path: "/" },
  { label: "Konsultasi Medis AI", path: "/consultation" },
  { label: "Scan Penyakit", path: "/scanner" },
  { label: "Visual Penyakit", path: "/anatomy" },
  { label: "Peta Faskes", path: "/maps" },
  { label: "Pengingat Obat", path: "/reminders" },
];

const ACCOUNT_LINKS = [
  { label: "Tim Pengembang", path: "/dev" },
  { label: "Profile", path: "/profile" },
  { label: "Login", path: "/login" },
  { label: "Register", path: "/register" },
];

const SOCIALS = [
  { icon: MessageCircle, label: "Discord", href: "#" },
  { icon: Twitter, label: "X", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Github, label: "GitHub", href: "https://github.com" },
];

const BRAND_NAME = "Siaga Sehat";

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer id="contact" className="w-full bg-[#f7f4ee] px-3 pb-4 pt-8 sm:px-4 md:px-8 md:pb-2 md:pt-10">
      <Reveal className="relative overflow-hidden rounded-[24px] bg-white p-3 shadow-[var(--shadow-clinic)] sm:p-4 md:rounded-[28px] md:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_1.1fr]">
          {/* Brand card */}
          <div className="relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-[22px] bg-gradient-to-br from-[color:var(--color-clinic-blue)] to-[color:var(--color-clinic-blue-dark)] p-5 text-white sm:min-h-[240px] sm:p-6">
            <div className="hex-pattern absolute inset-0 opacity-40" />

            <div className="relative inline-block w-fit">
              <BrandLogo inverted />
            </div>

            <div className="relative">
              <p className="font-display text-xl font-bold leading-snug">
                Layanan kesehatan cerdas,
                <br />
                <span className="font-medium text-white/80">didukung AI medis.</span>
              </p>
            </div>

            <div className="relative">
              <p className="mb-3 text-xs font-medium text-white/70">Ikuti Kami</p>
              <div className="flex flex-wrap items-center gap-2">
                {SOCIALS.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-lg bg-black/25 text-white transition hover:-translate-y-0.5 hover:bg-black/40"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 gap-3 px-0 py-2 sm:gap-4 sm:px-1 md:px-4">
            <div>
              <p className="font-display text-sm font-bold text-[color:var(--color-clinic-ink)]">
                Navigasi
              </p>
              <ul className="mt-4 space-y-2.5">
                {SERVICE_LINKS.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-xs font-medium text-[color:var(--color-clinic-muted)] transition hover:text-[color:var(--color-clinic-blue)] sm:text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-display text-sm font-bold text-[color:var(--color-clinic-ink)]">
                Informasi & Akun
              </p>
              <ul className="mt-4 space-y-2.5">
                {ACCOUNT_LINKS.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-xs font-medium text-[color:var(--color-clinic-muted)] transition hover:text-[color:var(--color-clinic-blue)] sm:text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col justify-center rounded-[22px] bg-[color:var(--color-clinic-blue-soft)]/50 p-4 sm:p-5 md:p-6">
            <p className="font-display text-base font-bold leading-snug text-[color:var(--color-clinic-ink)] sm:text-lg">
              Inovasi Kesehatan AI.
              <br />
              Tetap terhubung dengan {BRAND_NAME}.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEmail("");
              }}
              className="mt-4 flex flex-col gap-2 rounded-[20px] bg-white p-2 shadow-sm ring-1 ring-black/5 sm:flex-row sm:items-center"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                className="min-w-0 flex-1 rounded-full bg-transparent px-3 py-2.5 text-sm text-[color:var(--color-clinic-ink)] outline-none placeholder:text-[color:var(--color-clinic-muted)]"
              />
              <button
                type="submit"
                className="group inline-flex items-center justify-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[color:var(--color-clinic-blue-dark)]"
              >
                Langganan
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-black/5 pt-4 text-center text-[11px] text-[color:var(--color-clinic-muted)] sm:flex-row sm:text-left sm:text-xs">
          <span>
            © {new Date().getFullYear()} {BRAND_NAME}. Hak Cipta Dilindungi Undang-Undang.
          </span>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/dev" className="transition hover:text-[color:var(--color-clinic-blue)]">
              Tim Pengembang
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link to="/" className="transition hover:text-[color:var(--color-clinic-blue)]">
              SiagaSehat BALITECH
            </Link>
          </div>
        </div>

        {/* Giant watermark wordmark */}
        <div className="pointer-events-none -mb-6 -mt-2 select-none overflow-hidden text-center leading-none">
          <span className="font-display text-[clamp(2.75rem,13vw,140px)] font-extrabold tracking-tight text-[color:var(--color-clinic-ink)]/[0.06]">
            {BRAND_NAME}
          </span>
        </div>
      </Reveal>
    </footer>
  );
}

