import { useEffect, useState, useCallback, useRef } from "react";
import { Compass, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import {
  DEFAULT_CENTER,
  fetchNearbyPharmacies,
  fetchOSRMRoute,
  type PharmacyNode,
  type RouteInfo,
  type TransportMode,
} from "./maps.service";
import { PharmacyList, RouteOverlayCard } from "./PharmacyList";

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "320px",
};

interface ExtendedRouteInfo extends RouteInfo {
  directionsResult?: google.maps.DirectionsResult | null;
}

const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];

// Komponen penanganan rute native Google Maps agar hapus & ganti rute berjalan 100% presisi seperti Google Maps
function MapRouteRenderer({
  map,
  routeInfo,
}: {
  map: google.maps.Map | null;
  routeInfo: ExtendedRouteInfo | null;
}) {
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    // 1. HAPUS SEMUA RUTE LAMA SEBELUMNYA DARI PETA (setMap null)
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (!map || !routeInfo) return;

    // 2. JIKA ADA HASIL RUTE GOOGLE DIRECTIONS -> GAMBAR DENGAN DIRECTIONS RENDERER
    if (routeInfo.directionsResult) {
      const renderer = new google.maps.DirectionsRenderer({
        map: map,
        directions: routeInfo.directionsResult,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#2563eb",
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });
      directionsRendererRef.current = renderer;
    }
    // 3. JIKA PAKAI FALLBACK OSRM -> GAMBAR DENGAN POLYLINE NATIVE GOOGLE MAPS
    else if (routeInfo.coordinates && routeInfo.coordinates.length > 0) {
      const path = routeInfo.coordinates.map((c) => ({ lat: c[0], lng: c[1] }));
      const polyline = new google.maps.Polyline({
        map: map,
        path: path,
        strokeColor: "#2563eb",
        strokeWeight: 5,
        strokeOpacity: 0.8,
      });
      polylineRef.current = polyline;
    }

    // UNMOUNT CLEANUP
    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [map, routeInfo]);

  return null;
}

