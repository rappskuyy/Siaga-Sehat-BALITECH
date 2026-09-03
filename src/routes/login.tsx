import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Activity,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Masuk | Siaga Sehat" }],
  }),
  component: LoginPage,
});

const HIGHLIGHTS = [
  { icon: ScanLine, text: "Scan AI untuk deteksi dini kondisi kulit & kesehatan" },
  { icon: Stethoscope, text: "Konsultasi digital dan riwayat rekam medis tersimpan rapi" },
  { icon: ShieldCheck, text: "Data dilindungi Row Level Security Supabase" },
];

const FLOATING_STATS = [
  { label: "Akurasi Triase", value: "92%", icon: Activity },
  { label: "Pola Gejala", value: "500+", icon: Sparkles },
];

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const message = window.sessionStorage.getItem("siagasehat_success_message");
    if (message) {
      setSuccessMessage(message);
      toast.success(message, { duration: 5000 });
      window.sessionStorage.removeItem("siagasehat_success_message");
    }
  }, []);

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
      {/* Left — brand panel with aurora gradient */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
        {/* Deep gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1630] via-[#16214a] to-[#1a1040]" />

        {/* Aurora glows */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 80% at 80% 10%, rgba(46,230,196,0.18), transparent), radial-gradient(50% 60% at 20% 90%, rgba(74,111,165,0.22), transparent)",
          }}
        />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-14">
          <div>
            <BrandLogo size="sm" inverted />
          </div>

          <div className="max-w-md">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm border border-white/10"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              Selamat datang kembali
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-5 font-display text-4xl font-extrabold leading-tight text-white xl:text-5xl"
            >
              Kesehatanmu,
              <br />
              dipantau dengan
              <br />
              lebih <span className="text-[#2ee6c4]">siaga</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-sm leading-relaxed text-white/55 max-w-xs"
            >
              Masuk untuk melanjutkan konsultasi, memantau riwayat scan AI, dan mengelola pengingat obat kamu.
            </motion.p>

            {/* Feature highlights */}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-col gap-3"
            >
              {HIGHLIGHTS.map(({ icon: Icon, text }, i) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10 text-emerald-400 backdrop-blur-sm border border-white/10">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-white/70">{text}</span>
                </motion.li>
              ))}
            </motion.ul>

            {/* Floating mini stat cards */}
            <div className="mt-10 flex gap-3">
              {FLOATING_STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.12 }}
                  className="flex items-center gap-2.5 rounded-2xl bg-white/[0.07] px-4 py-2.5 backdrop-blur-sm border border-white/10"
                >
                  <s.icon className="h-4 w-4 text-[#2ee6c4]" />
                  <div>
                    <div className="font-display text-lg font-extrabold text-white leading-none">{s.value}</div>
                    <div className="text-[10px] text-white/50 mt-0.5">{s.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xs text-white/30"
          >
            © SiagaSehat | Peduli Kesehatan
          </motion.p>
        </div>
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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-sm"
        >
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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col gap-1.5"
            >
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
                  className="h-11 rounded-xl pl-10 bg-white border-black/10 focus:border-[color:var(--color-clinic-blue)] focus:ring-[color:var(--color-clinic-blue)]/20 transition-all"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-col gap-1.5"
            >
              <Label htmlFor="password">Kata Sandi</Label>
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
                  className="h-11 rounded-xl pl-10 pr-10 bg-white border-black/10 focus:border-[color:var(--color-clinic-blue)] focus:ring-[color:var(--color-clinic-blue)]/20 transition-all"
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
            </motion.div>

            <AnimatePresence>
              {successMessage && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700 border border-emerald-200/60"
                  role="status"
                >
                  {successMessage}
                </motion.p>
              )}
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600 border border-red-200/60"
                  role="alert"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="mt-2 w-full h-11 gap-2 rounded-xl bg-[color:var(--color-clinic-blue)] font-semibold hover:bg-[color:var(--color-clinic-blue-dark)] shadow-lg shadow-[color:var(--color-clinic-blue)]/20 transition-all duration-200 hover:shadow-[color:var(--color-clinic-blue)]/30 cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </motion.div>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-black/10" />
            <span className="text-xs text-[color:var(--color-clinic-muted)]">atau</span>
            <span className="h-px flex-1 bg-black/10" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to="/register"
              className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-[color:var(--color-clinic-ink)] shadow-2xs transition hover:border-[color:var(--color-clinic-blue)]/30 hover:shadow-sm group"
            >
              Buat Akun Baru
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-[color:var(--color-clinic-muted)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Data kamu dilindungi Row Level Security Supabase
          </p>
        </motion.div>
      </div>
    </main>
  );
}
