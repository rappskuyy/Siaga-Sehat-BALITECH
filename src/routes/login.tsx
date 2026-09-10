import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  ArrowLeft,
  Lock,
  LogIn,
  Mail,
  Eye,
  EyeOff,
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
    meta: [{ title: "Masuk | Siaga Sehat" }],
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
    <main className="grid min-h-[100dvh] w-full font-sans overflow-x-hidden lg:grid-cols-[45%_55%]">
      {/* Left — brand panel with light clinic theme */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between bg-white">
        {/* Solid pure white clinic background */}
        <div className="absolute inset-0 bg-white" />

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-14">
          <div>
            <BrandLogo size="sm" />
          </div>

          <div className="max-w-md">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-[color:var(--color-clinic-blue-dark)] shadow-2xs border border-black/5"
            >
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--color-clinic-blue)]" />
              Selamat datang kembali
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-5 font-display text-4xl font-extrabold leading-tight text-[color:var(--color-clinic-ink)] xl:text-5xl"
            >
              Kesehatanmu,
              <br />
              dipantau dengan
              <br />
              lebih <span className="text-[color:var(--color-clinic-blue)]">siaga</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-sm leading-relaxed text-[color:var(--color-clinic-muted)] max-w-xs"
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
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-[color:var(--color-clinic-blue)] shadow-xs border border-black/5">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-[color:var(--color-clinic-ink)]/80">{text}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xs text-[color:var(--color-clinic-muted)]"
          >
            © SiagaSehat | Peduli Kesehatan
          </motion.p>
        </div>
      </div>

      {/* Right — form panel with authentic SiagaSehat signature clinic blue */}
      <div className="relative flex min-h-[100dvh] lg:min-h-0 flex-col justify-center bg-gradient-to-br from-[#4a6fa5] via-[#3f6194] to-[#35517d] px-5 sm:px-10 lg:px-16 pt-16 pb-10 lg:py-10 overflow-y-auto text-white w-full">
        {/* Organic S-Curve wave divider */}
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 hidden lg:block z-20 overflow-visible w-[65px] -translate-x-[10px]">
          <svg
            viewBox="-100 0 200 1000"
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
          >
            <path
              d="M -100,0 L 0,0 C 330,225 330,375 95,600 C -50,730 -50,880 0,1000 L -100,1000 Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        {/* Subtle geometric medical pattern overlay */}
        <div className="hex-pattern absolute inset-0 opacity-15 pointer-events-none" />

        <Link
          to="/"
          className="absolute left-5 top-5 sm:left-10 lg:left-16 sm:top-6 inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 transition hover:text-white z-20"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto w-full max-w-sm my-auto"
        >
          <div className="mb-6 sm:mb-8 lg:hidden">
            <BrandLogo size="sm" inverted />
          </div>

          <h2 className="font-display text-2xl font-extrabold text-white">
            Masuk ke Akunmu
          </h2>
          <p className="mt-1.5 text-sm text-white/80">
            Masukkan email dan kata sandi untuk melanjutkan.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 sm:mt-7 flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col gap-1.5"
            >
              <Label htmlFor="email" className="text-white text-xs font-semibold">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="h-11 rounded-xl pl-10 bg-white text-[color:var(--color-clinic-ink)] placeholder:text-slate-400 border-transparent shadow-xs focus:bg-white focus:ring-2 focus:ring-white/50 focus:border-white text-base sm:text-sm transition-all"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-col gap-1.5"
            >
              <Label htmlFor="password" className="text-white text-xs font-semibold">Kata Sandi</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl pl-10 pr-10 bg-white text-[color:var(--color-clinic-ink)] placeholder:text-slate-400 border-transparent shadow-xs focus:bg-white focus:ring-2 focus:ring-white/50 focus:border-white text-base sm:text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[color:var(--color-clinic-ink)] cursor-pointer"
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
                  className="rounded-xl bg-white/20 px-3.5 py-2.5 text-sm text-white font-medium border border-white/30 backdrop-blur-sm"
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
                  className="rounded-xl bg-rose-950/40 px-3.5 py-2.5 text-sm text-rose-200 border border-rose-400/40 backdrop-blur-sm"
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
                className="mt-2 w-full h-11 gap-2 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/35 text-white font-extrabold border border-white/40 shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-200 cursor-pointer"
              >
                <LogIn className="h-4 w-4 text-white" />
                {loading ? "Memproses..." : "Masuk ke Akun"}
              </Button>
            </motion.div>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/25" />
            <span className="text-xs text-white/70 font-medium">atau</span>
            <span className="h-px flex-1 bg-white/25" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to="/register"
              className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-white/25 hover:border-white/40 backdrop-blur-sm"
            >
              Buat Akun Baru
            </Link>
          </motion.div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-white/70">
            <ShieldCheck className="h-3.5 w-3.5" />
            Data kamu dilindungi Row Level Security Supabase
          </p>
        </motion.div>
      </div>
    </main>
  );
}
