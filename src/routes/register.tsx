import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  ArrowLeft,
  UserPlus,
  Mail,
  Lock,
  User as UserIcon,
  Ruler,
  Weight,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [{ title: "Daftar | Siaga Sehat" }],
  }),
  component: RegisterPage,
});

const PERKS = [
  "Riwayat konsultasi AI tersimpan aman",
  "Rekomendasi kesehatan yang dipersonalisasi",
  "Pengingat obat otomatis",
  "Scan AI tanpa batas",
];

function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!isSupabaseConfigured) {
      setError(
        "Supabase belum dikonfigurasi. Hubungi admin untuk mengatur VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY.",
      );
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/profile?tab=scan`,
        data: {
          full_name: fullName,
          height_cm: heightCm ? Number(heightCm) : null,
          weight_kg: weightKg ? Number(weightKg) : null,
          age: age ? Number(age) : null,
        },
      },
    });
    setLoading(false);

    if (signUpError) {
      const translated =
        signUpError.message.toLowerCase().includes("user already registered") ||
          signUpError.message.toLowerCase().includes("already registered")
          ? "Email ini sudah terdaftar. Silakan masuk atau gunakan email lain."
          : signUpError.message;
      setError(translated);
      return;
    }

    // Jika project Supabase mewajibkan konfirmasi email, tidak ada session langsung.
    if (!data.session) {
      const successText = "Akun berhasil dibuat. Silakan cek email kamu untuk konfirmasi sebelum masuk.";
      window.sessionStorage.setItem("siagasehat_success_message", successText);
      toast.success(successText, { duration: 5000 });
      navigate({ to: "/login" });
      return;
    }

    navigate({ to: "/profile" });
  };

  return (
    <main className="grid min-h-[100dvh] w-full font-sans overflow-x-hidden lg:grid-cols-[45%_55%]">
      {/* Left — brand panel with warm light clinic theme */}
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
              <Heart className="h-3.5 w-3.5 text-rose-500" />
              Bergabung dengan SiagaSehat
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-5 font-display text-4xl font-extrabold leading-tight text-[color:var(--color-clinic-ink)] xl:text-5xl"
            >
              Mulai perjalanan
              <br />
              kesehatanmu yang
              <br />
              lebih <span className="text-[color:var(--color-clinic-blue)]">cerdas</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-sm leading-relaxed text-[color:var(--color-clinic-muted)] max-w-xs"
            >
              Buat akun gratis dan nikmati semua fitur kecerdasan buatan SiagaSehat.
            </motion.p>

            {/* Perks list */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-col gap-2.5"
            >
              {PERKS.map((perk, i) => (
                <motion.div
                  key={perk}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.08 }}
                  className="flex items-center gap-2.5"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[color:var(--color-clinic-blue)]" />
                  <span className="text-sm font-medium text-[color:var(--color-clinic-ink)]/80">{perk}</span>
                </motion.div>
              ))}
            </motion.div>
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

      {/* Right — form panel with authentic SiagaSehat signature clinic blue (#4a6fa5 to #35517d) */}
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
          className="relative z-10 mx-auto w-full max-w-md py-4"
        >
          <div className="mb-6 lg:hidden">
            <BrandLogo size="sm" inverted />
          </div>

          <h2 className="font-display text-2xl font-extrabold text-white">
            Buat Akun
          </h2>
          <p className="mt-1.5 text-sm text-white/80">
            Lengkapi data dasar kesehatanmu agar rekomendasi AI lebih personal.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {/* Full Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col gap-1.5"
            >
              <Label htmlFor="fullName" className="text-white text-xs font-semibold">Nama Lengkap</Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="fullName"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama kamu"
                  className="h-11 rounded-xl pl-10 bg-white text-[color:var(--color-clinic-ink)] placeholder:text-slate-400 border-transparent shadow-xs focus:bg-white focus:ring-2 focus:ring-white/50 focus:border-white transition-all"
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.17 }}
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
                  className="h-11 rounded-xl pl-10 bg-white text-[color:var(--color-clinic-ink)] placeholder:text-slate-400 border-transparent shadow-xs focus:bg-white focus:ring-2 focus:ring-white/50 focus:border-white transition-all"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.24 }}
              className="flex flex-col gap-1.5"
            >
              <Label htmlFor="password" className="text-white text-xs font-semibold">Kata Sandi</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="h-11 rounded-xl pl-10 bg-white text-[color:var(--color-clinic-ink)] placeholder:text-slate-400 border-transparent shadow-xs focus:bg-white focus:ring-2 focus:ring-white/50 focus:border-white transition-all"
                />
              </div>
            </motion.div>

            {/* Health stats row */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2.5">
                Data Kesehatan (Opsional)
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="height" className="text-xs text-white">Tinggi (cm)</Label>
                  <div className="relative">
                    <Ruler className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="height"
                      type="number"
                      min={0}
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder="170"
                      className="h-10 rounded-xl pl-9 bg-white text-[color:var(--color-clinic-ink)] placeholder:text-slate-400 border-transparent shadow-xs focus:bg-white text-sm focus:ring-2 focus:ring-white/50 focus:border-white"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="weight" className="text-xs text-white">Berat (kg)</Label>
                  <div className="relative">
                    <Weight className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="weight"
                      type="number"
                      min={0}
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="60"
                      className="h-10 rounded-xl pl-9 bg-white text-[color:var(--color-clinic-ink)] placeholder:text-slate-400 border-transparent shadow-xs focus:bg-white text-sm focus:ring-2 focus:ring-white/50 focus:border-white"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="age" className="text-xs text-white">Umur</Label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="age"
                      type="number"
                      min={0}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="25"
                      className="h-10 rounded-xl pl-9 bg-white text-[color:var(--color-clinic-ink)] placeholder:text-slate-400 border-transparent shadow-xs focus:bg-white text-sm focus:ring-2 focus:ring-white/50 focus:border-white"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <AnimatePresence>
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
              {info && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl bg-white/20 px-3.5 py-2.5 text-sm text-white font-medium border border-white/30 backdrop-blur-sm"
                  role="status"
                >
                  {info}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="mt-1 w-full h-11 gap-2 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/35 text-white font-extrabold border border-white/40 shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-200 cursor-pointer"
              >
                <UserPlus className="h-4 w-4 text-white" />
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </Button>
            </motion.div>
          </form>

          <div className="mt-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/25" />
            <span className="text-xs text-white/70 font-medium">sudah punya akun?</span>
            <span className="h-px flex-1 bg-white/25" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to="/login"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-white/25 hover:border-white/40 group backdrop-blur-sm"
            >
              Masuk ke Akun
            </Link>
          </motion.div>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-white/70">
            <ShieldCheck className="h-3.5 w-3.5" />
            Data kamu dilindungi Row Level Security Supabase
          </p>
        </motion.div>
      </div>
    </main>
  );
}
