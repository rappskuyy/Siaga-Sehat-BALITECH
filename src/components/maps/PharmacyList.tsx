import { useState, useEffect, useMemo } from "react";
import {
  ExternalLink,
  Navigation,
  Star,
  Clock,
  Car,
  Bike,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock3,
} from "lucide-react";
import type { PharmacyNode, RouteInfo, TransportMode } from "./maps.service";
import { SourceBadge } from "./SourceBadge";

interface PharmacyListProps {
  pharmacies: PharmacyNode[];
  loadingPharmacies: boolean;
  selectedPharmacy: PharmacyNode | null;
  onSelectPharmacy: (pharmacy: PharmacyNode | null) => void;
}

export function PharmacyList({
  pharmacies,
  loadingPharmacies,
  selectedPharmacy,
  onSelectPharmacy,
}: PharmacyListProps) {
  const [maxRadius, setMaxRadius] = useState<number | null>(null);
  const [showAllItems, setShowAllItems] = useState<boolean>(false);
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | number | null>(null);

  // Otomatis tentukan radius awal paling dekat saat data apotek baru dimuat
  useEffect(() => {
    if (pharmacies.length === 0) {
      setMaxRadius(null);
      setShowAllItems(false);
      return;
    }

    const hasUnder2 = pharmacies.some((p) => p.distanceKm <= 2);
    const hasUnder5 = pharmacies.some((p) => p.distanceKm <= 5);
    const hasUnder10 = pharmacies.some((p) => p.distanceKm <= 10);

    if (hasUnder2) {
      setMaxRadius(2);
    } else if (hasUnder5) {
      setMaxRadius(5);
    } else if (hasUnder10) {
      setMaxRadius(10);
    } else {
      setMaxRadius(null);
    }
    setShowAllItems(false);
  }, [pharmacies]);

  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter((p) => {
      if (maxRadius === null) return true;
      return p.distanceKm <= maxRadius;
    });
  }, [pharmacies, maxRadius]);

  const INITIAL_DISPLAY_COUNT = 3;
  const displayedPharmacies = showAllItems
    ? filteredPharmacies
    : filteredPharmacies.slice(0, INITIAL_DISPLAY_COUNT);

  return (
    <div className="flex flex-col gap-3 max-h-[560px] overflow-y-auto pr-1">
      <div className="flex items-center justify-between sticky top-0 bg-white py-1 z-10">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-clinic-muted)]">
            Apotek Terdekat ({filteredPharmacies.length})
          </h4>
        </div>
        {selectedPharmacy && (
          <button
            type="button"
            onClick={() => onSelectPharmacy(null)}
            className="text-[11px] font-medium text-[color:var(--color-clinic-blue)] hover:underline flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Bersihkan Pilihan
          </button>
        )}
      </div>

      {/* Filter Radius Bertahap */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
        <button
          type="button"
          onClick={() => {
            setMaxRadius(2);
            setShowAllItems(false);
          }}
          className={`rounded-full px-2.5 py-0.5 font-medium transition shrink-0 ${
            maxRadius === 2
              ? "bg-[color:var(--color-clinic-blue)] text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          ≤ 2 km ({pharmacies.filter((p) => p.distanceKm <= 2).length})
        </button>
        <button
          type="button"
          onClick={() => {
            setMaxRadius(5);
            setShowAllItems(false);
          }}
          className={`rounded-full px-2.5 py-0.5 font-medium transition shrink-0 ${
            maxRadius === 5
              ? "bg-[color:var(--color-clinic-blue)] text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          ≤ 5 km ({pharmacies.filter((p) => p.distanceKm <= 5).length})
        </button>
        <button
          type="button"
          onClick={() => {
            setMaxRadius(10);
            setShowAllItems(false);
          }}
          className={`rounded-full px-2.5 py-0.5 font-medium transition shrink-0 ${
            maxRadius === 10
              ? "bg-[color:var(--color-clinic-blue)] text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          ≤ 10 km ({pharmacies.filter((p) => p.distanceKm <= 10).length})
        </button>
        <button
          type="button"
          onClick={() => {
            setMaxRadius(null);
            setShowAllItems(false);
          }}
          className={`rounded-full px-2.5 py-0.5 font-medium transition shrink-0 ${
            maxRadius === null
              ? "bg-[color:var(--color-clinic-blue)] text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Semua ({pharmacies.length})
        </button>
      </div>

      {/* Info Banner Pencarian Bertahap */}
      {!loadingPharmacies && filteredPharmacies.length > 0 && maxRadius !== null && (
        <div className="flex items-center gap-1.5 rounded-xl bg-blue-50/80 px-2.5 py-1.5 text-[11px] text-blue-700">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-blue-600" />
          <span>
            Menampilkan apotek terdekat dalam radius <strong>≤ {maxRadius} km</strong>.
          </span>
        </div>
      )}

      {loadingPharmacies ? (
        <div className="space-y-2">
          <div className="text-center py-2 text-xs text-blue-600 font-medium animate-pulse">
            Memuat apotek terverifikasi di sekitar lokasi Anda...
          </div>
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 animate-pulse rounded-2xl bg-slate-100 p-3" />
          ))}
        </div>
      ) : filteredPharmacies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
          {maxRadius
            ? `Tidak ada apotek dalam radius ≤ ${maxRadius} km. Silakan klik tombol radius lebih besar (≤ 5 km / ≤ 10 km / Semua) di atas.`
            : "Tidak ada apotek ditemukan di sekitar titik ini. Coba geser pin ke jalan utama atau cari alamat lain."}
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayedPharmacies.map((pharm, idx) => {
            const isSelected = selectedPharmacy?.id === pharm.id;
            const isScheduleOpen = expandedScheduleId === pharm.id;

            return (
              <button
                key={pharm.id}
                type="button"
                onClick={() => onSelectPharmacy(isSelected ? null : pharm)}
                className={`group w-full rounded-2xl p-3.5 text-left transition border ${
                  isSelected
                    ? "border-[color:var(--color-clinic-blue)] bg-[color:var(--color-clinic-blue-soft)]/60 shadow-md ring-2 ring-[color:var(--color-clinic-blue)]/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <span
                      className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                        isSelected
                          ? "bg-[color:var(--color-clinic-blue)] text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {pharm.name}
                        </h5>
                        <SourceBadge
                          dataSource={pharm._dataSource}
                          trustScore={pharm._trustScore}
                        />
                      </div>

                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
                        {pharm.rating && (
                          <span className="flex items-center gap-0.5 font-semibold text-amber-600">
                            {pharm.rating}{" "}
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400 inline" />
                          </span>
                        )}
                        {pharm.userRatingsTotal && (
                          <span className="text-slate-400">({pharm.userRatingsTotal})</span>
                        )}
                        {pharm.rating && <span>•</span>}

                        {/* Operational Status Pill */}
                        {pharm.openingStatus === "closing-soon" ? (
                          <span className="inline-flex items-center gap-0.5 font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md">
                            <Clock3 className="h-2.5 w-2.5" /> Tutup Segera
                          </span>
                        ) : pharm.isOpenNow === false || pharm.openingStatus === "closed" ? (
                          <span className="inline-flex items-center gap-0.5 font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded-md">
                            <AlertCircle className="h-2.5 w-2.5" /> Tutup
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Sedang Buka
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                        {pharm.address}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100">
                    {pharm.distanceKm} km
                  </span>
                </div>

                {/* Jam Operasional Text & Schedule Toggle */}
                <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                  {pharm.openingHoursText && (
                    <span
                      className={`flex items-center gap-1 font-medium ${
                        pharm.openingStatus === "closing-soon"
                          ? "text-amber-700"
                          : pharm.isOpenNow === false || pharm.openingStatus === "closed"
                          ? "text-rose-700"
                          : "text-emerald-700"
                      }`}
                    >
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>{pharm.openingHoursText}</span>
                    </span>
                  )}

                  {pharm.operatingHours?.weekdayText && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedScheduleId(isScheduleOpen ? null : pharm.id);
                      }}
                      className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                    >
                      {isScheduleOpen ? "Tutup Jadwal" : "Jadwal Lengkap"}
                      {isScheduleOpen ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>

                {/* Expandable Mon-Sun Schedule */}
                {isScheduleOpen && pharm.operatingHours?.weekdayText && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 rounded-xl bg-slate-50 p-2.5 text-[10px] text-slate-600 space-y-1 border border-slate-200/80 animate-fade-in text-left"
                  >
                    <span className="font-bold text-slate-800 block mb-1">
                      📅 Jam Operasional Lengkap:
                    </span>
                    {pharm.operatingHours.weekdayText.map((text, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            );
          })}

          {/* Tombol Perluas / Ciutkan Daftar Bertahap */}
          {filteredPharmacies.length > INITIAL_DISPLAY_COUNT && (
            <button
              type="button"
              onClick={() => setShowAllItems(!showAllItems)}
              className="flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-semibold text-[color:var(--color-clinic-blue)] bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
            >
              {showAllItems ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Tampilkan Lebih Sedikit
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Lihat {filteredPharmacies.length - INITIAL_DISPLAY_COUNT} Apotek Lainnya
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface RouteOverlayProps {
  selectedPharmacy: PharmacyNode | null;
  routeInfo: RouteInfo | null;
  loadingRoute: boolean;
  transportMode: TransportMode;
  userLocation: [number, number] | null;
  onTransportModeChange: (mode: TransportMode) => void;
  onClose: () => void;
}

export function RouteOverlayCard({
  selectedPharmacy,
  routeInfo,
  loadingRoute,
  transportMode,
  userLocation,
  onTransportModeChange,
  onClose,
}: RouteOverlayProps) {
  if (!selectedPharmacy) return null;

  return (
    <div className="animate-fade-up flex flex-col gap-2.5 rounded-2xl bg-white p-4 shadow-sm border border-slate-200 w-full">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
              APOTEK TERPILIH
            </span>
            <SourceBadge
              dataSource={selectedPharmacy._dataSource}
              trustScore={selectedPharmacy._trustScore}
            />
          </div>
          <h4 className="line-clamp-1 text-sm font-extrabold text-slate-900">
            {selectedPharmacy.name}
          </h4>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
            {selectedPharmacy.rating && (
              <span className="flex items-center gap-0.5 font-bold text-amber-600">
                {selectedPharmacy.rating}{" "}
                <Star className="h-3 w-3 fill-amber-400 text-amber-400 inline" />
              </span>
            )}
            {selectedPharmacy.userRatingsTotal && (
              <span className="text-slate-400">({selectedPharmacy.userRatingsTotal})</span>
            )}
            {selectedPharmacy.rating && <span>•</span>}
            <span className="text-emerald-700 font-semibold">
              {selectedPharmacy.openingHoursText || "Buka"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          title="Sembunyikan Rute"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-[11px] text-slate-600 line-clamp-2">
        📍 {selectedPharmacy.address}
      </p>

      {/* Transport Mode Switcher */}
      <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => onTransportModeChange("driving")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
            transportMode === "driving"
              ? "bg-white text-[color:var(--color-clinic-blue)] shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Car className="h-3.5 w-3.5" />
          Mobil
        </button>
        <button
          type="button"
          onClick={() => onTransportModeChange("motorcycle")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
            transportMode === "motorcycle"
              ? "bg-white text-[color:var(--color-clinic-blue)] shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Bike className="h-3.5 w-3.5" />
          Motor
        </button>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-blue-50/70 p-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-[color:var(--color-clinic-blue)]" />
          <span className="text-slate-700 font-medium">
            {loadingRoute ? (
              "Kalkulasi rute..."
            ) : routeInfo ? (
              <span>
                <strong>{routeInfo.distanceKm} km</strong> (~{routeInfo.durationMin} mnt via{" "}
                {transportMode === "motorcycle" ? "motor" : "mobil"})
              </span>
            ) : (
              `~${selectedPharmacy.distanceKm} km`
            )}
          </span>
        </div>
      </div>

      {(() => {
        let mapsUrl = `https://www.google.com/maps/dir/?api=1`;
        if (userLocation) {
          mapsUrl += `&origin=${userLocation[0]},${userLocation[1]}`;
        }
        if (selectedPharmacy.placeId) {
          mapsUrl += `&destination=${encodeURIComponent(selectedPharmacy.name)}&destination_place_id=${selectedPharmacy.placeId}`;
        } else {
          mapsUrl += `&destination=${encodeURIComponent(`${selectedPharmacy.name}, ${selectedPharmacy.address || ""}`)}`;
        }
        mapsUrl += `&travelmode=${transportMode === "motorcycle" ? "two_wheeler" : "driving"}`;

        return (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-[color:var(--color-clinic-blue)] py-2 text-xs font-bold text-white shadow-md hover:bg-[color:var(--color-clinic-blue-dark)] transition"
          >
            Buka Navigasi Google Maps
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        );
      })()}
    </div>
  );
}