export function PharmacyMap() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [pharmacies, setPharmacies] = useState<PharmacyNode[]>([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState<boolean>(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyNode | null>(null);
  const [activeMarker, setActiveMarker] = useState<number | string | null>(null);

  const [transportMode, setTransportMode] = useState<TransportMode>("driving");

  const [routeInfo, setRouteInfo] = useState<ExtendedRouteInfo | null>(null);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false);

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

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
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setLoadingLocation(false);
      },
      (err) => {
        setLoadingLocation(false);
        let errorMsg = "Tidak dapat mengambil lokasi presisi Anda. Menggunakan koordinat pusat umum.";
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = "Izin lokasi diblokir oleh browser. Silakan izinkan akses lokasi (GPS) pada alamat browser Anda lalu tekan 'Update Lokasi Saya'.";
        }
        setLocationError(errorMsg);
        setUserLocation(DEFAULT_CENTER);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  useEffect(() => {
    if (map && userLocation) {
      loadPharmacies(userLocation[0], userLocation[1]);
    }
  }, [map, userLocation]);

  const loadPharmacies = async (lat: number, lon: number) => {
    if (!map) return;
    setLoadingPharmacies(true);
    try {
      const nodes = await fetchNearbyPharmacies(lat, lon, map);
      setPharmacies(nodes);
    } catch (err) {
      console.error("Fetch Pharmacies Error:", err);
    } finally {
      setLoadingPharmacies(false);
    }
  };

  const [showCard, setShowCard] = useState<boolean>(false);

  const handleSelectPharmacy = (pharmacy: PharmacyNode | null) => {
    if (!pharmacy) {
      setShowCard(false);
      setActiveMarker(null);
      return;
    }

    // Memilih lokasi apotek baru -> tampilkan info card & ganti rute
    setSelectedPharmacy(pharmacy);
    setActiveMarker(pharmacy.id);
    setShowCard(true);
    setRouteInfo(null); // Bersihkan rute lama secara instan

    selectPharmacyAndRoute(pharmacy, transportMode);
  };

  const handleTransportModeChange = (newMode: TransportMode) => {
    setTransportMode(newMode);
    if (selectedPharmacy) {
      selectPharmacyAndRoute(selectedPharmacy, newMode);
    }
  };

  const selectPharmacyAndRoute = async (pharmacy: PharmacyNode, mode: TransportMode, origin?: [number, number]) => {
    const startLoc = origin || userLocation || DEFAULT_CENTER;
    setLoadingRoute(true);

    const useOSRMRoute = async () => {
      try {
        const osrmData = await fetchOSRMRoute(startLoc, pharmacy, mode);
        setRouteInfo({
          coordinates: osrmData.coordinates,
          distanceKm: osrmData.distanceKm,
          durationMin: osrmData.durationMin,
          directionsResult: null,
          mode: mode,
        });
      } catch (e) {
        console.error("OSRM Route Error:", e);
      } finally {
        setLoadingRoute(false);
      }
    };

    try {
      if (window.google && window.google.maps) {
        const directionsService = new window.google.maps.DirectionsService();
        
        const googleTravelMode = window.google.maps.TravelMode.DRIVING;

        directionsService.route(
          {
            origin: new window.google.maps.LatLng(startLoc[0], startLoc[1]),
            destination: new window.google.maps.LatLng(pharmacy.lat, pharmacy.lon),
            travelMode: googleTravelMode,
          },
          async (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK && result) {
              const leg = result.routes[0].legs[0];
              setRouteInfo({
                coordinates: [],
                distanceKm: leg.distance ? Number((leg.distance.value / 1000).toFixed(2)) : pharmacy.distanceKm,
                durationMin: leg.duration ? Math.ceil(leg.duration.value / 60) : Math.ceil(pharmacy.distanceKm * 4),
                directionsResult: result,
                mode: mode,
              });
              setLoadingRoute(false);
            } else {
              await useOSRMRoute();
            }
          }
        );
      } else {
        await useOSRMRoute();
      }
    } catch (err) {
      console.error("Google Directions Error, falling back to OSRM:", err);
      await useOSRMRoute();
    }
  };

  const mapCenter = userLocation ? { lat: userLocation[0], lng: userLocation[1] } : { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] };

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
            Klik lokasi apotek untuk menampilkan rute. Memilih lokasi lain akan otomatis mengganti rute.
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

      {loadError && (
         <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-800">
           <span>Error memuat Google Maps: {loadError.message}</span>
         </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="relative min-h-[380px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner md:min-h-[460px]">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={mapCenter}
              zoom={14}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                mapTypeControl: false,
                streetViewControl: false,
              }}
            >
              {userLocation && (
                <Marker 
                  position={{ lat: userLocation[0], lng: userLocation[1] }} 
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                  }}
                />
              )}

              {pharmacies.map((pharm) => (
                <Marker
                  key={pharm.id}
                  position={{ lat: pharm.lat, lng: pharm.lon }}
                  onClick={() => handleSelectPharmacy(pharm)}
                >
                  {activeMarker === pharm.id && (
                    <InfoWindow 
                      position={{ lat: pharm.lat, lng: pharm.lon }}
                      onCloseClick={() => {
                        setActiveMarker(null);
                        setShowCard(false);
                      }}
                    >
                      <div className="p-1.5 font-sans text-xs max-w-[200px]">
                        <strong className="block font-bold text-slate-900">{pharm.name}</strong>
                        {pharm.rating && (
                          <span className="block text-amber-600 font-semibold mt-0.5">
                            ⭐ {pharm.rating} ({pharm.userRatingsTotal || 0})
                          </span>
                        )}
                        <span className="block text-slate-500 mt-0.5">Jarak: ~{pharm.distanceKm} km</span>
                        {pharm.address && (
                          <span className="block text-[11px] text-slate-400 mt-0.5 line-clamp-2">{pharm.address}</span>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              ))}

              {/* Renderer Rute Native Google Maps (Auto Clean rute lama) */}
              <MapRouteRenderer map={map} routeInfo={routeInfo} />
            </GoogleMap>
          ) : (
            <div className="flex h-full min-h-[340px] items-center justify-center text-xs text-slate-400">
              Memuat Google Maps...
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
          <RouteOverlayCard
            selectedPharmacy={showCard ? selectedPharmacy : null}
            routeInfo={routeInfo}
            loadingRoute={loadingRoute}
            transportMode={transportMode}
            userLocation={userLocation}
            onTransportModeChange={handleTransportModeChange}
            onClose={() => {
              setShowCard(false);
              setActiveMarker(null);
            }}
          />

          <PharmacyList
            pharmacies={pharmacies}
            loadingPharmacies={loadingPharmacies}
            selectedPharmacy={selectedPharmacy}
            onSelectPharmacy={handleSelectPharmacy}
          />
        </div>
      </div>
    </div>
  );
}
