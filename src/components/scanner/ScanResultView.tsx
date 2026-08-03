import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Leaf,
  MapPin,
  Pill,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import type { DangerLevel, ScanResult } from "@/lib/scanner/types";
import { Button } from "@/components/ui/button";
import { PharmacyMap } from "@/components/maps/PharmacyMap";

const DANGER_STYLES: Record<
  DangerLevel,
  { label: string; badge: string; icon: typeof ShieldCheck; ring: string }
> = {
  rendah: {
    label: "Bahaya Rendah",
    badge: "bg-emerald-100 text-emerald-700",
    icon: ShieldCheck,
    ring: "from-emerald-400 to-emerald-500",
  },
  sedang: {
    label: "Perlu Diperhatikan",
    badge: "bg-amber-100 text-amber-700",
    icon: ShieldQuestion,
    ring: "from-amber-400 to-amber-500",
  },
  tinggi: {
    label: "Bahaya Tinggi",
    badge: "bg-red-100 text-red-700",
    icon: ShieldAlert,
    ring: "from-red-400 to-red-500",
  },
};

function mapsSearchUrl(query: string, coords: GeolocationCoordinates | null) {
  const encoded = encodeURIComponent(query);
  if (coords) {
    return `https://www.google.com/maps/search/${encoded}/@${coords.latitude},${coords.longitude},15z`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

function LocateButton({
  label,
  query,
  icon: Icon,
}: {
  label: string;
  query: string;
  icon: typeof Building2;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (loading) return;
    if (!navigator.geolocation) {
      window.open(mapsSearchUrl(query, null), "_blank", "noopener,noreferrer");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        window.open(mapsSearchUrl(query, pos.coords), "_blank", "noopener,noreferrer");
      },
      () => {
        setLoading(false);
        window.open(mapsSearchUrl(query, null), "_blank", "noopener,noreferrer");
      },
      { timeout: 8000 },
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex flex-1 items-center gap-3 rounded-2xl border border-[color:var(--color-clinic-blue)]/20 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)] transition group-hover:scale-105">
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-[color:var(--color-clinic-ink)]">
          {label}
        </span>
        <span className="block text-xs text-[color:var(--color-clinic-muted)]">
          {loading ? "Mencari lokasi kamu..." : "Buka di Google Maps"}
        </span>
      </span>
      <MapPin className="h-4 w-4 text-[color:var(--color-clinic-blue)] opacity-0 transition group-hover:opacity-100" />
    </button>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  delay,
}: {
  title: string;
  icon: typeof Pill;
  children: React.ReactNode;
  delay: string;
}) {
  return (
    <div
      className="animate-fade-up rounded-2xl bg-white p-5 shadow-[var(--shadow-clinic)]"
      style={{ animationDelay: delay }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="font-display text-sm font-bold text-[color:var(--color-clinic-ink)]">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

export function ScanResultView({
  result,
  previewUrl,
  onReset,
}: {
  result: ScanResult;
  previewUrl: string;
  onReset: () => void;
}) {
  if (!result.gambar_dapat_dianalisis) {
    return (
      <div className="animate-fade-up rounded-[24px] bg-white p-8 text-center shadow-[var(--shadow-clinic)]">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-100 text-amber-600">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold text-[color:var(--color-clinic-ink)]">
          Foto Belum Bisa Dianalisis
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--color-clinic-muted)]">
          {result.ringkasan}
        </p>
        <Button
          onClick={onReset}
          className="mt-6 gap-2 rounded-full bg-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue-dark)]"
        >
          <RotateCcw className="h-4 w-4" />
          Coba Foto Lain
        </Button>
      </div>
    );
  }

  const danger = DANGER_STYLES[result.tingkat_bahaya];
  const DangerIcon = danger.icon;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-center font-display text-lg font-bold uppercase tracking-wide text-[color:var(--color-clinic-blue)]">
        Hasil
      </p>

      {/* Header card: photo + disease identity */}
      <div className="animate-fade-up grid gap-5 rounded-[24px] bg-white p-5 shadow-[var(--shadow-clinic-lg)] md:grid-cols-[220px_1fr]">
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={previewUrl}
            alt="Foto yang dianalisis"
            className="aspect-square w-full object-cover"
          />
          <span
            className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br text-white shadow-md ${danger.ring}`}
          >
            <DangerIcon className="h-4 w-4" />
          </span>
        </div>

        <div className="flex flex-col justify-center">
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${danger.badge}`}
          >
            <DangerIcon className="h-3.5 w-3.5" />
            {danger.label}
          </span>
          <h2 className="mt-3 font-display text-2xl font-extrabold text-[color:var(--color-clinic-ink)] md:text-3xl">
            {result.nama_penyakit}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-clinic-muted)]">
            {result.ringkasan}
          </p>
          <p className="mt-3 text-xs text-[color:var(--color-clinic-muted)]">
            Tingkat keyakinan analisis:{" "}
            <span className="font-semibold">{result.tingkat_keyakinan}</span>
          </p>
        </div>
      </div>

      {result.harus_ke_dokter && (
        <div
          className="animate-fade-up flex items-start gap-3 rounded-2xl border-2 border-red-200 bg-red-50 p-4"
          style={{ animationDelay: "0.05s" }}
        >
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-bold text-red-700">Segera konsultasi ke dokter</p>
            <p className="mt-1 text-sm text-red-700/90">{result.alasan_ke_dokter}</p>
          </div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Section title="Kemungkinan Penyebab" icon={Stethoscope} delay="0.1s">
          <ul className="space-y-2 text-sm text-[color:var(--color-clinic-muted)]">
            {result.penyebab.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-clinic-blue)]" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Pencegahan Mandiri" icon={CheckCircle2} delay="0.15s">
          <ul className="space-y-2 text-sm text-[color:var(--color-clinic-muted)]">
            {result.pencegahan_mandiri.map((item, i) => (
              <li key={i} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Rekomendasi Obat" icon={Pill} delay="0.2s">
          {result.obat_rekomendasi.length === 0 ? (
            <p className="text-sm text-[color:var(--color-clinic-muted)]">
              Tidak ada rekomendasi obat bebas untuk kondisi ini — sebaiknya konsultasi ke
              dokter/apoteker.
            </p>
          ) : (
            <div className="space-y-3">
              {result.obat_rekomendasi.map((med, i) => (
                <div key={i} className="rounded-xl bg-[color:var(--color-clinic-blue-soft)]/50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[color:var(--color-clinic-ink)]">
                      {med.nama}
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-[color:var(--color-clinic-blue)]">
                      {med.dosis}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[color:var(--color-clinic-muted)]">
                    {med.catatan}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Obat Herbal Alami" icon={Leaf} delay="0.25s">
          {result.obat_herbal.length === 0 ? (
            <p className="text-sm text-[color:var(--color-clinic-muted)]">
              Tidak ada saran herbal spesifik.
            </p>
          ) : (
            <div className="space-y-3">
              {result.obat_herbal.map((herb, i) => (
                <div key={i} className="rounded-xl bg-emerald-50 p-3">
                  <span className="text-sm font-semibold text-emerald-800">{herb.nama}</span>
                  <p className="mt-1 text-xs text-emerald-700/80">{herb.cara_pakai}</p>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Peta Apotek Terdekat & Rute Jalan (Leaflet + Overpass + OSRM) */}
      <PharmacyMap />

      <div
        className="animate-fade-up flex flex-col gap-3 sm:flex-row"
        style={{ animationDelay: "0.3s" }}
      >
        <LocateButton label="Rumah Sakit Terdekat" query="rumah sakit terdekat" icon={Building2} />
        <LocateButton
          label="Apotek Terdekat (Antar Obat)"
          query="apotek antar obat terdekat"
          icon={Pill}
        />
      </div>

      {result.catatan_tambahan && (
        <p
          className="animate-fade-up text-center text-xs text-[color:var(--color-clinic-muted)]"
          style={{ animationDelay: "0.35s" }}
        >
          {result.catatan_tambahan}
        </p>
      )}

      <div className="flex justify-center pt-2">
        <Button
          onClick={onReset}
          variant="outline"
          className="gap-2 rounded-full border-[color:var(--color-clinic-blue)]/30"
        >
          <RotateCcw className="h-4 w-4" />
          Scan Foto Lain
        </Button>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-[color:var(--color-clinic-muted)]">
        <Sparkles className="h-3 w-3" />
        Hasil ini dibuat oleh AI dan bersifat edukatif, bukan pengganti diagnosis dokter
        profesional.
      </p>
    </div>
  );
}
