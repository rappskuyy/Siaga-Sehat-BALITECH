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
];

const ACCOUNT_LINKS = [
  { label: "Tim Pengembang", path: "/dev" },
  { label: "Profile", path: "/profile" },
  { label: "Login", path: "/login" },
  { label: "Register", path: "/register" },
];

const SOCIALS = [
  { icon: MessageCircle, label: "Whatsapp", href: "https://wa.me/6285770485228" },
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/school/smkwikramabogor" },
  { icon: Github, label: "GitHub", href: "https://github.com/rappskuyy/Siaga-Sehat-BALITECH" },
];

const BRAND_NAME = "Siaga Sehat";

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer id="contact" className="w-full bg-[#f7f4ee] px-2.5 pb-3 pt-4 sm:px-4 md:px-8 md:pb-2 md:pt-10">
      <Reveal className="relative overflow-hidden rounded-2xl sm:rounded-[28px] bg-white p-3 shadow-[var(--shadow-clinic)] sm:p-4 md:p-6">
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.1fr_1fr_1.1fr]">
          {/* Brand card */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-[22px] bg-gradient-to-br from-[color:var(--color-clinic-blue)] to-[color:var(--color-clinic-blue-dark)] p-3.5 sm:p-6 text-white min-h-0 sm:min-h-[240px]">
            <div className="hex-pattern absolute inset-0 opacity-40" />

            <div className="relative inline-block w-fit">
              <BrandLogo inverted />
            </div>

            <div className="relative my-2 sm:my-3">
              <p className="font-display text-xs sm:text-xl font-bold leading-snug">
                Layanan kesehatan cerdas,{" "}
                <span className="font-normal text-white/80">didukung AI medis.</span>
              </p>
            </div>

            <div className="relative">
              <p className="mb-1.5 text-[10px] sm:text-xs font-medium text-white/70">Ikuti Kami</p>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {SOCIALS.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="grid h-7 w-7 sm:h-9 sm:w-9 place-items-center rounded-lg bg-black/25 text-white transition hover:-translate-y-0.5 hover:bg-black/40"
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 gap-3 px-1 py-1 sm:gap-4 sm:px-1 md:px-4">
            <div>
              <p className="font-display text-xs sm:text-sm font-bold text-[color:var(--color-clinic-ink)]">
                Navigasi
              </p>
              <ul className="mt-2 sm:mt-4 space-y-1.5 sm:space-y-2.5">
                {SERVICE_LINKS.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-[11px] sm:text-sm font-medium text-[color:var(--color-clinic-muted)] transition hover:text-[color:var(--color-clinic-blue)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-display text-xs sm:text-sm font-bold text-[color:var(--color-clinic-ink)]">
                Informasi & Akun
              </p>
              <ul className="mt-2 sm:mt-4 space-y-1.5 sm:space-y-2.5">
                {ACCOUNT_LINKS.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-[11px] sm:text-sm font-medium text-[color:var(--color-clinic-muted)] transition hover:text-[color:var(--color-clinic-blue)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col justify-center rounded-xl sm:rounded-[22px] bg-[color:var(--color-clinic-blue-soft)]/50 p-3 sm:p-5 md:p-6">
            <p className="font-display text-xs sm:text-lg font-bold leading-snug text-[color:var(--color-clinic-ink)]">
              Inovasi Kesehatan AI.{" "}
              <span className="font-normal sm:font-bold">Tetap terhubung dengan {BRAND_NAME}.</span>
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEmail("");
              }}
              className="mt-2.5 sm:mt-4 flex flex-row items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-[20px] bg-white p-1 sm:p-2 shadow-sm ring-1 ring-black/5"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                className="min-w-0 flex-1 rounded-full bg-transparent px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-[color:var(--color-clinic-ink)] outline-none placeholder:text-[color:var(--color-clinic-muted)]"
              />
              <button
                type="submit"
                className="group inline-flex items-center justify-center gap-1 rounded-full bg-[color:var(--color-clinic-blue)] px-3 sm:px-4 py-1.5 sm:py-2.5 text-[11px] sm:text-sm font-medium text-white transition hover:bg-[color:var(--color-clinic-blue-dark)] cursor-pointer shrink-0"
              >
                <span>Langganan</span>
                <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition group-hover:translate-x-0.5" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-3.5 sm:mt-6 flex flex-col items-center justify-between gap-1.5 border-t border-black/5 pt-3 text-center text-[10px] sm:text-xs text-[color:var(--color-clinic-muted)] sm:flex-row sm:text-left">
          <span>
            © {new Date().getFullYear()} {BRAND_NAME}. Hak Cipta Dilindungi.
          </span>
          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link to="/dev" className="transition hover:text-[color:var(--color-clinic-blue)]">
              Tim Pengembang
            </Link>
            <span>•</span>
            <Link to="/" className="transition hover:text-[color:var(--color-clinic-blue)]">
              SiagaSehat BALITECH
            </Link>
          </div>
        </div>

        {/* Giant watermark wordmark */}
        <div className="pointer-events-none -mb-3 sm:-mb-6 mt-1 sm:-mt-2 select-none overflow-hidden text-center leading-none">
          <span className="font-display text-[clamp(1.75rem,10.5vw,140px)] font-extrabold tracking-tight text-[color:var(--color-clinic-ink)]/[0.06] block">
            {BRAND_NAME}
          </span>
        </div>
      </Reveal>
    </footer>
  );
}

