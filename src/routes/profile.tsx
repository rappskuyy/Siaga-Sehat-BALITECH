import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
  Bell,
  Bone,
  Calendar,
  LogOut,
  MessageCircleHeart,
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
import type { ConsultationHistoryRow, ScanHistoryRow } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/clinic/Footer";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Profil Saya | Siaga Sehat" }],
  }),
  component: ProfilePage,
});

const DANGER_META: Record<
  string,
  { label: string; color: string; badgeBg: string; icon: typeof ShieldCheck; score: number }
> = {
  rendah: {
    label: "Rendah",
    color: "text-emerald-600",
    badgeBg: "bg-emerald-50",
    icon: ShieldCheck,
    score: 1,
  },
  sedang: {
    label: "Sedang",
    color: "text-amber-600",
    badgeBg: "bg-amber-50",
    icon: ShieldQuestion,
    score: 2,
  },
  tinggi: {
    label: "Tinggi",
    color: "text-red-600",
    badgeBg: "bg-red-50",
    icon: ShieldAlert,
    score: 3,
  },
};

function firstMessageSnippet(messages: ConsultationHistoryRow["messages"]): string {
  const firstUser = messages.find((m) => m.role === "user");
  const text = (firstUser ?? messages[0])?.text ?? "";
  return text.length > 140 ? `${text.slice(0, 140)}…` : text;
}

