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
  Sparkles,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import fotodokter2 from "@/assets/fotodokter.webp?url";

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
      const successText =
        "Akun berhasil dibuat. Silakan cek email kamu untuk konfirmasi sebelum masuk.";
      window.sessionStorage.setItem("siagasehat_success_message", successText);
      toast.success(successText, { duration: 5000 });
      navigate({ to: "/login" });
      return;
    }

    navigate({ to: "/profile" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f0f3f9] px-3 py-6 font-sans sm:px-6 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="grid w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-black/10 sm:rounded-[32px] lg:grid-cols-2"
      >
        {/* Left — brand panel with aurora gradient + doctor photo from Home */}
        <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
          {/* Deep gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1630] via-[#16214a] to-[#1a1040]" />

          {/* Aurora glows */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 80% at 20% 90%, rgba(46,230,196,0.18), transparent), radial-gradient(50% 60% at 80% 10%, rgba(74,111,165,0.22), transparent)",
            }}
          />

          {/* Grid dots */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-1 flex-col justify-between p-8 xl:p-10">
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
                <Heart className="h-3.5 w-3.5 text-rose-400" />
                Bergabung dengan SiagaSehat
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-5 font-display text-3xl font-extrabold leading-tight text-white xl:text-4xl"
              >
                Mulai perjalanan
                <br />
                kesehatanmu yang
                <br />
                lebih <span className="text-[#2ee6c4]">cerdas</span>.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 text-sm leading-relaxed text-white/55 max-w-xs"
              >
                Buat akun gratis dan nikmati semua fitur kecerdasan buatan SiagaSehat.
              </motion.p>

              {/* Perks list */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-7 flex flex-col gap-2.5"
              >
                {PERKS.map((perk, i) => (
                  <motion.div
                    key={perk}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.08 }}
                    className="flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2ee6c4]" />
                    <span className="text-sm text-white/70">{perk}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="relative text-xs text-white/30"
            >
              © SiagaSehat | Peduli Kesehatan
            </motion.p>
          </div>

          {/* Doctor illustration from Home, anchored bottom-right of the panel */}
          <motion.div
            initial={{ opacity: 0, x: 30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute -bottom-6 -right-6 z-10 xl:-right-4"
          >
            <img
              src={fotodokter2}
              alt="Dokter dengan stetoskop"
              className="h-[210px] w-auto object-contain drop-shadow-2xl xl:h-[250px]"
            />
          </motion.div>

          {/* Visual badge, overlapping the illustration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="animate-float pointer-events-none absolute bottom-8 left-8 z-20 inline-flex items-center gap-3 rounded-2xl bg-white/[0.09] px-5 py-3 backdrop-blur-sm border border-white/10 xl:left-10"
          >
            <Sparkles className="h-5 w-5 text-[#2ee6c4]" />
            <div>
              <div className="text-sm font-bold text-white">100% Gratis</div>
              <div className="text-[10px] text-white/50">Tanpa biaya tersembunyi</div>
            </div>
          </motion.div>
        </div>

        {/* Right — form panel */}
        <div className="relative flex flex-col justify-center overflow-y-auto bg-white px-6 py-10 sm:px-10 lg:px-12 xl:px-14">
          <Link
            to="/"
            className="group absolute left-6 top-6 inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--color-clinic-muted)] transition-colors duration-200 hover:text-[color:var(--color-clinic-blue)] sm:left-10 lg:left-12"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
            Kembali ke Beranda
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-md py-4 pt-10 lg:pt-4"
          >
            <div className="mb-6 lg:hidden">
              <BrandLogo size="sm" />
            </div>

            <h2 className="font-display text-2xl font-extrabold text-[color:var(--color-clinic-ink)]">
              Buat Akun
            </h2>
            <p className="mt-1.5 text-sm text-[color:var(--color-clinic-muted)]">
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
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-clinic-muted)]" />
                  <Input
                    id="fullName"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama kamu"
                    className="h-11 rounded-xl pl-10 bg-white border-black/10 focus:border-[color:var(--color-clinic-blue)] transition-all"
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
                    className="h-11 rounded-xl pl-10 bg-white border-black/10 focus:border-[color:var(--color-clinic-blue)] transition-all"
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
                <Label htmlFor="password">Kata Sandi</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-clinic-muted)]" />
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="h-11 rounded-xl pl-10 bg-white border-black/10 focus:border-[color:var(--color-clinic-blue)] transition-all"
                  />
                </div>
              </motion.div>

              {/* Health stats row */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-xs font-semibold text-[color:var(--color-clinic-muted)] uppercase tracking-wider mb-2.5">
                  Data Kesehatan (Opsional)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="height" className="text-xs">
                      Tinggi (cm)
                    </Label>
                    <div className="relative">
                      <Ruler className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--color-clinic-muted)]" />
                      <Input
                        id="height"
                        type="number"
                        min={0}
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        placeholder="170"
                        className="h-10 rounded-xl pl-9 bg-white border-black/10 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="weight" className="text-xs">
                      Berat (kg)
                    </Label>
                    <div className="relative">
                      <Weight className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--color-clinic-muted)]" />
                      <Input
                        id="weight"
                        type="number"
                        min={0}
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        placeholder="60"
                        className="h-10 rounded-xl pl-9 bg-white border-black/10 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="age" className="text-xs">
                      Umur
                    </Label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--color-clinic-muted)]" />
                      <Input
                        id="age"
                        type="number"
                        min={0}
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="25"
                        className="h-10 rounded-xl pl-9 bg-white border-black/10 text-sm"
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
                    className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600 border border-red-200/60"
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
                    className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700 border border-emerald-200/60"
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-1 w-full h-11 gap-2 rounded-full bg-[color:var(--color-clinic-blue)] font-semibold hover:bg-[color:var(--color-clinic-blue-dark)] shadow-lg shadow-[color:var(--color-clinic-blue)]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[color:var(--color-clinic-blue)]/30 cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  {loading ? "Memproses..." : "Daftar Sekarang"}
                </Button>
              </motion.div>
            </form>

            <div className="mt-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-black/10" />
              <span className="text-xs text-[color:var(--color-clinic-muted)]">
                sudah punya akun?
              </span>
              <span className="h-px flex-1 bg-black/10" />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/login"
                className="mt-4 flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-[color:var(--color-clinic-ink)] shadow-2xs transition-all duration-300 hover:border-[color:var(--color-clinic-blue)]/30 hover:shadow-md"
              >
                Masuk ke Akun
              </Link>
            </motion.div>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[color:var(--color-clinic-muted)]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Data kamu dilindungi Row Level Security Supabase
            </p>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
