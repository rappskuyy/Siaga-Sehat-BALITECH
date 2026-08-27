import { useState } from "react";
import { ArrowRight, Github, Linkedin, MessageCircle, Twitter } from "lucide-react";
import { Reveal } from "./Reveal";

const NAV_LINKS = ["How it works", "Features", "Pricing", "Testimonials", "FAQ"];
const COMPANY_LINKS = ["Blog", "About", "Terms and Condition", "Privacy Policy"];
const SOCIALS = [
  { icon: MessageCircle, label: "Discord" },
  { icon: Twitter, label: "X" },
  { icon: Linkedin, label: "LinkedIn" },
  { icon: Github, label: "GitHub" },
];

const BRAND_NAME = "SiagaSehat";

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="w-full bg-[#f7f4ee] px-4 pb-2 pt-10 md:px-8">
      <Reveal className="relative overflow-hidden rounded-[28px] bg-white p-4 shadow-[var(--shadow-clinic)] md:p-6">
        <div className="grid gap-4 md:grid-cols-[1.1fr_1fr_1.1fr]">
          {/* Brand card */}
          <div className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-[22px] bg-gradient-to-br from-[color:var(--color-clinic-blue)] to-[color:var(--color-clinic-blue-dark)] p-6 text-white">
            <div className="hex-pattern absolute inset-0 opacity-40" />

            <div className="relative flex items-center gap-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white">
                <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-clinic-blue)]" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight">{BRAND_NAME}</span>
            </div>

            <div className="relative">
              <p className="font-display text-xl font-bold leading-snug">
                Smarter sales automation,
                <br />
                <span className="font-medium text-white/80">powered by AI.</span>
              </p>
            </div>

            <div className="relative">
              <p className="mb-3 text-xs font-medium text-white/70">Stay in touch!</p>
              <div className="flex items-center gap-2">
                {SOCIALS.map(({ icon: Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-lg bg-black/25 text-white transition hover:bg-black/40 hover:-translate-y-0.5"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 gap-4 px-2 py-2 md:px-4">
            <div>
              <p className="font-display text-sm font-bold text-[color:var(--color-clinic-ink)]">
                Navigation
              </p>
              <ul className="mt-4 space-y-3">
                {NAV_LINKS.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-[color:var(--color-clinic-muted)] transition hover:text-[color:var(--color-clinic-blue)]"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-display text-sm font-bold text-[color:var(--color-clinic-ink)]">
                Company
              </p>
              <ul className="mt-4 space-y-3">
                {COMPANY_LINKS.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-[color:var(--color-clinic-muted)] transition hover:text-[color:var(--color-clinic-blue)]"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col justify-center rounded-[22px] bg-[color:var(--color-clinic-blue-soft)]/50 p-6">
            <p className="font-display text-lg font-bold leading-snug text-[color:var(--color-clinic-ink)]">
              AI moves fast.
              <br />
              Stay ahead with {BRAND_NAME}.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEmail("");
              }}
              className="mt-4 flex items-center gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="min-w-0 flex-1 rounded-full bg-transparent px-3 py-2 text-sm text-[color:var(--color-clinic-ink)] outline-none placeholder:text-[color:var(--color-clinic-muted)]"
              />
              <button
                type="submit"
                className="group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:var(--color-clinic-blue-dark)]"
              >
                Subscribe
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-black/5 pt-4 text-xs text-[color:var(--color-clinic-muted)] sm:flex-row">
          <span>
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </span>
        </div>

        {/* Giant watermark wordmark */}
        <div className="pointer-events-none -mb-6 -mt-2 select-none overflow-hidden text-center leading-none">
          <span className="font-display text-[18vw] font-extrabold tracking-tight text-[color:var(--color-clinic-ink)]/[0.06] md:text-[140px]">
            {BRAND_NAME}
          </span>
        </div>
      </Reveal>
    </footer>
  );
}
