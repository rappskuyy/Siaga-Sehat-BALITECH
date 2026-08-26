import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Compass,
  MapPin,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  Building2,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Pill,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import {
  DEFAULT_CENTER,
  fetchNearbyPlaces,
  fetchOSRMRoute,
  fetchIPLocation,
  searchLocationByAddress,
  reverseGeocode,
  type GeocodeResult,
  type PharmacyNode,
  type RouteInfo,
  type TransportMode,
  type DangerLevelType,
} from "./maps.service";
import { PharmacyList, RouteOverlayCard } from "./PharmacyList";
import { SourceSummaryBar } from "./SourceBadge";

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

interface PharmacyMapProps {
  dangerLevel?: DangerLevelType;
  conditionName?: string;
}

export function PharmacyMap({
  dangerLevel = "rendah",
  conditionName,
}: PharmacyMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSource, setLocationSource] = useState<string>("GPS Presisi (Lokasi Anda)");

  const [pharmacies, setPharmacies] = useState<PharmacyNode[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState<boolean>(false);
  const loadingPharmacies = loadingPlaces;
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

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: googleApiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
    if (userLocation) {
      mapInstance.panTo({ lat: userLocation[0], lng: userLocation[1] });
      mapInstance.setZoom(14);
    }
  }, [userLocation]);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const SAVED_LOCATION_KEY = "siaga_user_chosen_location";

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SAVED_LOCATION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.coords) && parsed.coords.length === 2) {
          setUserLocation(parsed.coords);
          setLocationSource(parsed.source || "Titik Pilihan Anda");
          if (parsed.address) setSearchQuery(parsed.address);
          loadPharmacies(parsed.coords[0], parsed.coords[1], parsed.address);
          return;
        }
      }
    } catch {
      // ignore
    }
    getUserGeolocation();
  }, []);

  const getUserGeolocation = async (isManualClick = false) => {
    if (isManualClick) {
      try {
        sessionStorage.removeItem(SAVED_LOCATION_KEY);
      } catch {}
    }

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
        map.setZoom(14);
      }
      let addressName = "";
      try {
        addressName = (await reverseGeocode(coords[0], coords[1])) || "";
        if (addressName) {
          setSearchQuery(addressName);
        }
      } catch {
        // ignore
      }
      loadPharmacies(coords[0], coords[1], addressName);
    };

    if (!navigator.geolocation) {
      const ipCoords = await fetchIPLocation();
      if (ipCoords) {
        await updateLocation(ipCoords, "Lokasi Jaringan (IP)");
      } else {
        await updateLocation(DEFAULT_CENTER, "Lokasi Default (Jakarta)");
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        await updateLocation(coords, "GPS Presisi (Lokasi Anda)");
      },
      async (err) => {
        console.warn("Geolocation API error, trying IP location fallback:", err);
        const ipCoords = await fetchIPLocation();
        if (ipCoords) {
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

    try {
      sessionStorage.setItem(
        SAVED_LOCATION_KEY,
        JSON.stringify({ coords, source: `Alamat (${result.displayname.slice(0, 30)}...)`, address: result.displayname })
      );
    } catch {}

    if (map) {
      map.panTo({ lat: result.lat, lng: result.lon });
      map.setZoom(14);
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

    try {
      sessionStorage.setItem(
        SAVED_LOCATION_KEY,
        JSON.stringify({
          coords,
          source: newAddress ? `Pin (${newAddress.slice(0, 30)}...)` : `Pin Manual (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`,
          address: newAddress,
        })
      );
    } catch {}

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
      const nodes = await fetchNearbyPharmacies(lat, lon, map || undefined, currentAddress, dangerLevel);
      setPharmacies(nodes);

      if (nodes.length > 0) {
        let bestMatch: PharmacyNode | null = null;
        if (dangerLevel === "tinggi") {
          bestMatch = nodes.find((p) => p.facilityType === "hospital") || nodes[0];
        } else {
          bestMatch = nodes[0];
        }

        if (bestMatch) {
          setSelectedPharmacy(bestMatch);
          setActiveMarker(bestMatch.id);
          setShowCard(true);
          selectPharmacyAndRoute(bestMatch, transportMode, [lat, lon]);
        }
      }
    } catch (err) {
      console.error("Fetch Places Error:", err);
    } finally {
      setLoadingPlaces(false);
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
      if (googleApiKey && window.google && window.google.maps && window.google.maps.DirectionsService) {
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
    } catch {
      await useOSRMRoute();
    }
  };

  // Calculate Data Sources Breakdown
  const sourceStats = useMemo(() => {
    let google = 0;
    let osm = 0;
    let gemini = 0;
    let cache = 0;

    for (const p of pharmacies) {
      if (p._dataSource === "google") google++;
      else if (p._dataSource === "osm") osm++;
      else if (p._dataSource === "gemini") gemini++;
      else if (p._dataSource === "cache") cache++;
    }

    return { google, osm, gemini, cache, total: pharmacies.length };
  }, [pharmacies]);

  const mapCenter = userLocation
    ? { lat: userLocation[0], lng: userLocation[1] }
    : { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] };

  return (
    <div className="animate-fade-up mt-6 rounded-2xl bg-white p-5 shadow-[var(--shadow-clinic-lg)]">
      {/* Header Utama Maps */}
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--color-clinic-blue-soft)] text-[color:var(--color-clinic-blue)]">
              <Compass className="h-4 w-4" />
            </span>
            <h3 className="font-display text-base font-bold text-[color:var(--color-clinic-ink)]">
              {dangerLevel === "tinggi"
                ? "Peta Rujukan Rumah Sakit & Fasilitas Kesehatan"
                : dangerLevel === "sedang"
                ? "Peta Apotek & Rekomendasi Klinik Terdekat"
                : "Peta Apotek Terdekat & Rute Real-Time"}
            </h3>
          </div>
          <p className="mt-1 text-xs text-[color:var(--color-clinic-muted)]">
            Data terverifikasi komunitas OpenStreetMap resmi & sistem navigasi rute terpadu.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            onClick={() => getUserGeolocation(true)}
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

      {/* Triage Recommendation Banner Berdasarkan Tingkat Bahaya */}
      {dangerLevel === "tinggi" ? (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border-2 border-red-300 bg-red-50/90 p-4 animate-pulse">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-red-600 text-white">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-800">
              🚨 PERINGATAN DARURAT: Segera ke Rumah Sakit / IGD Terdekat!
            </h4>
            <p className="mt-1 text-xs text-red-700/90 leading-relaxed">
              Kondisi <strong>{conditionName || "ini"}</strong> tergolong berbahaya dan membutuhkan penanganan medis segera oleh dokter profesional. Peta memprioritaskan rute tercepat menuju <strong>Instalasi Gawat Darurat (IGD) & Rumah Sakit Terdekat</strong>.
            </p>
          </div>
        </div>
      ) : dangerLevel === "sedang" ? (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/80 p-4">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-500 text-white">
            <ShieldQuestion className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
              ⚠️ Perlu Diperhatikan: Apotek & Rekomendasi Klinik / RS
            </h4>
            <p className="mt-1 text-xs text-amber-700/90 leading-relaxed">
              Kondisi <strong>{conditionName || "ini"}</strong> memerlukan kewaspadaan. Anda dapat membeli obat yang dianjurkan di apotek terdekat, namun <strong>sangat disarankan memeriksakan diri ke Klinik atau Rumah Sakit terdekat</strong> jika keluhan tidak mereda dalam 1-2 hari.
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              🟢 Kondisi Aman: Disarankan Mengunjungi Apotek Terdekat
            </h4>
            <p className="mt-0.5 text-xs text-emerald-700/90 leading-relaxed">
              Kondisi <strong>{conditionName || "ini"}</strong> tergolong aman untuk perawatan mandiri. Anda disarankan mengunjungi apotek terdekat untuk mendapatkan obat bebas atau suplemen yang direkomendasikan.
            </p>
          </div>
        </div>
      )}

      {/* Baris Pencarian Alamat & Penanda Lokasi Presisi */}
      <div className="relative mb-3">
        <form onSubmit={handleAddressSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari lokasi Anda (misal: Denpasar Bali, Bogor, Surabaya, Jl. Sudirman)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs rounded-xl border-slate-200"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="rounded-xl text-xs bg-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue-dark)]"
          >
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

      {/* Info Status Akurasi Lokasi & Source Summary */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 font-medium text-[11px] text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>
            Posisi Aktif: <strong className="text-slate-900">{locationSource}</strong>
          </span>
          {userLocation && (
            <span className="text-slate-400 font-mono text-[10px]">
              ({userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)})
            </span>
          )}
        </div>

        <SourceSummaryBar sources={sourceStats} />
      </div>

      {locationError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{locationError}</span>
        </div>
      )}

      {/* OFFLINE / EMPTY STATE UI */}
      {!loadingPharmacies && pharmacies.length === 0 && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/50 p-6 text-center animate-fade-up">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-700 mb-3">
            <WifiOff className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Data Fasilitas Kesehatan Tidak Ditemukan di Titik Ini
          </h4>
          <p className="text-xs text-slate-600 max-w-md mx-auto mb-4">
            Semua sumber data online & offline belum menemukan fasilitas terdaftar pada koordinat ini. Pastikan koneksi internet stabil atau geser ke pusat kota terdekat.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={() => userLocation && loadPharmacies(userLocation[0], userLocation[1])}
              className="gap-1.5 rounded-xl text-xs bg-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue-dark)]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Coba Lagi
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => getUserGeolocation(true)}
              className="gap-1.5 rounded-xl text-xs border-slate-300"
            >
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              Gunakan GPS Presisi
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="relative min-h-[380px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner md:min-h-[480px]">
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

              {pharmacies.map((pharm) => {
                const isHospital = pharm.facilityType === "hospital";
                const isClinic = pharm.facilityType === "clinic";
                const markerIconUrl = isHospital
                  ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                  : isClinic
                  ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                  : "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";

                return (
                  <Marker
                    key={pharm.id}
                    position={{ lat: pharm.lat, lng: pharm.lon }}
                    onClick={() => handleSelectPharmacy(pharm)}
                    icon={{ url: markerIconUrl }}
                  >
                    {activeMarker === pharm.id && (
                      <InfoWindow
                        position={{ lat: pharm.lat, lng: pharm.lon }}
                        onCloseClick={() => {
                          setActiveMarker(null);
                          setShowCard(false);
                        }}
                      >
                        <div className="p-1.5 font-sans text-xs max-w-[220px]">
                          <strong className="block font-bold text-slate-900">{pharm.name}</strong>
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className={`font-bold px-1.5 py-0.2 rounded-sm text-[9px] ${
                              isHospital
                                ? "bg-red-100 text-red-700"
                                : isClinic
                                ? "bg-blue-100 text-blue-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}>
                              {isHospital ? "🏥 Rumah Sakit" : isClinic ? "🩺 Klinik" : "💊 Apotek"}
                            </span>
                            <span className="text-slate-500">• ~{pharm.distanceKm} km</span>
                          </div>
                          {pharm.openingHoursText && (
                            <span className={`block font-medium mt-1 ${isHospital ? "text-red-700" : "text-emerald-700"}`}>
                              🕒 {pharm.openingHoursText}
                            </span>
                          )}
                          {pharm.address && (
                            <span className="block text-[11px] text-slate-500 mt-1 line-clamp-2">
                              {pharm.address}
                            </span>
                          )}
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                );
              })}

              <MapRouteRenderer map={map} routeInfo={routeInfo} />
            </GoogleMap>
          ) : (
            <div className="flex h-full min-h-[340px] flex-col items-center justify-center gap-2 text-xs text-slate-500">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <span>Memuat Peta Fasilitas Kesehatan...</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 min-w-0">
          <RouteOverlayCard
            selectedPlace={showCard ? selectedPharmacy : null}
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
            dangerLevel={dangerLevel}
            onSelectPharmacy={handleSelectPharmacy}
          />
        </div>
      </div>
    </div>
  );
}