function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();

  const [mobileTab, setMobileTab] = useState<"semua" | "data" | "scan" | "anatomy">("semua");
  const [fullName, setFullName] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [age, setAge] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [history, setHistory] = useState<ScanHistoryRow[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [anatomyHistory, setAnatomyHistory] = useState<ConsultationHistoryRow[] | null>(null);
  const [anatomyLoading, setAnatomyLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get("tab") || searchParams.get("section");
      if (tabParam === "scan" || tabParam === "history" || tabParam === "riwayat") {
        setMobileTab("scan");
        setTimeout(() => {
          const el = document.getElementById("riwayat-scan-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 300);
      } else if (tabParam === "anatomy" || tabParam === "anatomi") {
        setMobileTab("anatomy");
        setTimeout(() => {
          const el = document.getElementById("riwayat-anatomi-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }
  }, []);

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

  useEffect(() => {
    if (!user) return;
    let active = true;
    setAnatomyLoading(true);
    supabase
      .from("consultation_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) setAnatomyHistory(data as ConsultationHistoryRow[]);
        setAnatomyLoading(false);
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

  const lastScan = history && history.length > 0 ? history[0] : null;
  const lastScanMeta = lastScan
    ? (DANGER_META[lastScan.tingkat_bahaya] ?? DANGER_META.rendah)
    : null;

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ee]">
        <p className="text-sm text-[color:var(--color-clinic-muted)]">Memuat...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] pb-16 font-sans">
      <SiteHeader />

      <div className="mx-auto max-w-4xl px-4 pt-4 sm:pt-6 md:px-6 w-full overflow-hidden">
        {/* Profile hero card — avatar, name, email and mobile quick actions */}
        <div className="overflow-hidden rounded-3xl border border-black/5 bg-[color:var(--color-clinic-blue)] shadow-[var(--shadow-clinic)]">
          <div className="relative px-5 py-6 sm:px-8 sm:py-7">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{ background: "radial-gradient(60% 100% at 15% 0%, #2ee6c4, transparent)" }}
            />
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                {/* Avatar IS the logout button — tap the photo to sign out */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Ketuk untuk keluar dari akun"
                  aria-label="Keluar dari akun"
                  className="group relative grid h-14 w-14 sm:h-16 sm:w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-white/15 text-white shadow-sm ring-2 ring-white/25 backdrop-blur transition active:scale-95 cursor-pointer"
                >
                  <UserIcon className="h-6 w-6 sm:h-7 sm:w-7 transition group-hover:opacity-0" />
                  <span className="absolute inset-0 grid place-items-center bg-red-500/90 text-white opacity-0 transition group-hover:opacity-100">
                    <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-[color:var(--color-clinic-blue)] bg-red-500 text-white shadow-sm">
                    <LogOut className="h-2.5 w-2.5" />
                  </span>
                </button>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-white/70">
                    Akun Saya
                  </p>
                  <h1 className="truncate font-display text-lg font-extrabold text-white sm:text-2xl">
                    {profile?.full_name || "Profil Saya"}
                  </h1>
                  <p className="truncate text-xs sm:text-sm text-white/75">{user.email}</p>
                </div>
              </div>

              {/* Explicit logout button on mobile */}
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-red-500 active:scale-95 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-1.5 sm:gap-2 border-t border-white/10 bg-white/5 px-4 py-3 sm:px-8 sm:py-4">
            <div className="flex-1 rounded-2xl bg-white/10 px-2 py-2 sm:px-4 sm:py-2.5 text-center backdrop-blur">
              <p className="font-display text-base sm:text-lg font-extrabold text-white">
                {history?.length ?? 0}
              </p>
              <p className="text-[9px] sm:text-[10px] text-white/70">Total Scan</p>
            </div>
            <div className="flex-1 rounded-2xl bg-white/10 px-2 py-2 sm:px-4 sm:py-2.5 text-center backdrop-blur">
              <p className="font-display text-base sm:text-lg font-extrabold text-white truncate">
                {lastScanMeta?.label ?? "-"}
              </p>
              <p className="text-[9px] sm:text-[10px] text-white/70">Risiko Terakhir</p>
            </div>
            <div className="flex-1 rounded-2xl bg-white/10 px-2 py-2 sm:px-4 sm:py-2.5 text-center backdrop-blur">
              <p className="font-display text-base sm:text-lg font-extrabold text-white">
                {bmi ?? "-"}
              </p>
              <p className="text-[9px] sm:text-[10px] text-white/70">BMI</p>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Segmented Tabs (Visible on screens < 1024px) */}
        <div className="mt-4 grid grid-cols-4 gap-1 rounded-2xl bg-white p-1.5 shadow-[var(--shadow-clinic)] lg:hidden text-center">
          <button
            type="button"
            onClick={() => setMobileTab("semua")}
            className={`rounded-xl py-2 px-1 text-center text-[11px] sm:text-xs font-bold transition select-none cursor-pointer truncate ${
              mobileTab === "semua"
                ? "bg-[color:var(--color-clinic-blue)] text-white shadow-xs"
                : "text-[color:var(--color-clinic-muted)] hover:bg-[color:var(--color-clinic-blue-soft)]/50"
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("data")}
            className={`rounded-xl py-2 px-1 text-center text-[11px] sm:text-xs font-bold transition select-none cursor-pointer truncate ${
              mobileTab === "data"
                ? "bg-[color:var(--color-clinic-blue)] text-white shadow-xs"
                : "text-[color:var(--color-clinic-muted)] hover:bg-[color:var(--color-clinic-blue-soft)]/50"
            }`}
          >
            Data
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("scan")}
            className={`rounded-xl py-2 px-1 text-center text-[11px] sm:text-xs font-bold transition select-none cursor-pointer truncate ${
              mobileTab === "scan"
                ? "bg-[color:var(--color-clinic-blue)] text-white shadow-xs"
                : "text-[color:var(--color-clinic-muted)] hover:bg-[color:var(--color-clinic-blue-soft)]/50"
            }`}
          >
            Scan
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("anatomy")}
            className={`rounded-xl py-2 px-1 text-center text-[11px] sm:text-xs font-bold transition select-none cursor-pointer truncate ${
              mobileTab === "anatomy"
                ? "bg-[color:var(--color-clinic-blue)] text-white shadow-xs"
                : "text-[color:var(--color-clinic-muted)] hover:bg-[color:var(--color-clinic-blue-soft)]/50"
            }`}
          >
            Anatomi
          </button>
        </div>

        <div className="mt-4 sm:mt-6 grid gap-5 sm:gap-6 lg:grid-cols-[1fr_1.2fr] w-full">
          {/* Edit profile form */}
          <div
            className={`rounded-3xl border border-black/5 bg-white p-4 sm:p-6 shadow-[var(--shadow-clinic)] w-full overflow-hidden ${
              mobileTab === "semua" || mobileTab === "data" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] shrink-0">
                <UserIcon className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-base sm:text-lg font-bold text-[color:var(--color-clinic-ink)]">
                  Data Kesehatan
                </h2>
                <p className="text-xs text-[color:var(--color-clinic-muted)]">
                  Agar analisis AI lebih akurat
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="mt-4 sm:mt-5 flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1.5 w-full">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama kamu"
                  className="h-10 text-sm w-full"
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-3 w-full">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <Label htmlFor="height" className="flex items-center gap-1 text-[10px] sm:text-xs truncate">
                    <Ruler className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" /> Tinggi (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    min={0}
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="h-10 text-xs sm:text-sm px-2 sm:px-3 w-full"
                  />
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <Label htmlFor="weight" className="flex items-center gap-1 text-[10px] sm:text-xs truncate">
                    <Weight className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" /> Berat (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    min={0}
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="h-10 text-xs sm:text-sm px-2 sm:px-3 w-full"
                  />
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <Label htmlFor="age" className="flex items-center gap-1 text-[10px] sm:text-xs truncate">
                    <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" /> Umur
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min={0}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="h-10 text-xs sm:text-sm px-2 sm:px-3 w-full"
                  />
                </div>
              </div>

              {bmi && (
                <p className="rounded-xl bg-[color:var(--color-clinic-blue-soft)] px-3 py-2 text-xs sm:text-sm text-[color:var(--color-clinic-ink)] font-medium w-full">
                  Estimasi BMI: <span className="font-bold text-[color:var(--color-clinic-blue)]">{bmi}</span>
                </p>
              )}

              {message && (
                <p
                  className={`rounded-xl px-3 py-2 text-xs sm:text-sm w-full ${
                    message.startsWith("Gagal")
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-700 font-medium"
                  }`}
                >
                  {message}
                </p>
              )}

              <Button
                type="submit"
                disabled={saving}
                className="w-full mt-1 gap-2 rounded-full bg-[color:var(--color-clinic-blue)] py-5 text-sm font-semibold hover:bg-[color:var(--color-clinic-blue-dark)] cursor-pointer"
              >
                <Save className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </form>
          </div>

          {/* Scan history */}
          <div
            id="riwayat-scan-section"
            className={`rounded-3xl border border-black/5 bg-white p-5 sm:p-6 shadow-[var(--shadow-clinic)] ${
              mobileTab === "semua" || mobileTab === "scan" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
                  <ScanLine className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-base sm:text-lg font-bold text-[color:var(--color-clinic-ink)]">
                    Riwayat Scan AI
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[color:var(--color-clinic-muted)]">
                    Ketuk <Bell className="inline h-3 w-3 -translate-y-px" /> untuk pengingat obat
                  </p>
                </div>
              </div>
              <Link
                to="/scanner"
                className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue)]/10 shrink-0"
              >
                Scan Baru
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
                <div className="mt-4 h-44 w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="tanggal" fontSize={10} interval="preserveStartEnd" tick={{ fill: "#64748b" }} />
                      <YAxis
                        domain={[0, 3]}
                        ticks={[1, 2, 3]}
                        tickFormatter={(v) => (v === 1 ? "Rendah" : v === 2 ? "Sedang" : "Tinggi")}
                        fontSize={10}
                        width={48}
                        tick={{ fill: "#64748b" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "12px",
                          border: "1px solid rgba(0, 0, 0, 0.08)",
                          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
                          fontSize: "11px",
                          padding: "8px 12px",
                        }}
                        formatter={(_value, _name, props) => [
                          String(props.payload?.nama ?? ""),
                          "Kondisi",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="tingkat"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#ffffff" }}
                        activeDot={{ r: 6 }}
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
                        className="flex items-start gap-3 rounded-xl border border-black/5 p-3 transition hover:border-black/10 hover:bg-slate-50/60"
                      >
                        <span
                          className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${meta.badgeBg} ${meta.color}`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-xs sm:text-sm font-semibold text-[color:var(--color-clinic-ink)]">
                              {h.nama_penyakit}
                            </p>
                            <span className="shrink-0 text-[10px] sm:text-xs text-[color:var(--color-clinic-muted)]">
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

                        {/* Notification icon — jumps straight to the reminder page for this condition */}
                        <Link
                          to="/reminders"
                          search={{ scan: h.id, penyakit: h.nama_penyakit }}
                          title="Atur pengingat obat untuk kondisi ini"
                          aria-label={`Atur pengingat obat untuk ${h.nama_penyakit}`}
                          className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] transition hover:bg-[color:var(--color-clinic-blue)] hover:text-white"
                        >
                          <Bell className="h-3.5 w-3.5" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Anatomy / body-part consultation history */}
        <div
          id="riwayat-anatomi-section"
          className={`mt-5 sm:mt-6 rounded-3xl border border-black/5 bg-white p-5 sm:p-6 shadow-[var(--shadow-clinic)] ${
            mobileTab === "semua" || mobileTab === "anatomy" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
                <Bone className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-base sm:text-lg font-bold text-[color:var(--color-clinic-ink)]">
                  Riwayat Anatomi
                </h2>
                <p className="text-[11px] sm:text-xs text-[color:var(--color-clinic-muted)]">
                  Sesi pilih-bagian-tubuh dan konsultasi AI kamu
                </p>
              </div>
            </div>
            <Link
              to="/anatomy"
              className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-clinic-blue-soft)] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue)]/10 shrink-0"
            >
              Konsultasi Baru
            </Link>
          </div>

          {anatomyLoading && (
            <p className="mt-4 text-sm text-[color:var(--color-clinic-muted)]">Memuat riwayat...</p>
          )}

          {!anatomyLoading && anatomyHistory && anatomyHistory.length === 0 && (
            <p className="mt-4 text-sm text-[color:var(--color-clinic-muted)]">
              Belum ada riwayat konsultasi anatomi. Pilih bagian tubuh yang bermasalah untuk
              memulai.
            </p>
          )}

          {!anatomyLoading && anatomyHistory && anatomyHistory.length > 0 && (
            <ul className="mt-4 flex max-h-80 flex-col gap-2 overflow-auto">
              {anatomyHistory.map((h) => (
                <li
                  key={h.id}
                  className="flex items-start gap-3 rounded-xl border border-black/5 p-3 transition hover:border-black/10 hover:bg-slate-50/60"
                >
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
                    <MessageCircleHeart className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs sm:text-sm font-semibold capitalize text-[color:var(--color-clinic-ink)]">
                        {h.body_part || "Konsultasi Umum"}
                      </p>
                      <span className="shrink-0 text-[10px] sm:text-xs text-[color:var(--color-clinic-muted)]">
                        {new Date(h.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-[color:var(--color-clinic-muted)]">
                      {firstMessageSnippet(h.messages)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
