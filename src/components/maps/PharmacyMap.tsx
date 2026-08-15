import { useEffect, useState, useCallback, useRef } from "react";
import { Compass, MapPin, RefreshCw, Layers, Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import {
  DEFAULT_CENTER,
  fetchNearbyPharmacies,
  fetchOSRMRoute,
  fetchIPLocation,
  searchLocationByAddress,
  reverseGeocode,
  type GeocodeResult,
  type PharmacyNode,
  type RouteInfo,
  type TransportMode,
} from "./maps.service";
import { PharmacyList, RouteOverlayCard } from "./PharmacyList";
import { LeafletMap } from "./LeafletMap";

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "320px",
};

interface ExtendedRouteInfo extends RouteInfo {
  directionsResult?: google.maps.DirectionsResult | null;
}

const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];

// Komponen penanganan rute native Google Maps
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
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (!map || !routeInfo) return;

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
    } else if (routeInfo.coordinates && routeInfo.coordinates.length > 0) {
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
  const [locationSource, setLocationSource] = useState<string>("GPS Presisi (Lokasi Anda)");

  const [pharmacies, setPharmacies] = useState<PharmacyNode[]>([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState<boolean>(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyNode | null>(null);
  const [activeMarker, setActiveMarker] = useState<number | string | null>(null);

  const [transportMode, setTransportMode] = useState<TransportMode>("driving");
  const [routeInfo, setRouteInfo] = useState<ExtendedRouteInfo | null>(null);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false);

  // Search Address State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const [mapProvider, setMapProvider] = useState<"leaflet" | "google">("google");

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: googleApiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
    if (userLocation) {
      mapInstance.panTo({ lat: userLocation[0], lng: userLocation[1] });
      mapInstance.setZoom(15);
    }
  }, [userLocation]);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  useEffect(() => {
    getUserGeolocation();
  }, []);

  const getUserGeolocation = async () => {
    setLoadingLocation(true);
    setLocationError(null);
    setSearchResults([]);
    setShowSearchResults(false);
    setSelectedPharmacy(null);
    setRouteInfo(null);

    const updateLocation = async (coords: [number, number], source: string) => {
      setUserLocation(coords);
      setLocationSource(source);
      setLoadingLocation(false);
      if (map) {
        map.panTo({ lat: coords[0], lng: coords[1] });
        map.setZoom(15);
      }
      let addressName = "";
      try {
        addressName = (await reverseGeocode(coords[0], coords[1])) || "";
        if (addressName) {
          setSearchQuery(addressName);
        }
      } catch (e) {
        // ignore
      }
      loadPharmacies(coords[0], coords[1], addressName);
    };

    // Ambil perkiraan lokasi IP secara instan agar lokasi pertama yang ditunjukkan adalah lokasi tempat kita berada saat ini
    let hasFastLocation = false;
    fetchIPLocation().then((ipCoords) => {
      if (ipCoords && !hasFastLocation) {
        updateLocation(ipCoords, "Perkiraan Lokasi Anda (Jaringan/IP)");
      }
    });

    if (!navigator.geolocation) {
      const ipCoords = await fetchIPLocation();
      if (ipCoords) {
        hasFastLocation = true;
        await updateLocation(ipCoords, "Lokasi IP");
      } else {
        await updateLocation(DEFAULT_CENTER, "Lokasi Default (Jakarta)");
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        hasFastLocation = true;
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        await updateLocation(coords, "GPS Presisi (Lokasi Anda)");
      },
      async (err) => {
        console.warn("Geolocation API error, trying IP location fallback:", err);
        const ipCoords = await fetchIPLocation();
        if (ipCoords) {
          hasFastLocation = true;
          await updateLocation(ipCoords, "Lokasi Jaringan (IP)");
          setLocationError(
            "GPS browser tidak merespons. Menggunakan perkiraan lokasi IP. Anda dapat mengklik peta untuk menggeser ke titik presisi."
          );
        } else {
          await updateLocation(DEFAULT_CENTER, "Lokasi Default");
          setLocationError(
            "Izin lokasi tidak diberikan. Cari alamat atau klik pada peta untuk menentukan posisi Anda."
          );
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSearchResults(false);
    try {
      const results = await searchLocationByAddress(searchQuery);
      setSearchResults(results);
      if (results && results.length > 0) {
        // Otomatis pindahkan peta ke lokasi pertama hasil pencarian & cari apotek terdekat di sana
        handleSelectSearchResult(results[0]);
      } else {
        setShowSearchResults(true);
      }
    } catch (err) {
      console.error("Search address error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = async (result: GeocodeResult) => {
    const coords: [number, number] = [result.lat, result.lon];
    setUserLocation(coords);
    setLocationSource(`Alamat (${result.displayname.slice(0, 30)}...)`);
    setShowSearchResults(false);
    setSearchQuery(result.displayname);
    setSelectedPharmacy(null);
    setRouteInfo(null);

    if (map) {
      map.panTo({ lat: result.lat, lng: result.lon });
      map.setZoom(15);
    }
    await loadPharmacies(coords[0], coords[1], result.displayname);
  };

  const handleManualLocationChange = async (coords: [number, number]) => {
    setUserLocation(coords);
    setSelectedPharmacy(null);
    setRouteInfo(null);
    if (map) {
      map.panTo({ lat: coords[0], lng: coords[1] });
    }

    let newAddress = "";
    try {
      newAddress = (await reverseGeocode(coords[0], coords[1])) || "";
      if (newAddress) {
        setSearchQuery(newAddress);
        setLocationSource(`Pin (${newAddress.slice(0, 30)}...)`);
      } else {
        setLocationSource(`Pin Manual (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`);
      }
    } catch {
      setLocationSource(`Pin Manual (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`);
    }

    await loadPharmacies(coords[0], coords[1], newAddress);
  };

  useEffect(() => {
    if (userLocation && pharmacies.length === 0) {
      loadPharmacies(userLocation[0], userLocation[1], searchQuery);
    }
  }, [userLocation]);

  const loadPharmacies = async (lat: number, lon: number, addressName?: string) => {
    setLoadingPharmacies(true);
    try {
      const currentAddress = addressName || searchQuery;
      const nodes = await fetchNearbyPharmacies(lat, lon, map || undefined, currentAddress);
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
      setSelectedPharmacy(null);
      setRouteInfo(null);
      return;
    }

    setSelectedPharmacy(pharmacy);
    setActiveMarker(pharmacy.id);
    setShowCard(true);
    setRouteInfo(null);

    selectPharmacyAndRoute(pharmacy, transportMode);
  };

  const handleTransportModeChange = (newMode: TransportMode) => {
    setTransportMode(newMode);
    if (selectedPharmacy) {
      selectPharmacyAndRoute(selectedPharmacy, newMode);
    }
  };

  const selectPharmacyAndRoute = async (
    pharmacy: PharmacyNode,
    mode: TransportMode,
    origin?: [number, number]
  ) => {
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
      if (mapProvider === "google" && window.google && window.google.maps) {
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
                distanceKm: leg.distance
                  ? Number((leg.distance.value / 1000).toFixed(2))
                  : pharmacy.distanceKm,
                durationMin: leg.duration
                  ? Math.ceil(leg.duration.value / 60)
                  : Math.ceil(pharmacy.distanceKm * 4),
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

  const mapCenter = userLocation
    ? { lat: userLocation[0], lng: userLocation[1] }
    : { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] };

  return (
    <div className="animate-fade-up mt-6 rounded-2xl bg-white p-5 shadow-[var(--shadow-clinic-lg)]">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
              <Compass className="h-4 w-4" />
            </span>
            <h3 className="font-display text-base font-bold text-[color:var(--color-clinic-ink)]">
              Peta Apotek Terdekat & Rute Real-Time
            </h3>
          </div>
          <p className="mt-1 text-xs text-[color:var(--color-clinic-muted)]">
            Cari alamat, klik pada peta, atau izinkan GPS untuk mendapatkan titik lokasi presisi Anda.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            onClick={getUserGeolocation}
            variant="outline"
            size="sm"
            disabled={loadingLocation}
            className="w-fit gap-1.5 rounded-full text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingLocation ? "animate-spin" : ""}`} />
            {loadingLocation ? "Mencari GPS..." : "GPS Presisi"}
          </Button>
        </div>
      </div>

      {/* Baris Pencarian Alamat & Penanda Lokasi Presisi */}
      <div className="relative mb-4">
        <form onSubmit={handleAddressSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari lokasi Anda (misal: Tajur Bogor, Surabaya, Jl. Sudirman)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs rounded-xl border-slate-200"
            />
          </div>
          <Button type="submit" size="sm" className="rounded-xl text-xs bg-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue-dark)]">
            {isSearching ? "Mencari..." : "Cari Alamat"}
          </Button>
        </form>

        {/* Dropdown Hasil Pencarian Alamat */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg text-xs">
            {searchResults.map((res, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSearchResult(res)}
                className="w-full text-left p-2 hover:bg-slate-50 rounded-lg flex items-start gap-2 border-b border-slate-50 last:border-0"
              >
                <MapPin className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                <span className="text-slate-800 line-clamp-2">{res.displayname}</span>
              </button>
            ))}
          </div>
        )}

        {showSearchResults && searchResults.length === 0 && !isSearching && searchQuery && (
          <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs text-slate-500">
            Alamat tidak ditemukan. Coba ketik nama kota atau nama jalan lebih spesifik.
          </div>
        )}
      </div>

      {/* Info Status Akurasi Lokasi */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-600 border border-slate-100">
        <div className="flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>Posisi Aktif: <strong className="text-slate-900">{locationSource}</strong></span>
          {userLocation && (
            <span className="text-slate-400 font-mono text-[10px]">({userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)})</span>
          )}
        </div>
        <span className="text-slate-400">💡 <em>Klik pada peta atau geser pin hijau untuk geser titik lokasi presisi</em></span>
      </div>

      {locationError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="relative min-h-[380px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner md:min-h-[460px]">
          {mapProvider === "leaflet" ? (
            <LeafletMap
              userLocation={userLocation}
              pharmacies={pharmacies}
              selectedPharmacy={selectedPharmacy}
              routeInfo={routeInfo}
              onSelectPharmacy={handleSelectPharmacy}
              onLocationChange={handleManualLocationChange}
            />
          ) : isLoaded ? (
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
              onClick={(e) => {
                if (e.latLng) {
                  handleManualLocationChange([e.latLng.lat(), e.latLng.lng()]);
                }
              }}
            >
              {userLocation && (
                <Marker
                  position={{ lat: userLocation[0], lng: userLocation[1] }}
                  draggable={true}
                  onDragEnd={(e) => {
                    if (e.latLng) {
                      handleManualLocationChange([e.latLng.lat(), e.latLng.lng()]);
                    }
                  }}
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
                          <span className="block text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                            {pharm.address}
                          </span>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              ))}

              <MapRouteRenderer map={map} routeInfo={routeInfo} />
            </GoogleMap>
          ) : (
            <div className="flex h-full min-h-[340px] flex-col items-center justify-center gap-2 text-xs text-slate-500">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <span>Memuat Google Maps...</span>
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
