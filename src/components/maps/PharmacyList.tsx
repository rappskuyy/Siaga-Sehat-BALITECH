import { ExternalLink, Navigation, Pill, Phone } from "lucide-react";
import type { PharmacyNode, RouteInfo } from "./maps.service";

interface PharmacyListProps {
  pharmacies: PharmacyNode[];
  loadingPharmacies: boolean;
  selectedPharmacy: PharmacyNode | null;
  onSelectPharmacy: (pharmacy: PharmacyNode) => void;
}

export function PharmacyList({
  pharmacies,
  loadingPharmacies,
  selectedPharmacy,
  onSelectPharmacy,
}: PharmacyListProps) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-clinic-muted)]">
        Daftar Apotek Terdekat ({pharmacies.length})
      </h4>

      {loadingPharmacies ? (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 animate-pulse rounded-xl bg-slate-100 p-3" />
          ))}
        </div>
      ) : pharmacies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
          Tidak ada data apotek terdaftar di OpenStreetMap pada radius 3.5 km lokasi ini.
        </div>
      ) : (
        <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
          {pharmacies.map((pharm) => {
            const isSelected = selectedPharmacy?.id === pharm.id;
            return (
              <button
                key={pharm.id}
                type="button"
                onClick={() => onSelectPharmacy(pharm)}
                className={`group w-full rounded-xl p-3 text-left transition border ${
                  isSelected
                    ? "border-[color:var(--color-clinic-blue)] bg-[color:var(--color-clinic-blue-soft)]/50 shadow-sm"
                    : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <Pill
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        isSelected
                          ? "text-[color:var(--color-clinic-blue)]"
                          : "text-slate-400"
                      }`}
                    />
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 line-clamp-1">
                        {pharm.name}
                      </h5>
                      <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                        {pharm.address}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-2xs">
                    {pharm.distanceKm} km
                  </span>
                </div>

                {pharm.phone && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{pharm.phone}</span>
                  </div>
                )}
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
}

export function RouteOverlayCard({
  selectedPharmacy,
  routeInfo,
  loadingRoute,
}: RouteOverlayProps) {
  if (!selectedPharmacy) return null;

  return (
    <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-3 rounded-xl bg-white/95 p-3 shadow-md backdrop-blur md:left-4 md:right-auto md:max-w-sm">
      <div className="flex items-center gap-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--color-clinic-blue)] text-white">
          <Navigation className="h-4 w-4" />
        </div>
        <div>
          <h4 className="line-clamp-1 text-xs font-bold text-slate-800">
            {selectedPharmacy.name}
          </h4>
          <p className="text-[11px] text-slate-500">
            {loadingRoute ? (
              "Menghitung rute tercepat..."
            ) : routeInfo ? (
              <span>
                Jarak: <strong>{routeInfo.distanceKm} km</strong> • Perkiraan:{" "}
                <strong>{routeInfo.durationMin} menit</strong>
              </span>
            ) : (
              `Jarak: ~${selectedPharmacy.distanceKm} km`
            )}
          </p>
        </div>
      </div>

      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPharmacy.lat},${selectedPharmacy.lon}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[color:var(--color-clinic-blue-soft)] px-2.5 py-1.5 text-xs font-medium text-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue)] hover:text-white"
      >
        G-Maps
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
