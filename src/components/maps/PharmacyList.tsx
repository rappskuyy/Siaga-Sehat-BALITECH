import { useState } from "react";
import { ExternalLink, Navigation, Pill, Phone, Star, Clock, Car, Bike, X, Filter } from "lucide-react";
import type { PharmacyNode, RouteInfo, TransportMode } from "./maps.service";

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

  const filteredPharmacies = pharmacies.filter((p) => {
    if (maxRadius === null) return true;
    return p.distanceKm <= maxRadius;
  });

  return (
    <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
      <div className="flex items-center justify-between sticky top-0 bg-white py-1 z-10">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-clinic-muted)]">
          Daftar Apotek Terdekat ({filteredPharmacies.length})
        </h4>
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
          onClick={() => setMaxRadius(null)}
          className={`rounded-full px-2.5 py-0.5 font-medium transition ${
            maxRadius === null
              ? "bg-[color:var(--color-clinic-blue)] text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Semua ({pharmacies.length})
        </button>
        <button
          type="button"
          onClick={() => setMaxRadius(1)}
          className={`rounded-full px-2.5 py-0.5 font-medium transition ${
            maxRadius === 1
              ? "bg-[color:var(--color-clinic-blue)] text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          ≤ 1 km ({pharmacies.filter((p) => p.distanceKm <= 1).length})
        </button>
        <button
          type="button"
          onClick={() => setMaxRadius(3)}
          className={`rounded-full px-2.5 py-0.5 font-medium transition ${
            maxRadius === 3
              ? "bg-[color:var(--color-clinic-blue)] text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          ≤ 3 km ({pharmacies.filter((p) => p.distanceKm <= 3).length})
        </button>
        <button
          type="button"
          onClick={() => setMaxRadius(5)}
          className={`rounded-full px-2.5 py-0.5 font-medium transition ${
            maxRadius === 5
              ? "bg-[color:var(--color-clinic-blue)] text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          ≤ 5 km ({pharmacies.filter((p) => p.distanceKm <= 5).length})
        </button>
      </div>

      {loadingPharmacies ? (
        <div className="space-y-2">
          <div className="text-center py-2 text-xs text-blue-600 font-medium animate-pulse">
            Mencari apotek di titik baru...
          </div>
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 animate-pulse rounded-xl bg-slate-100 p-3" />
          ))}
        </div>
      ) : filteredPharmacies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
          {maxRadius
            ? `Tidak ada apotek dalam radius ≤ ${maxRadius} km. Coba pilih radius yang lebih besar.`
            : "Tidak ada data apotek ditemukan di sekitar lokasi ini."}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredPharmacies.map((pharm) => {
            const isSelected = selectedPharmacy?.id === pharm.id;
            return (
              <button
                key={pharm.id}
                type="button"
                onClick={() => onSelectPharmacy(isSelected ? null : pharm)}
                className={`group w-full rounded-2xl p-3.5 text-left transition border ${
                  isSelected
                    ? "border-[color:var(--color-clinic-blue)] bg-[color:var(--color-clinic-blue-soft)]/60 shadow-md ring-2 ring-[color:var(--color-clinic-blue)]/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                      isSelected ? "bg-[color:var(--color-clinic-blue)] text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      <Pill className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {pharm.name}
                      </h5>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                        {pharm.rating && (
                          <span className="flex items-center gap-0.5 font-semibold text-amber-600">
                            {pharm.rating} <Star className="h-3 w-3 fill-amber-400 text-amber-400 inline" />
                          </span>
                        )}
                        {pharm.userRatingsTotal && (
                          <span className="text-slate-400">({pharm.userRatingsTotal})</span>
                        )}
                        <span>•</span>
                        <span>Apotek</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                        {pharm.address}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                    {pharm.distanceKm} km
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                  {pharm.openingHoursText && (
                    <span className="flex items-center gap-1 font-medium text-emerald-700">
                      <Clock className="h-3 w-3 text-emerald-600" />
                      {pharm.openingHoursText}
                    </span>
                  )}
                  {pharm.phone && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Phone className="h-3 w-3 text-slate-400" />
                      {pharm.phone}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
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
          <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 mb-1">
            APOTEK TERPILIH
          </span>
          <h4 className="line-clamp-1 text-sm font-extrabold text-slate-900">
            {selectedPharmacy.name}
          </h4>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
            {selectedPharmacy.rating && (
              <span className="flex items-center gap-0.5 font-bold text-amber-600">
                {selectedPharmacy.rating} <Star className="h-3 w-3 fill-amber-400 text-amber-400 inline" />
              </span>
            )}
            {selectedPharmacy.userRatingsTotal && (
              <span className="text-slate-400">({selectedPharmacy.userRatingsTotal})</span>
            )}
            <span>•</span>
            <span className="text-emerald-700 font-semibold">{selectedPharmacy.openingHoursText || "Buka"}</span>
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
                <strong>{routeInfo.distanceKm} km</strong> (~{routeInfo.durationMin} mnt via {transportMode === "motorcycle" ? "motor" : "mobil"})
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
