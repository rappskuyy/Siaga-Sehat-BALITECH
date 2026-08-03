import { useEffect, useState } from "react";
import { Compass, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_CENTER,
  fetchNearbyPharmacies,
  fetchOSRMRoute,
  type PharmacyNode,
  type RouteInfo,
} from "./maps.service";
import { PharmacyList, RouteOverlayCard } from "./PharmacyList";

// Import CSS Leaflet
import "leaflet/dist/leaflet.css";

export function PharmacyMap() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [pharmacies, setPharmacies] = useState<PharmacyNode[]>([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState<boolean>(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyNode | null>(null);

  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false);

  const [leafletComponents, setLeafletComponents] = useState<any>(null);

  // Dynamic import react-leaflet & leaflet untuk SSR/Vite compatibility
  useEffect(() => {
    Promise.all([import("react-leaflet"), import("leaflet")]).then(
      ([reactLeaflet, L]) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        setLeafletComponents({
          MapContainer: reactLeaflet.MapContainer,
          TileLayer: reactLeaflet.TileLayer,
          Marker: reactLeaflet.Marker,
          Popup: reactLeaflet.Popup,
          Polyline: reactLeaflet.Polyline,
          useMap: reactLeaflet.useMap,
          L,
        });
      },
    );
  }, []);

  // Minta Geolocation Browser saat pertama kali
  useEffect(() => {
    getUserGeolocation();
  }, []);

  const getUserGeolocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Browser Anda tidak mendukung Geolocation API.");
      return;
    }
    setLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setLoadingLocation(false);
        await loadPharmacies(coords[0], coords[1]);
      },
      async (err) => {
        setLoadingLocation(false);
        let errorMsg = "Tidak dapat mengambil lokasi presisi Anda. Menggunakan koordinat pusat umum.";
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = "Izin lokasi diblokir oleh browser. Silakan izinkan akses lokasi (GPS) pada alamat browser Anda lalu tekan 'Update Lokasi Saya'.";
        }
        setLocationError(errorMsg);
        setUserLocation(DEFAULT_CENTER);
        await loadPharmacies(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const loadPharmacies = async (lat: number, lon: number) => {
    setLoadingPharmacies(true);
    try {
      const nodes = await fetchNearbyPharmacies(lat, lon);
      setPharmacies(nodes);
      if (nodes.length > 0) {
        selectPharmacyAndRoute(nodes[0], [lat, lon]);
      }
    } catch (err) {
      console.error("Fetch Pharmacies Error:", err);
    } finally {
      setLoadingPharmacies(false);
    }
  };

  const selectPharmacyAndRoute = async (pharmacy: PharmacyNode, origin?: [number, number]) => {
    setSelectedPharmacy(pharmacy);
    const startLoc = origin || userLocation || DEFAULT_CENTER;

    setLoadingRoute(true);
    try {
      const route = await fetchOSRMRoute(startLoc, pharmacy);
      setRouteInfo(route);
    } catch (err) {
      console.error("Route Error:", err);
    } finally {
      setLoadingRoute(false);
    }
  };

  function MapViewUpdater({ center }: { center: [number, number] }) {
    const map = leafletComponents?.useMap();
    useEffect(() => {
      if (map && center) {
        map.setView(center, 14, { animate: true });
      }
    }, [map, center]);
    return null;
  }

  const mapCenter = userLocation || DEFAULT_CENTER;

  return (
    <div className="animate-fade-up mt-6 rounded-2xl bg-white p-5 shadow-[var(--shadow-clinic-lg)]">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
              <Compass className="h-4 w-4" />
            </span>
            <h3 className="font-display text-base font-bold text-[color:var(--color-clinic-ink)]">
              Peta Apotek Terdekat & Rute Jalan
            </h3>
          </div>
          <p className="mt-1 text-xs text-[color:var(--color-clinic-muted)]">
            Temukan lokasi apotek terdekat untuk membeli rekomendasi obat secara cepat.
          </p>
        </div>

        <Button
          onClick={getUserGeolocation}
          variant="outline"
          size="sm"
          disabled={loadingLocation}
          className="w-fit gap-1.5 rounded-full text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingLocation ? "animate-spin" : ""}`} />
          {loadingLocation ? "Mencari Lokasi..." : "Update Lokasi Saya"}
        </Button>
      </div>

      {locationError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="relative min-h-[320px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner md:min-h-[380px]">
          {leafletComponents ? (
            <leafletComponents.MapContainer
              center={mapCenter}
              zoom={14}
              scrollWheelZoom={false}
              className="h-full w-full min-h-[320px] md:min-h-[380px] z-10"
            >
              <leafletComponents.TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />

              <MapViewUpdater center={mapCenter} />

              {userLocation && (
                <leafletComponents.Marker position={userLocation}>
                  <leafletComponents.Popup>
                    <div className="p-1 font-sans text-xs">
                      <strong className="text-emerald-700">📍 Lokasi Anda</strong>
                    </div>
                  </leafletComponents.Popup>
                </leafletComponents.Marker>
              )}

              {pharmacies.map((pharm) => (
                <leafletComponents.Marker
                  key={pharm.id}
                  position={[pharm.lat, pharm.lon]}
                  eventHandlers={{
                    click: () => selectPharmacyAndRoute(pharm),
                  }}
                >
                  <leafletComponents.Popup>
                    <div className="p-1 font-sans text-xs">
                      <strong className="block font-bold text-slate-800">{pharm.name}</strong>
                      <span className="block text-slate-500">Jarak: ~{pharm.distanceKm} km</span>
                      {pharm.address && (
                        <span className="block text-[11px] text-slate-400">{pharm.address}</span>
                      )}
                    </div>
                  </leafletComponents.Popup>
                </leafletComponents.Marker>
              ))}

              {routeInfo && routeInfo.coordinates.length > 0 && (
                <leafletComponents.Polyline
                  positions={routeInfo.coordinates}
                  color="#2563eb"
                  weight={5}
                  opacity={0.8}
                />
              )}
            </leafletComponents.MapContainer>
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center text-xs text-slate-400">
              Memuat Peta Leaflet...
            </div>
          )}

          <RouteOverlayCard
            selectedPharmacy={selectedPharmacy}
            routeInfo={routeInfo}
            loadingRoute={loadingRoute}
          />
        </div>

        <PharmacyList
          pharmacies={pharmacies}
          loadingPharmacies={loadingPharmacies}
          selectedPharmacy={selectedPharmacy}
          onSelectPharmacy={(pharm) => selectPharmacyAndRoute(pharm)}
        />
      </div>
    </div>
  );
}
