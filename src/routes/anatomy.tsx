import { createFileRoute, Link } from "@tanstack/react-router";
import { AnatomyExplorer } from "@/components/anatomy/AnatomyExplorer";
import { Footer } from "@/components/clinic/Footer";
import { ArrowLeft, LogIn, Menu, ScanLine, User, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/anatomy")({
  head: () => ({
    meta: [
      { title: "Eksplorasi Anatomi AI — SiagaSehat" },
      {
        name: "description",
        content:
          "Eksplorasi bagian tubuh secara interaktif, pilih gejala Anda, dan dapatkan AI Health Assessment awal dari SiagaSehat.",
      },
      { property: "og:title", content: "Eksplorasi Anatomi AI — SiagaSehat" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnatomyPage,
});

const NAV_ITEMS = ["Tentang Kami", "Layanan", "Dokter", "Hubungi"];

function AnatomyPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-[#f7f4ee] font-sans flex flex-col justify-between">
      <div>
        <header className="bg-white border-b border-black/5 px-6 py-4 md:px-10">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--color-clinic-blue)]">
                <span className="h-2.5 w-2.5 rounded-full bg-white" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-[color:var(--color-clinic-ink)]">SiagaSehat</span>
            </Link>
            <nav className="hidden items-center gap-1 rounded-full bg-[color:var(--color-clinic-blue-soft)]/60 px-2 py-1.5 text-sm text-[color:var(--color-clinic-ink)] lg:flex">
              {NAV_ITEMS.map((l) => <Link key={l} to="/" hash={l.toLowerCase().replace(/\s/g, "")} className="rounded-full px-4 py-1.5 text-[color:var(--color-clinic-ink)] transition hover:bg-white">{l}</Link>)}
              <Link to="/consultation" className="ml-1 rounded-full bg-white/80 px-4 py-1.5 text-[color:var(--color-clinic-ink)] transition hover:bg-white">Konsultasi</Link>
              <Link to="/anatomy" className="ml-1 rounded-full bg-white px-4 py-1.5 font-bold text-[color:var(--color-clinic-blue)] shadow-xs transition">Anatomi</Link>
              <Link to="/scanner" className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue)] px-4 py-1.5 text-white transition hover:bg-[color:var(--color-clinic-blue-dark)]"><ScanLine className="h-3.5 w-3.5" />Scan AI</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/" className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue-soft)]/60 px-4 py-2 text-xs font-medium text-[color:var(--color-clinic-blue-dark)] transition hover:bg-[color:var(--color-clinic-blue-soft)]"><ArrowLeft className="h-3.5 w-3.5" />Beranda</Link>
              {user ? <Link to="/profile" className="hidden h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-clinic-ink)] text-white md:inline-flex" aria-label="Profil"><User className="h-4 w-4" /></Link> : <Link to="/login" className="hidden items-center gap-2 rounded-full bg-[color:var(--color-clinic-blue)] px-4 py-2 text-xs font-medium text-white md:inline-flex"><LogIn className="h-3.5 w-3.5" />Masuk</Link>}
              <button type="button" onClick={() => setIsMenuOpen((open) => !open)} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] lg:hidden" aria-label="Buka menu">{isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
            </div>
          </div>
          {isMenuOpen && <div className="mt-3 rounded-2xl border border-black/5 bg-white p-3 shadow-[var(--shadow-clinic)] lg:hidden"><nav className="flex flex-col gap-1">{NAV_ITEMS.map((l) => <Link key={l} to="/" hash={l.toLowerCase().replace(/\s/g, "")} onClick={() => setIsMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-[color:var(--color-clinic-ink)] transition hover:bg-[color:var(--color-clinic-blue-soft)]">{l}</Link>)}<Link to="/consultation" onClick={() => setIsMenuOpen(false)} className="mt-1 rounded-xl px-3 py-2.5 text-sm font-medium text-[color:var(--color-clinic-ink)]">Konsultasi</Link><Link to="/anatomy" onClick={() => setIsMenuOpen(false)} className="mt-1 rounded-xl bg-[color:var(--color-clinic-blue-soft)] px-3 py-2.5 text-sm font-bold text-[color:var(--color-clinic-blue-dark)]">Anatomi</Link><Link to="/scanner" onClick={() => setIsMenuOpen(false)} className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--color-clinic-blue)] px-3 py-2.5 text-sm font-medium text-white"><ScanLine className="h-4 w-4" />Scan AI</Link></nav></div>}
        </header>

        {/* Content Container */}
        <div className="px-3 py-4 md:px-6 md:py-6">
          <AnatomyExplorer />
        </div>
      </div>

      <Footer />
    </main>
  );
}
