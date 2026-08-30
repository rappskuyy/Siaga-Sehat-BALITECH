import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { UserPlus, Mail, Lock, User as UserIcon, Ruler, Weight, Calendar } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [{ title: "Daftar — SiagaSehat" }],
  }),
  component: RegisterPage,
});

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
      setError(signUpError.message);
      return;
    }

    // Jika project Supabase mewajibkan konfirmasi email, tidak ada session langsung.
    if (!data.session) {
      setInfo("Akun berhasil dibuat. Silakan cek email kamu untuk konfirmasi sebelum masuk.");
      return;
    }

    navigate({ to: "/profile" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f4ee] px-4 py-12 font-sans">
      <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 shadow-[var(--shadow-clinic-lg)]">
        <BrandLogo size="lg" className="mb-6" />

        <h1 className="font-display text-2xl font-extrabold text-[color:var(--color-clinic-ink)]">
          Buat Akun
        </h1>
        <p className="mt-1 text-sm text-[color:var(--color-clinic-muted)]">
          Lengkapi data dasar kesehatanmu agar rekomendasi AI lebih personal.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-clinic-muted)]" />
              <Input
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama kamu"
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-clinic-muted)]" />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Kata Sandi</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-clinic-muted)]" />
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="height">Tinggi (cm)</Label>
              <div className="relative">
                <Ruler className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-clinic-muted)]" />
                <Input
                  id="height"
                  type="number"
                  min={0}
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="170"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="weight">Berat (kg)</Label>
              <div className="relative">
                <Weight className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-clinic-muted)]" />
                <Input
                  id="weight"
                  type="number"
                  min={0}
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="60"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="age">Umur</Label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-clinic-muted)]" />
                <Input
                  id="age"
                  type="number"
                  min={0}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {info && (
            <p
              className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              role="status"
            >
              {info}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 gap-2 rounded-full bg-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue-dark)]"
          >
            <UserPlus className="h-4 w-4" />
            {loading ? "Memproses..." : "Daftar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[color:var(--color-clinic-muted)]">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="font-medium text-[color:var(--color-clinic-blue)] hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
