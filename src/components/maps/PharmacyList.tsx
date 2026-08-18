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
  Building2,
  Stethoscope,
  Pill,
} from "lucide-react";
import type { PharmacyNode, RouteInfo, TransportMode, DangerLevelType } from "./maps.service";
import { SourceBadge } from "./SourceBadge";

interface PharmacyListProps {
  pharmacies: PharmacyNode[];
  loadingPharmacies: boolean;
  selectedPharmacy: PharmacyNode | null;
  dangerLevel?: DangerLevelType;
  onSelectPharmacy: (pharmacy: PharmacyNode | null) => void;
}

export function PharmacyList({
  pharmacies,
  loadingPharmacies,
  selectedPharmacy,
  dangerLevel = "rendah",
  onSelectPharmacy,
}: PharmacyListProps) {
  const [maxRadius, setMaxRadius] = useState<number | null>(null);
  const [showAllItems, setShowAllItems] = useState<boolean>(false);
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | number | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "pharmacy" | "hospital" | "clinic">("all");

  // Otomatis set filter awal berdasarkan tingkat bahaya
  useEffect(() => {
    if (dangerLevel === "tinggi") {
      const hasHospital = pharmacies.some((p) => p.facilityType === "hospital" || p.facilityType === "clinic");
      if (hasHospital) {
        setTypeFilter("hospital");
      } else {
        setTypeFilter("all");
      }
    } else {
      setTypeFilter("all");
    }
  }, [dangerLevel, pharmacies]);

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
      if (maxRadius !== null && p.distanceKm > maxRadius) return false;
      if (typeFilter === "hospital") return p.facilityType === "hospital" || p.facilityType === "clinic";
      if (typeFilter === "pharmacy") return p.facilityType === "pharmacy" || !p.facilityType;
      return true;
    });
  }, [pharmacies, maxRadius, typeFilter]);

  const INITIAL_DISPLAY_COUNT = 4;
  const displayedPharmacies = showAllItems
    ? filteredPharmacies
    : filteredPharmacies.slice(0, INITIAL_DISPLAY_COUNT);

  return (
    <div className="flex flex-col gap-3 min-w-0 w-full">
      {/* Header List */}
      <div className="flex items-center justify-between shrink-0 py-0.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {dangerLevel === "tinggi" ? "🏥 Faskes & RS Terdekat" : "💊 Apotek & Faskes Terdekat"} ({filteredPharmacies.length})
        </h4>
        {selectedPlace && (
          <button
            type="button"
            onClick={() => onSelectPharmacy(null)}
            className="text-[11px] font-medium text-[color:var(--color-clinic-blue)] hover:underline flex items-center gap-1 shrink-0"
          >
            <X className="h-3 w-3" /> Bersihkan
          </button>
        )}
      </div>

      {/* Filter Section */}
      <div className="flex flex-col gap-2 shrink-0">
        {/* Row 1: Kategori Fasilitas */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setTypeFilter("all");
              setShowAllItems(false);
            }}
            className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-[11px] font-semibold transition shrink-0 ${
              typeFilter === "all"
                ? "bg-[color:var(--color-clinic-blue)] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60"
            }`}
          >
            Semua ({pharmacies.length})
          </button>

          {pharmacies.some((p) => p.facilityType === "hospital" || p.facilityType === "clinic") && (
            <button
              type="button"
              onClick={() => {
                setTypeFilter("hospital");
                setShowAllItems(false);
              }}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition shrink-0 ${
                typeFilter === "hospital"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              RS & Klinik ({pharmacies.filter((p) => p.facilityType === "hospital" || p.facilityType === "clinic").length})
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setTypeFilter("pharmacy");
              setShowAllItems(false);
            }}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition shrink-0 ${
              typeFilter === "pharmacy"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            <Pill className="h-3.5 w-3.5" />
            Apotek ({pharmacies.filter((p) => p.facilityType === "pharmacy" || !p.facilityType).length})
          </button>
        </div>

        {/* Row 2: Filter Radius Jarak */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-slate-400 font-medium mr-0.5">Jarak:</span>
          <button
            type="button"
            onClick={() => {
              setMaxRadius(2);
              setShowAllItems(false);
            }}
            className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[10px] font-medium transition shrink-0 ${
              maxRadius === 2
                ? "bg-slate-800 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            ≤ 2 km
          </button>
          <button
            type="button"
            onClick={() => {
              setMaxRadius(5);
              setShowAllItems(false);
            }}
            className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[10px] font-medium transition shrink-0 ${
              maxRadius === 5
                ? "bg-slate-800 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            ≤ 5 km
          </button>
          <button
            type="button"
            onClick={() => {
              setMaxRadius(10);
              setShowAllItems(false);
            }}
            className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[10px] font-medium transition shrink-0 ${
              maxRadius === 10
                ? "bg-slate-800 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            ≤ 10 km
          </button>
          <button
            type="button"
            onClick={() => {
              setMaxRadius(null);
              setShowAllItems(false);
            }}
            className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[10px] font-medium transition shrink-0 ${
              maxRadius === null
                ? "bg-slate-800 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* Info Status Jumlah Data */}
      {!loadingPharmacies && filteredPharmacies.length > 0 && (
        <div className="flex items-center gap-1.5 rounded-xl bg-blue-50/80 px-2.5 py-1.5 text-[11px] text-blue-700 shrink-0">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-blue-600" />
          <span>
            Menampilkan <strong>{filteredPharmacies.length}</strong> fasilitas kesehatan terdekat.
          </span>
        </div>
      )}

      {/* Daftar Fasilitas Scrollable */}
      <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
        {loadingPharmacies ? (
          <div className="space-y-2">
            <div className="text-center py-2 text-xs text-blue-600 font-medium animate-pulse">
              Memuat fasilitas terdekat di sekitar lokasi Anda...
            </div>
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 animate-pulse rounded-2xl bg-slate-100 p-3" />
            ))}
          </div>
        ) : filteredPharmacies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
            Tidak ada fasilitas kesehatan ditemukan untuk filter ini. Silakan pilih kategori &quot;Semua&quot; atau perbesar radius.
          </div>
        ) : (
          displayedPharmacies.map((pharm, idx) => {
            const isSelected = selectedPharmacy?.id === pharm.id;
            const isScheduleOpen = expandedScheduleId === pharm.id;
            const isHospital = pharm.facilityType === "hospital";
            const isClinic = pharm.facilityType === "clinic";

            return (
              <button
                key={place.id}
                type="button"
                onClick={() => onSelectPlace(isSelected ? null : place)}
                className={`group w-full rounded-2xl p-3.5 text-left transition border ${
                  isSelected
                    ? isHospital
                      ? "border-red-500 bg-red-50/80 shadow-md ring-2 ring-red-300"
                      : "border-[color:var(--color-clinic-blue)] bg-[color:var(--color-clinic-blue-soft)]/60 shadow-md ring-2 ring-[color:var(--color-clinic-blue)]/20"
                    : isHospital
                    ? "border-red-200 bg-white hover:border-red-300 hover:bg-red-50/30 shadow-2xs"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <span
                      className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                        isSelected
                          ? isHospital
                            ? "bg-red-600 text-white"
                            : "bg-[color:var(--color-clinic-blue)] text-white"
                          : isHospital
                          ? "bg-red-100 text-red-700"
                          : isClinic
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isHospital ? (
                        <Building2 className="h-3.5 w-3.5" />
                      ) : isClinic ? (
                        <Stethoscope className="h-3.5 w-3.5" />
                      ) : (
                        `#${idx + 1}`
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {pharm.name}
                        </h5>

                        {isHospital ? (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700 border border-red-200">
                            🏥 Rumah Sakit / IGD
                          </span>
                        ) : isClinic ? (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 border border-blue-200">
                            🩺 Klinik Medis
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                            💊 Apotek
                          </span>
                        )}

                        <SourceBadge
                          dataSource={pharm._dataSource}
                          trustScore={pharm._trustScore}
                        />
                      </div>

                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
                        {pharm.rating && (
                          <span className="flex items-center gap-0.5 font-semibold text-amber-600">
                            {pharm.rating}{" "}
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400 inline" />
                          </span>
                        )}
                        {place.user_ratings_total && (
                          <span className="text-slate-400">({place.user_ratings_total})</span>
                        )}
                        {pharm.rating && <span>•</span>}

                        {/* Operational Status Pill */}
                        {isHospital ? (
                          <span className="inline-flex items-center gap-0.5 font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded-md text-[10px]">
                            <CheckCircle2 className="h-3 w-3" /> IGD 24 Jam
                          </span>
                        ) : pharm.openingStatus === "closing-soon" ? (
                          <span className="inline-flex items-center gap-0.5 font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md text-[10px]">
                            <Clock3 className="h-3 w-3" /> Tutup Segera
                          </span>
                        ) : pharm.isOpenNow === false || pharm.openingStatus === "closed" ? (
                          <span className="inline-flex items-center gap-0.5 font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md text-[10px]">
                            <AlertCircle className="h-3 w-3" /> Tutup
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md text-[10px]">
                            <CheckCircle2 className="h-3 w-3" /> Sedang Buka
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                        {place.address}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                    isHospital
                      ? "bg-red-50 text-red-700 border-red-100"
                      : "bg-blue-50 text-blue-700 border-blue-100"
                  }`}>
                    {pharm.distanceKm} km
                  </span>
                </div>

                {/* Jam Operasional Text & Schedule Toggle */}
                <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                  {pharm.openingHoursText && (
                    <span
                      className={`flex items-center gap-1 font-medium ${
                        isHospital
                          ? "text-red-700"
                          : pharm.openingStatus === "closing-soon"
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
          })
        )}

        {/* Tombol Perluas / Ciutkan Daftar Bertahap */}
        {!loadingPharmacies && filteredPharmacies.length > INITIAL_DISPLAY_COUNT && (
          <button
            type="button"
            onClick={() => setShowAllItems(!showAllItems)}
            className="flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-semibold text-[color:var(--color-clinic-blue)] bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition shrink-0"
          >
            {showAllItems ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Tampilkan Lebih Sedikit
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Lihat {filteredPharmacies.length - INITIAL_DISPLAY_COUNT} Fasilitas Lainnya
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

interface RouteOverlayProps {
  selectedPlace: PlaceNode | null;
  routeInfo: RouteInfo | null;
  loadingRoute: boolean;
  transportMode: TransportMode;
  userLocation: [number, number] | null;
  onTransportModeChange: (mode: TransportMode) => void;
  onClose: () => void;
}

export function RouteOverlayCard({
  selectedPlace,
  routeInfo,
  loadingRoute,
  transportMode,
  userLocation,
  onTransportModeChange,
  onClose,
}: RouteOverlayProps) {
  if (!selectedPlace) return null;

  const label = selectedPlace.placeType === "hospital" ? "RUMAH SAKIT TERPILIH" : "APOTEK TERPILIH";

  const isHospital = selectedPharmacy.facilityType === "hospital";
  const isClinic = selectedPharmacy.facilityType === "clinic";

  return (
    <div className="animate-fade-up flex flex-col gap-2.5 rounded-2xl bg-white p-4 shadow-sm border border-slate-200 w-full shrink-0">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
              isHospital ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-700"
            }`}>
              {isHospital ? "RUMAH SAKIT TERPILIH" : isClinic ? "KLINIK TERPILIH" : "APOTEK TERPILIH"}
            </span>
            <SourceBadge
              dataSource={selectedPharmacy._dataSource}
              trustScore={selectedPharmacy._trustScore}
            />
          </div>
          <h4 className="line-clamp-1 text-sm font-extrabold text-slate-900">
            {selectedPlace.name}
          </h4>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
            {selectedPlace.rating && (
              <span className="flex items-center gap-0.5 font-bold text-amber-600">
                {selectedPharmacy.rating}{" "}
                <Star className="h-3 w-3 fill-amber-400 text-amber-400 inline" />
              </span>
            )}
            {selectedPlace.user_ratings_total && (
              <span className="text-slate-400">({selectedPlace.user_ratings_total})</span>
            )}
            {selectedPharmacy.rating && <span>•</span>}
            <span className={`font-semibold ${isHospital ? "text-red-700" : "text-emerald-700"}`}>
              {isHospital ? "Pelayanan IGD 24 Jam" : (selectedPharmacy.openingHoursText || "Buka")}
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
        📍 {selectedPlace.address}
      </p>

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
              `~${selectedPlace.distanceKm} km`
            )}
          </span>
        </div>
      </div>

      {(() => {
        let mapsUrl = `https://www.google.com/maps/dir/?api=1`;
        if (userLocation) {
          mapsUrl += `&origin=${userLocation[0]},${userLocation[1]}`;
        }
        if (selectedPlace.placeId) {
          mapsUrl += `&destination=${encodeURIComponent(selectedPlace.name)}&destination_place_id=${selectedPlace.placeId}`;
        } else {
          mapsUrl += `&destination=${encodeURIComponent(`${selectedPlace.name}, ${selectedPlace.address || ""}`)}`;
        }
        mapsUrl += `&travelmode=${transportMode === "motorcycle" ? "two_wheeler" : "driving"}`;

        return (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center justify-center gap-1.5 w-full rounded-xl py-2 text-xs font-bold text-white shadow-md transition ${
              isHospital
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue-dark)]"
            }`}
          >
            Buka Navigasi Rute Cepat
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        );
      })()}
    </div>
  );
}
