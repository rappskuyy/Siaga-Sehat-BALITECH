import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  Calendar,
  LogOut,
  Ruler,
  Save,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  User as UserIcon,
  Weight,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import type { ScanHistoryRow } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Profil Saya — SiagaSehat" }],
  }),
  component: ProfilePage,
});

const DANGER_META: Record<
  string,
  { label: string; color: string; icon: typeof ShieldCheck; score: number }
> = {
  rendah: { label: "Rendah", color: "text-emerald-600", icon: ShieldCheck, score: 1 },
  sedang: { label: "Sedang", color: "text-amber-600", icon: ShieldQuestion, score: 2 },
  tinggi: { label: "Tinggi", color: "text-red-600", icon: ShieldAlert, score: 3 },
};

function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();

  const [fullName, setFullName] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [age, setAge] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [history, setHistory] = useState<ScanHistoryRow[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setHeightCm(profile.height_cm != null ? String(profile.height_cm) : "");
      setWeightKg(profile.weight_kg != null ? String(profile.weight_kg) : "");
      setAge(profile.age != null ? String(profile.age) : "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setHistoryLoading(true);
    supabase
      .from("scan_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) setHistory(data as ScanHistoryRow[]);
        setHistoryLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        height_cm: heightCm ? Number(heightCm) : null,
        weight_kg: weightKg ? Number(weightKg) : null,
        age: age ? Number(age) : null,
      })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      setMessage(`Gagal menyimpan: ${error.message}`);
      return;
    }
    await refreshProfile();
    setMessage("Profil berhasil diperbarui.");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const bmi =
    heightCm && weightKg && Number(heightCm) > 0
      ? (Number(weightKg) / ((Number(heightCm) / 100) * (Number(heightCm) / 100))).toFixed(1)
      : null;

  const chartData = (history ?? [])
    .slice()
    .reverse()
    .map((h) => ({
      tanggal: new Date(h.created_at).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      }),
      tingkat: DANGER_META[h.tingkat_bahaya]?.score ?? 1,
      nama: h.nama_penyakit,
    }));

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ee]">
        <p className="text-sm text-[color:var(--color-clinic-muted)]">Memuat...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] pb-16 font-sans">
      <div className="mx-auto max-w-4xl px-4 pt-8 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-clinic-muted)] hover:text-[color:var(--color-clinic-ink)]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <BrandLogo />
          </div>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="gap-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </Button>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
            <UserIcon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-[color:var(--color-clinic-ink)]">
              {profile?.full_name || "Profil Saya"}
            </h1>
            <p className="text-sm text-[color:var(--color-clinic-muted)]">{user.email}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Edit profile form */}
          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-clinic)]">
            <h2 className="font-display text-lg font-bold text-[color:var(--color-clinic-ink)]">
              Data Kesehatan
            </h2>
            <p className="mt-1 text-sm text-[color:var(--color-clinic-muted)]">
              Perbarui tinggi, berat, dan umur agar analisis AI lebih akurat.
            </p>

            <form onSubmit={handleSave} className="mt-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama kamu"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="height" className="flex items-center gap-1">
                    <Ruler className="h-3.5 w-3.5" /> Tinggi (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    min={0}
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="weight" className="flex items-center gap-1">
                    <Weight className="h-3.5 w-3.5" /> Berat (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    min={0}
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="age" className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Umur
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min={0}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
              </div>

              {bmi && (
                <p className="rounded-md bg-[color:var(--color-clinic-blue-soft)] px-3 py-2 text-sm text-[color:var(--color-clinic-ink)]">
                  Estimasi BMI: <span className="font-semibold">{bmi}</span>
                </p>
              )}

              {message && (
                <p
                  className={`rounded-md px-3 py-2 text-sm ${
                    message.startsWith("Gagal")
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {message}
                </p>
              )}

              <Button
                type="submit"
                disabled={saving}
                className="mt-1 gap-2 rounded-full bg-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue-dark)]"
              >
                <Save className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </form>
          </div>

          {/* Scan history */}
          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-clinic)]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[color:var(--color-clinic-ink)]">
                Riwayat Scan AI
              </h2>
              <Link
                to="/scanner"
                className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue)]/10"
              >
                <ScanLine className="h-3.5 w-3.5" /> Scan Baru
              </Link>
            </div>

            {historyLoading && (
              <p className="mt-4 text-sm text-[color:var(--color-clinic-muted)]">
                Memuat riwayat...
              </p>
            )}

            {!historyLoading && history && history.length === 0 && (
              <p className="mt-4 text-sm text-[color:var(--color-clinic-muted)]">
                Belum ada riwayat scan. Lakukan pemeriksaan pertamamu sekarang.
              </p>
            )}

            {!historyLoading && history && history.length > 0 && (
              <>
                <div className="mt-4 h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="tanggal" fontSize={11} />
                      <YAxis
                        domain={[0, 3]}
                        ticks={[1, 2, 3]}
                        tickFormatter={(v) => (v === 1 ? "Rendah" : v === 2 ? "Sedang" : "Tinggi")}
                        fontSize={10}
                        width={60}
                      />
                      <Tooltip
                        formatter={(_value, _name, props) => [
                          String(props.payload?.nama ?? ""),
                          "Kondisi",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="tingkat"
                        stroke="#4a6fa5"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <ul className="mt-4 flex max-h-80 flex-col gap-2 overflow-auto">
                  {history.map((h) => {
                    const meta = DANGER_META[h.tingkat_bahaya] ?? DANGER_META.rendah;
                    const Icon = meta.icon;
                    return (
                      <li
                        key={h.id}
                        className="flex items-start gap-3 rounded-xl border border-black/5 p-3"
                      >
                        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${meta.color}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-[color:var(--color-clinic-ink)]">
                              {h.nama_penyakit}
                            </p>
                            <span className="shrink-0 text-xs text-[color:var(--color-clinic-muted)]">
                              {new Date(h.created_at).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs text-[color:var(--color-clinic-muted)]">
                            {h.ringkasan}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
