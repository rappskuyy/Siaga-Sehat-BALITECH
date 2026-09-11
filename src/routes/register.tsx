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
  Eye,
  EyeOff,
  AlertCircle,
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
  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [shakePassword, setShakePassword] = useState(false);
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const hasMinLength = password.length >= 8;
  const hasCapital = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasCapital && hasNumber;
  const validCount = (hasMinLength ? 1 : 0) + (hasCapital ? 1 : 0) + (hasNumber ? 1 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!isPasswordValid) {
      setPasswordTouched(true);
      setShakePassword(true);
      setTimeout(() => setShakePassword(false), 600);
      setError("Kata sandi harus minimal 8 karakter, serta mengandung minimal 1 huruf kapital dan 1 angka.");
      toast.error("Kata sandi belum memenuhi syarat", { id: "password-validation-error" });
      return;
    }

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
      toast.error(translated, { id: "register-signup-error" });
      return;
    }

    // Jika project Supabase mewajibkan konfirmasi email, tidak ada session langsung.
    if (!data.session) {
      const successText = "Akun berhasil dibuat. Silakan cek email kamu untuk konfirmasi sebelum masuk.";
      window.sessionStorage.setItem("siagasehat_success_message", successText);
      toast.success(successText, { id: "register-signup-success", duration: 5000 });
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white text-xs font-semibold">
                  Kata Sandi
                </Label>
                {password && (
                  <span
                    className={`text-[11px] font-semibold transition-colors duration-300 ${
                      validCount === 3
                        ? "text-emerald-300"
                        : validCount === 2
                        ? "text-amber-300"
                        : "text-rose-300"
                    }`}
                  >
                    {validCount === 3
                      ? "✓ Sandi Kuat"
                      : validCount === 2
                      ? "Sedang"
                      : "Lemah"}
                  </span>
                )}
              </div>

              <motion.div
                animate={shakePassword ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="relative"
              >
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (!passwordTouched) setPasswordTouched(true);
                  }}
                  onFocus={() => {
                    setPasswordTouched(true);
                    setPasswordFocused(true);
                  }}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="Minimal 8 karakter (kapital & angka)"
                  className={`h-11 rounded-xl pl-10 pr-11 bg-white text-[color:var(--color-clinic-ink)] placeholder:text-slate-400 border-2 shadow-xs focus:bg-white transition-all ${
                    shakePassword
                      ? "border-rose-400 ring-2 ring-rose-400/50"
                      : passwordTouched && isPasswordValid
                      ? "border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/50"
                      : passwordTouched && !isPasswordValid && password.length > 0
                      ? "border-amber-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50"
                      : "border-transparent focus:ring-2 focus:ring-white/50 focus:border-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition p-1 rounded-md"
                  aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </motion.div>

              {/* Real-time Password Requirements Checklist & Animated Strength Bar */}
              <AnimatePresence>
                {passwordFocused && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-1 flex flex-col gap-2 rounded-xl bg-white/15 p-3 backdrop-blur-md border border-white/30 shadow-xs"
                  >
                    {/* Strength Bar */}
                    <div className="flex items-center gap-2 w-full">
                      <div className="h-1.5 flex-1 rounded-full bg-white/25 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(validCount / 3) * 100}%`,
                            backgroundColor:
                              validCount === 3
                                ? "#10b981"
                                : validCount === 2
                                ? "#f59e0b"
                                : "#ef4444",
                          }}
                          transition={{ duration: 0.3 }}
                          className="h-full rounded-full"
                        />
                      </div>
                      <span className="text-[10px] text-white font-medium shrink-0">
                        {validCount}/3 Syarat
                      </span>
                    </div>

                    {/* Validation Rules */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      {/* Rule 1: Min 8 chars */}
                      <motion.div
                        animate={{
                          scale: hasMinLength ? [1, 1.05, 1] : 1,
                        }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-all ${
                          hasMinLength
                            ? "bg-emerald-500/35 text-white border border-emerald-300/50 shadow-xs font-semibold"
                            : "bg-white/10 text-white/80 border border-white/20"
                        }`}
                      >
                        {hasMinLength ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-200" />
                        ) : (
                          <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/50 flex items-center justify-center text-[9px] text-white/70">
                            •
                          </span>
                        )}
                        <span>Min. 8 Karakter</span>
                      </motion.div>

                      {/* Rule 2: At least 1 uppercase */}
                      <motion.div
                        animate={{
                          scale: hasCapital ? [1, 1.05, 1] : 1,
                        }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-all ${
                          hasCapital
                            ? "bg-emerald-500/35 text-white border border-emerald-300/50 shadow-xs font-semibold"
                            : "bg-white/10 text-white/80 border border-white/20"
                        }`}
                      >
                        {hasCapital ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-200" />
                        ) : (
                          <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/50 flex items-center justify-center text-[9px] text-white/70">
                            •
                          </span>
                        )}
                        <span>1 Huruf Kapital</span>
                      </motion.div>

                      {/* Rule 3: At least 1 number */}
                      <motion.div
                        animate={{
                          scale: hasNumber ? [1, 1.05, 1] : 1,
                        }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-all ${
                          hasNumber
                            ? "bg-emerald-500/35 text-white border border-emerald-300/50 shadow-xs font-semibold"
                            : "bg-white/10 text-white/80 border border-white/20"
                        }`}
                      >
                        {hasNumber ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-200" />
                        ) : (
                          <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/50 flex items-center justify-center text-[9px] text-white/70">
                            •
                          </span>
                        )}
                        <span>1 Angka (0-9)</span>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    x: [0, -8, 8, -6, 6, -3, 3, 0],
                  }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-start gap-2.5 rounded-xl bg-rose-950/60 px-3.5 py-3 text-sm text-rose-200 border border-rose-400/50 backdrop-blur-md shadow-lg shadow-rose-950/30"
                  role="alert"
                >
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </motion.div>
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
