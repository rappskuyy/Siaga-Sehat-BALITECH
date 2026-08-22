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
  Building2,
  Stethoscope,
  Pill,
  CheckCircle2,
  AlertCircle,
  Clock3,
  ArrowUpDown,
} from "lucide-react";
import type { PlaceNode, PharmacyNode, RouteInfo, TransportMode, DangerLevelType } from "./maps.service";
import { SourceBadge } from "./SourceBadge";

interface PharmacyListProps {
  pharmacies: PharmacyNode[];
  loadingPharmacies: boolean;
  selectedPharmacy: PharmacyNode | null;
  selectedPlace: PlaceNode | null;
  routeInfo: RouteInfo | null;
  loadingRoute: boolean;
  transportMode: TransportMode;
  userLocation: [number, number] | null;
  dangerLevel?: DangerLevelType;
  onSelectPharmacy: (pharmacy: PharmacyNode | null) => void;
  onTransportModeChange: (mode: TransportMode) => void;
  onCloseCard: () => void;
}

export function PharmacyList({
  pharmacies,
  loadingPharmacies,
  selectedPharmacy,
  selectedPlace,
  routeInfo,
  loadingRoute,
  transportMode,
  userLocation,
  dangerLevel = "rendah",
  onSelectPharmacy,
  onTransportModeChange,
  onCloseCard,
}: PharmacyListProps) {
  const [maxRadius, setMaxRadius] = useState<number | null>(null);
  const [showAllItems, setShowAllItems] = useState<boolean>(false);
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | number | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "pharmacy" | "hospital" | "clinic">("all");
  const [sortBy, setSortBy] = useState<"distance" | "hospital_first" | "pharmacy_first" | "rating">("distance");

  useEffect(() => {
    if (dangerLevel === "tinggi") {
      setTypeFilter("hospital");
      setSortBy("hospital_first");
    } else {
      setTypeFilter("all");
    }
  }, [dangerLevel]);

  // Hitung jumlah masing-masing kategori
  const hospitalCount = useMemo(
    () => pharmacies.filter((p) => p.facilityType === "hospital").length,
    [pharmacies]
  );
  const pharmacyCount = useMemo(
    () => pharmacies.filter((p) => p.facilityType === "pharmacy" || !p.facilityType).length,
    [pharmacies]
  );
  const clinicCount = useMemo(
    () => pharmacies.filter((p) => p.facilityType === "clinic").length,
    [pharmacies]
  );

  const processedPharmacies = useMemo(() => {
    // 1. Filter
    let list = pharmacies.filter((p) => {
      if (maxRadius !== null && p.distanceKm > maxRadius) return false;
      if (typeFilter === "hospital") return p.facilityType === "hospital";
      if (typeFilter === "clinic") return p.facilityType === "clinic";
      if (typeFilter === "pharmacy") return p.facilityType === "pharmacy" || !p.facilityType;
      return true;
    });

    // 2. Sort
    list = [...list].sort((a, b) => {
      if (sortBy === "hospital_first") {
        const aH = a.facilityType === "hospital" ? 0 : 1;
        const bH = b.facilityType === "hospital" ? 0 : 1;
        if (aH !== bH) return aH - bH;
        return a.distanceKm - b.distanceKm;
      }
      if (sortBy === "pharmacy_first") {
        const aP = a.facilityType === "pharmacy" || !a.facilityType ? 0 : 1;
        const bP = b.facilityType === "pharmacy" || !b.facilityType ? 0 : 1;
        if (aP !== bP) return aP - bP;
        return a.distanceKm - b.distanceKm;
      }
      if (sortBy === "rating") {
        const aR = a.rating || 0;
        const bR = b.rating || 0;
        if (aR !== bR) return bR - aR;
        return a.distanceKm - b.distanceKm;
      }
      return a.distanceKm - b.distanceKm;
    });

    return list;
  }, [pharmacies, maxRadius, typeFilter, sortBy]);

  const INITIAL_DISPLAY_COUNT = 4;
  const displayedPharmacies = showAllItems
    ? processedPharmacies
    : processedPharmacies.slice(0, INITIAL_DISPLAY_COUNT);

  return (
    <div className="flex flex-col gap-3 min-w-0 w-full h-full flex-1 overflow-hidden bg-[#FFFFFF] rounded-2xl p-3 sm:p-3.5 border border-[#E5E7EB] shadow-2xs">
      {/* Header List */}
      <div className="flex items-center justify-between shrink-0 pb-1.5 border-b border-[#E5E7EB]">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#379FD2]" />
            Daftar Fasilitas ({processedPharmacies.length})
          </h4>
          <p className="text-[10px] text-[#6B7280] mt-0.5">
            {dangerLevel === "tinggi" ? "Prioritas Rujukan RS & IGD" : "Klinik, RS & Apotek Terdekat"}
          </p>
        </div>

        {selectedPharmacy && (
          <button
            type="button"
            onClick={() => onSelectPharmacy(null)}
            className="text-[11px] font-semibold text-[#379FD2] hover:text-[#5BB4E0] flex items-center gap-1 shrink-0 transition cursor-pointer"
          >
            <X className="h-3 w-3" /> Bersihkan
          </button>
        )}
      </div>

      {/* Filter Section: Kategori, Radius & Sort */}
      <div className="flex flex-col gap-2 shrink-0">
        {/* Row 1: Kategori Fasilitas dengan badge warna jelas */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setTypeFilter("all");
              setShowAllItems(false);
            }}
            className={`inline-flex items-center justify-center rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition shrink-0 cursor-pointer ${
              typeFilter === "all"
                ? "bg-[#379FD2] text-[#FFFFFF] shadow-xs"
                : "bg-[#F7F9FB] text-[#6B7280] hover:bg-[#ABE2FE]/20 hover:text-[#379FD2] border border-[#E5E7EB]"
            }`}
          >
            Semua ({pharmacies.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setTypeFilter("hospital");
              setSortBy("hospital_first");
              setShowAllItems(false);
              if (hospitalCount === 0 || (maxRadius !== null && processedPharmacies.length === 0)) {
                setMaxRadius(null);
              }
            }}
            className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition shrink-0 cursor-pointer ${
              typeFilter === "hospital"
                ? "bg-[#EF4444] text-[#FFFFFF] shadow-xs"
                : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            Rumah Sakit ({hospitalCount})
          </button>

          <button
            type="button"
            onClick={() => {
              setTypeFilter("pharmacy");
              setSortBy("pharmacy_first");
              setShowAllItems(false);
            }}
            className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition shrink-0 cursor-pointer ${
              typeFilter === "pharmacy"
                ? "bg-[#379FD2] text-[#FFFFFF] shadow-xs"
                : "bg-blue-50 text-[#379FD2] hover:bg-blue-100 border border-blue-200"
            }`}
          >
            <Pill className="h-3.5 w-3.5" />
            Apotek ({pharmacyCount})
          </button>

          {clinicCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setTypeFilter("clinic");
                setShowAllItems(false);
              }}
              className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition shrink-0 cursor-pointer ${
                typeFilter === "clinic"
                  ? "bg-[#F59E0B] text-[#FFFFFF] shadow-xs"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              <Stethoscope className="h-3.5 w-3.5" />
              Klinik ({clinicCount})
            </button>
          )}
        </div>

        {/* Row 2: Sort & Filter Radius */}
        <div className="flex items-center justify-between gap-1 flex-wrap pt-0.5">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-[#6B7280] font-medium mr-0.5">Jarak:</span>
            {[2, 5, 10, null].map((r) => {
              const isRadiusActive = maxRadius === r;
              const label = r ? `≤ ${r} km` : "Semua";
              return (
                <button
                  key={r ?? "all"}
                  type="button"
                  onClick={() => {
                    setMaxRadius(r);
                    setShowAllItems(false);
                  }}
                  className={`inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-[10px] font-semibold transition shrink-0 cursor-pointer ${
                    isRadiusActive
                      ? "bg-[#ABE2FE] text-[#379FD2] font-bold border border-[#5BB4E0]/40"
                      : "bg-[#F7F9FB] text-[#6B7280] hover:bg-[#ABE2FE]/20 border border-[#E5E7EB]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3 text-[#6B7280]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-[10px] font-semibold bg-[#F7F9FB] text-[#379FD2] rounded-lg px-1.5 py-0.5 border border-[#E5E7EB] outline-none cursor-pointer"
            >
              <option value="distance">Jarak Terdekat</option>
              <option value="hospital_first">RS Dulu</option>
              <option value="pharmacy_first">Apotek Dulu</option>
              <option value="rating">Rating Tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Daftar Fasilitas Scrollable */}
      <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-1">
        {loadingPharmacies ? (
          <div className="space-y-2.5 py-2">
            <div className="text-center py-1 text-xs text-[#379FD2] font-medium animate-pulse">
              Memuat data fasilitas terdekat...
            </div>
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 animate-pulse rounded-2xl bg-[#F7F9FB] border border-[#E5E7EB] p-3" />
            ))}
          </div>
        ) : processedPharmacies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F7F9FB] p-5 text-center text-xs text-[#6B7280]">
            <p className="mb-2">Tidak ada fasilitas dalam radius ini.</p>
            {maxRadius !== null && (
              <button
                type="button"
                onClick={() => setMaxRadius(null)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#379FD2] hover:underline cursor-pointer"
              >
                Tampilkan Semua Jarak
              </button>
            )}
          </div>
        ) : (
          displayedPharmacies.map((pharm) => {
            const isSelected = selectedPharmacy?.id === pharm.id;
            const isScheduleOpen = expandedScheduleId === pharm.id;
            const isHospital = pharm.facilityType === "hospital";
            const isClinic = pharm.facilityType === "clinic";

            return (
              <button
                key={pharm.id}
                type="button"
                onClick={() => onSelectPharmacy(isSelected ? null : pharm)}
                className={`group w-full rounded-2xl p-3 text-left transition border cursor-pointer ${
                  isSelected
                    ? isHospital
                      ? "bg-red-50/80 border-[#EF4444] shadow-sm"
                      : isClinic
                      ? "bg-amber-50/80 border-[#F59E0B] shadow-sm"
                      : "bg-blue-50/80 border-[#379FD2] shadow-sm"
                    : isHospital
                    ? "bg-[#FFFFFF] border-red-100 hover:border-red-300 hover:bg-red-50/30 shadow-2xs"
                    : isClinic
                    ? "bg-[#FFFFFF] border-amber-100 hover:border-amber-300 hover:bg-amber-50/30 shadow-2xs"
                    : "bg-[#FFFFFF] border-[#E5E7EB] hover:border-[#379FD2]/60 hover:bg-blue-50/20 shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    {/* Facility Indicator with matching Color: Hospital=Red, Clinic=Yellow, Pharmacy=Blue */}
                    <span
                      className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-xl text-xs font-bold transition ${
                        isHospital
                          ? isSelected
                            ? "bg-[#EF4444] text-[#FFFFFF] shadow-xs"
                            : "bg-red-100 text-[#EF4444] border border-red-200"
                          : isClinic
                          ? isSelected
                            ? "bg-[#F59E0B] text-[#FFFFFF] shadow-xs"
                            : "bg-amber-100 text-[#D97706] border border-amber-200"
                          : isSelected
                          ? "bg-[#379FD2] text-[#FFFFFF] shadow-xs"
                          : "bg-blue-50 text-[#379FD2] border border-blue-200"
                      }`}
                    >
                      {isHospital ? (
                        <Building2 className="h-3.5 w-3.5" />
                      ) : isClinic ? (
                        <Stethoscope className="h-3.5 w-3.5" />
                      ) : (
                        <Pill className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h5 className="text-xs font-bold text-[#111111] line-clamp-1">
                          {pharm.name}
                        </h5>

                        <span
                          className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                            isHospital
                              ? "bg-red-50 text-[#EF4444] border-red-200"
                              : isClinic
                              ? "bg-amber-50 text-[#D97706] border-amber-200"
                              : "bg-blue-50 text-[#379FD2] border-blue-200"
                          }`}
                        >
                          {isHospital ? "🏥 Rumah Sakit" : isClinic ? "🩺 Klinik" : "💊 Apotek"}
                        </span>

                        <SourceBadge
                          dataSource={pharm._dataSource}
                          trustScore={pharm._trustScore}
                        />
                      </div>

                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#6B7280] flex-wrap">
                        {pharm.rating && (
                          <span className="flex items-center gap-0.5 font-bold text-[#379FD2]">
                            {pharm.rating}{" "}
                            <Star className="h-3 w-3 fill-[#379FD2] text-[#379FD2] inline" />
                          </span>
                        )}
                        {pharm.userRatingsTotal && (
                          <span className="text-[#6B7280]">({pharm.userRatingsTotal})</span>
                        )}
                        {pharm.rating && <span>•</span>}

                        {/* Status Pill */}
                        {isHospital ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[#FFFFFF] bg-[#EF4444] px-2 py-0.5 rounded-full text-[9px]">
                            <CheckCircle2 className="h-2.5 w-2.5" /> IGD 24 Jam
                          </span>
                        ) : pharm.openingStatus === "closing-soon" ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#D97706] bg-amber-100 px-2 py-0.5 rounded-full text-[9px]">
                            <Clock3 className="h-2.5 w-2.5" /> Tutup Segera
                          </span>
                        ) : pharm.isOpenNow === false || pharm.openingStatus === "closed" ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#6B7280] bg-[#F7F9FB] px-2 py-0.5 rounded-full text-[9px] border border-[#E5E7EB]">
                            <AlertCircle className="h-2.5 w-2.5" /> Tutup
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#FFFFFF] bg-[#379FD2] px-2 py-0.5 rounded-full text-[9px]">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Buka
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-[11px] text-[#6B7280] line-clamp-1">
                        {pharm.address}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                      isHospital
                        ? "bg-red-50 text-[#EF4444] border-red-200"
                        : isClinic
                        ? "bg-amber-50 text-[#D97706] border-amber-200"
                        : "bg-blue-50 text-[#379FD2] border-blue-200"
                    }`}
                  >
                    {pharm.distanceKm} km
                  </span>
                </div>

                {/* Jam Operasional Text & Schedule Toggle */}
                <div className="mt-2 flex items-center justify-between border-t border-[#E5E7EB] pt-1.5 text-[11px]">
                  {pharm.openingHoursText && (
                    <span className="flex items-center gap-1 font-medium text-[#379FD2] text-[10px]">
                      <Clock className="h-3 w-3 shrink-0 text-[#5BB4E0]" />
                      <span className="line-clamp-1">{pharm.openingHoursText}</span>
                    </span>
                  )}

                  {pharm.operatingHours?.weekdayText && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedScheduleId(isScheduleOpen ? null : pharm.id);
                      }}
                      className="text-[10px] font-semibold text-[#379FD2] hover:text-[#5BB4E0] flex items-center gap-0.5 transition cursor-pointer"
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
                    className="mt-2 rounded-xl bg-[#F7F9FB] p-2.5 text-[10px] text-[#6B7280] space-y-1 border border-[#E5E7EB] animate-fade-in text-left"
                  >
                    <span className="font-bold text-[#111111] block mb-1">
                      📅 Jam Operasional:
                    </span>
                    {(pharm.operatingHours?.weekdayText ?? []).map((text: string, i: number) => (
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

        {/* Tombol Tampilkan Lebih Banyak */}
        {!loadingPharmacies && processedPharmacies.length > INITIAL_DISPLAY_COUNT && (
          <button
            type="button"
            onClick={() => setShowAllItems(!showAllItems)}
            className="flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-semibold text-[#379FD2] bg-[#F7F9FB] hover:bg-[#ABE2FE]/20 rounded-xl border border-[#E5E7EB] transition shrink-0 cursor-pointer"
          >
            {showAllItems ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Tampilkan Lebih Sedikit
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Lihat {processedPharmacies.length - INITIAL_DISPLAY_COUNT} Fasilitas Lainnya
              </>
            )}
          </button>
        )}
      </div>

      {/* 04. Kartu Informasi Fasilitas Terpilih (Diletakkan di Bawah Daftar, Tidak Menghalangi Peta) */}
      {selectedPlace && (
        <div className="shrink-0 pt-2 border-t border-[#E5E7EB]">
          <RouteOverlayCard
            selectedPlace={selectedPlace}
            routeInfo={routeInfo}
            loadingRoute={loadingRoute}
            transportMode={transportMode}
            userLocation={userLocation}
            onTransportModeChange={onTransportModeChange}
            onClose={onCloseCard}
          />
        </div>
      )}
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

/**
 * Detail Card Fasilitas Terpilih & Navigasi Rute
 */
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

  const isHospital = selectedPlace.facilityType === "hospital";
  const isClinic = selectedPlace.facilityType === "clinic";

  return (
    <div
      className={`animate-fade-up flex flex-col gap-2.5 rounded-2xl p-3.5 border w-full shadow-xs ${
        isHospital
          ? "bg-red-50/70 border-red-200"
          : isClinic
          ? "bg-amber-50/70 border-amber-200"
          : "bg-blue-50/70 border-blue-200"
      }`}
    >
      {/* Top Header inside Selected Card */}
      <div className="flex items-start justify-between gap-2 border-b border-[#E5E7EB] pb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold text-[#FFFFFF] shadow-xs ${
                isHospital ? "bg-[#EF4444]" : isClinic ? "bg-[#F59E0B]" : "bg-[#379FD2]"
              }`}
            >
              {isHospital ? "🏥 RUMAH SAKIT TERPILIH" : isClinic ? "🩺 KLINIK TERPILIH" : "💊 APOTEK TERPILIH"}
            </span>
            <SourceBadge
              dataSource={selectedPlace._dataSource}
              trustScore={selectedPlace._trustScore}
            />
          </div>

          <h4 className="line-clamp-1 text-xs font-extrabold text-[#111111]">
            {selectedPlace.name}
          </h4>

          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#6B7280] flex-wrap">
            {selectedPlace.rating && (
              <span className="flex items-center gap-0.5 font-bold text-[#379FD2]">
                {selectedPlace.rating}{" "}
                <Star className="h-2.5 w-2.5 fill-[#379FD2] text-[#379FD2] inline" />
              </span>
            )}
            {selectedPlace.userRatingsTotal && (
              <span>({selectedPlace.userRatingsTotal})</span>
            )}
            {selectedPlace.rating && <span>•</span>}
            <span className={`font-semibold ${isHospital ? "text-[#EF4444]" : "text-[#379FD2]"}`}>
              {isHospital ? "Pelayanan IGD 24 Jam" : (selectedPlace.openingHoursText || "Buka")}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#FFFFFF] text-[#6B7280] hover:bg-[#ABE2FE]/30 hover:text-[#379FD2] transition border border-[#E5E7EB] cursor-pointer"
          title="Tutup Kartu"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Address */}
      <p className="text-[10px] text-[#6B7280] line-clamp-2">
        📍 {selectedPlace.address}
      </p>

      {/* Mode Selector */}
      <div className="flex items-center gap-1 rounded-xl bg-[#FFFFFF] p-1 border border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => onTransportModeChange("driving")}
          className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1 text-[11px] font-semibold transition cursor-pointer ${
            transportMode === "driving"
              ? "bg-[#ABE2FE]/30 text-[#379FD2] border border-[#5BB4E0]/40 font-bold"
              : "text-[#6B7280] hover:text-[#111111]"
          }`}
        >
          <Car className="h-3 w-3" />
          Mobil
        </button>
        <button
          type="button"
          onClick={() => onTransportModeChange("motorcycle")}
          className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1 text-[11px] font-semibold transition cursor-pointer ${
            transportMode === "motorcycle"
              ? "bg-[#ABE2FE]/30 text-[#379FD2] border border-[#5BB4E0]/40 font-bold"
              : "text-[#6B7280] hover:text-[#111111]"
          }`}
        >
          <Bike className="h-3 w-3" />
          Motor
        </button>
      </div>

      {/* Distance & ETA */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#FFFFFF] p-2 text-xs border border-[#E5E7EB]">
        <div>
          <span className="block text-[9px] text-[#6B7280] font-medium">Jarak Estimasi</span>
          <span className="font-bold text-[#379FD2] text-xs">
            {routeInfo ? `${routeInfo.distanceKm} km` : `~${selectedPlace.distanceKm} km`}
          </span>
        </div>
        <div>
          <span className="block text-[9px] text-[#6B7280] font-medium">Waktu Tempuh (ETA)</span>
          <span className="font-bold text-[#379FD2] text-xs">
            {loadingRoute ? "Menghitung..." : routeInfo ? `~${routeInfo.durationMin} menit` : "Siap rute"}
          </span>
        </div>
      </div>

      {/* Primary CTA Button */}
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
            className={`flex items-center justify-center gap-1.5 w-full rounded-xl py-2.5 text-xs font-bold text-[#FFFFFF] shadow-xs hover:opacity-95 active:scale-[0.99] transition cursor-pointer ${
              isHospital ? "bg-[#EF4444]" : isClinic ? "bg-[#F59E0B]" : "bg-gradient-blue-primary"
            }`}
          >
            <Navigation className="h-3.5 w-3.5" />
            Buka Navigasi Rute Cepat
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      })()}
    </div>
  );
}
