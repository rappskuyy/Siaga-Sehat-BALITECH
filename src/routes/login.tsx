import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Masuk — SiagaSehat" }],
  }),
  component: LoginPage,
});

const HIGHLIGHTS = [
  { icon: ScanLine, text: "Scan AI untuk deteksi dini kondisi kulit & kesehatan" },
  { icon: Stethoscope, text: "Konsultasi digital dan riwayat rekam medis tersimpan rapi" },
  { icon: ShieldCheck, text: "Data dilindungi Row Level Security Supabase" },
];

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError(
        "Supabase belum dikonfigurasi. Hubungi admin untuk mengatur VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY.",
      );
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Email atau kata sandi salah."
          : signInError.message,
      );
      return;
    }

    navigate({ to: "/profile" });
  };

  return (
    <main className="grid min-h-screen font-sans lg:grid-cols-2">
      {/* Left — brand / marketing panel */}
      <div className="relative hidden overflow-hidden bg-[color:var(--color-clinic-blue)] px-12 py-10 lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{ background: "radial-gradient(65% 90% at 85% 0%, #2ee6c4, transparent)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #2ee6c4, transparent 70%)" }}
        />

        <div className="relative z-10">
          <BrandLogo size="sm" inverted />
        </div>

        <div className="relative z-10 max-w-md">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Selamat datang kembali
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-white">
            Kesehatanmu, dipantau dengan lebih siaga.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            Masuk untuk melanjutkan konsultasi, memantau riwayat scan AI, dan mengelola pengingat
            obat kamu.
          </p>

          <ul className="mt-8 flex flex-col gap-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="mt-1 text-sm text-white/85">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/50">© SiagaSehat — Peduli Kesehatan</p>
      </div>

      {/* Right — form panel */}
      <div className="relative flex flex-col justify-center bg-[#f7f4ee] px-6 py-10 sm:px-10 lg:px-16">
        <Link
          to="/"
          className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--color-clinic-muted)] transition hover:text-[color:var(--color-clinic-blue)] sm:left-10 lg:left-16"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Beranda
        </Link>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <BrandLogo size="sm" />
          </div>

          <h2 className="font-display text-2xl font-extrabold text-[color:var(--color-clinic-ink)]">
            Masuk ke Akunmu
          </h2>
          <p className="mt-1.5 text-sm text-[color:var(--color-clinic-muted)]">
            Masukkan email dan kata sandi untuk melanjutkan.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-clinic-muted)]" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="h-11 rounded-xl pl-10"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Kata Sandi</Label>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-clinic-muted)]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[color:var(--color-clinic-muted)] transition hover:text-[color:var(--color-clinic-ink)]"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 gap-2 rounded-xl bg-[color:var(--color-clinic-blue)] font-semibold hover:bg-[color:var(--color-clinic-blue-dark)]"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-black/10" />
            <span className="text-xs text-[color:var(--color-clinic-muted)]">atau</span>
            <span className="h-px flex-1 bg-black/10" />
          </div>

          <p className="mt-6 text-center text-sm text-[color:var(--color-clinic-muted)]">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="font-semibold text-[color:var(--color-clinic-blue)] hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[color:var(--color-clinic-muted)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Data kamu dilindungi Row Level Security Supabase
          </p>
        </div>
      </div>
    </main>
  );
}
