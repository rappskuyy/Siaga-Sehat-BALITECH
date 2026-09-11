import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Compass,
  MapPin,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Stethoscope,
  Pill,
  Crosshair,
  Plus,
  Minus,
  Star,
  Clock,
  Phone,
  Navigation,
  ExternalLink,
  X,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OpenStreetMapCanvas } from "./OpenStreetMapCanvas";
import {
  DEFAULT_CENTER,
  fetchNearbyPharmacies,
  fetchOSRMRoute,
  searchLocationByAddress,
  reverseGeocode,
  type GeocodeResult,
  type PlaceNode,
  type PharmacyNode,
  type RouteInfo,
  type TransportMode,
  type DangerLevelType,
} from "./maps.service";
import { PharmacyList } from "./PharmacyList";
import { SourceSummaryBar } from "./SourceBadge";
import { getWikimediaFallbackPhoto } from "@/lib/maps/wikimedia.service";
import { getFacilityDescriptionByIndex } from "@/data/facilitiesDummyData";

const containerStyle = {
  width: "100%",
  height: "100%",
};

interface ExtendedRouteInfo extends RouteInfo {
  directionsResult?: any;
}

type Libraries = ("places" | "drawing" | "geometry" | "visualization")[];
const GOOGLE_MAPS_LIBRARIES: Libraries = Object.freeze(["places"]) as Libraries;

// Helper SVG Marker Generators with distinct colors:
// Hospital = RED (#EF4444), Clinic = YELLOW (#F59E0B), Pharmacy = landing-page blue (#4A6FA5)

const userLocationSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
  <circle cx="18" cy="18" r="16" fill="rgba(37,99,235,0.25)"/>
  <circle cx="18" cy="18" r="10" fill="#2563EB" stroke="#FFFFFF" stroke-width="3"/>
  <circle cx="18" cy="18" r="4" fill="#FFFFFF"/>
</svg>
`)}`;

// Hospital Markers (Red)
const hospitalPinSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42" fill="none">
  <path d="M17 0C7.611 0 0 7.611 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.611 26.389 0 17 0Z" fill="#EF4444"/>
  <circle cx="17" cy="16" r="8" fill="#FFFFFF"/>
  <path d="M15.5 11.5H18.5V14.5H21.5V17.5H18.5V20.5H15.5V17.5H12.5V14.5H15.5V11.5Z" fill="#EF4444"/>
</svg>
`)}`;

const hospitalActivePinSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="46" height="54" viewBox="0 0 46 54" fill="none">
  <circle cx="23" cy="19" r="19" fill="rgba(239, 68, 68, 0.40)"/>
  <path d="M23 2C14.163 2 7 9.163 7 18C7 30 23 48 23 48C23 48 39 30 39 18C39 9.163 31.837 2 23 2Z" fill="#DC2626" stroke="#FFFFFF" stroke-width="2.5"/>
  <circle cx="23" cy="17" r="8" fill="#FFFFFF"/>
  <path d="M21.5 12.5H24.5V15.5H27.5V18.5H24.5V21.5H21.5V18.5H18.5V15.5H21.5V12.5Z" fill="#DC2626"/>
</svg>
`)}`;

// Clinic Markers (Yellow)
const clinicPinSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42" fill="none">
  <path d="M17 0C7.611 0 0 7.611 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.611 26.389 0 17 0Z" fill="#F59E0B"/>
  <circle cx="17" cy="16" r="7.5" fill="#FFFFFF"/>
  <circle cx="17" cy="16" r="4" fill="#D97706"/>
</svg>
`)}`;

const clinicActivePinSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="46" height="54" viewBox="0 0 46 54" fill="none">
  <circle cx="23" cy="19" r="19" fill="rgba(245, 158, 11, 0.40)"/>
  <path d="M23 2C14.163 2 7 9.163 7 18C7 30 23 48 23 48C23 48 39 30 39 18C39 9.163 31.837 2 23 2Z" fill="#D97706" stroke="#FFFFFF" stroke-width="2.5"/>
  <circle cx="23" cy="17" r="8" fill="#FFFFFF"/>
  <circle cx="23" cy="17" r="4" fill="#D97706"/>
</svg>
`)}`;

// Pharmacy Markers (Blue)
const pharmacyPinSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42" fill="none">
  <path d="M17 0C7.611 0 0 7.611 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.611 26.389 0 17 0Z" fill="#4A6FA5"/>
  <circle cx="17" cy="16" r="7.5" fill="#FFFFFF"/>
  <circle cx="17" cy="16" r="4" fill="#2563EB"/>
</svg>
`)}`;

const pharmacyActivePinSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="46" height="54" viewBox="0 0 46 54" fill="none">
  <circle cx="23" cy="19" r="19" fill="rgba(55, 159, 210, 0.45)"/>
  <path d="M23 2C14.163 2 7 9.163 7 18C7 30 23 48 23 48C23 48 39 30 39 18C39 9.163 31.837 2 23 2Z" fill="#2563EB" stroke="#FFFFFF" stroke-width="2.5"/>
  <circle cx="23" cy="17" r="8" fill="#FFFFFF"/>
  <circle cx="23" cy="17" r="4" fill="#2563EB"/>
</svg>
`)}`;

/**
 * Route Renderer with White Underlay and landing-page blue Route Polyline
 */
interface PharmacyMapProps {
  dangerLevel?: DangerLevelType;
  conditionName?: string;
}

export function PharmacyMap({ dangerLevel = "rendah", conditionName }: PharmacyMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSource, setLocationSource] = useState<string>("GPS Presisi (Lokasi Anda)");

  const [pharmacies, setPharmacies] = useState<PharmacyNode[]>([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState<boolean>(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyNode | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceNode | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState<boolean>(true);

  const [transportMode, setTransportMode] = useState<TransportMode>("driving");
  const [routeInfo, setRouteInfo] = useState<ExtendedRouteInfo | null>(null);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false);

  // Active Rail Tab & Mobile View State
  const [activeNavTab, setActiveNavTab] = useState<string>("map");
  const [mobileTab, setMobileTab] = useState<"map" | "list">("map");

  // Search Address State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const SAVED_LOCATION_KEY = "siaga_user_chosen_location";

  useEffect(() => {
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
    setSelectedPlace(null);
    setRouteInfo(null);

    const updateLocation = async (coords: [number, number], source: string) => {
      setUserLocation(coords);
      setLocationSource(source);
      setLoadingLocation(false);
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
      setLocationError("Browser Anda tidak mendukung Browser Geolocation API.");
      await updateLocation(DEFAULT_CENTER, "Lokasi Default (Jakarta)");
      return;
    }

    // Menggunakan Browser Geolocation API bawaan MDN (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        await updateLocation(coords, "GPS Browser (Geolocation API)");
      },
      (err) => {
        console.warn("Geolocation API High-Accuracy error, mencoba mode standar:", err);
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
            await updateLocation(coords, "GPS Browser (Geolocation API)");
          },
          (lowErr) => {
            console.warn("Geolocation API error:", lowErr);
            let msg = "Gagal mendeteksi lokasi GPS.";
            if (lowErr.code === lowErr.PERMISSION_DENIED) {
              msg = "Izin lokasi GPS ditolak oleh browser. Silakan izinkan akses lokasi pada browser Anda.";
            } else if (lowErr.code === lowErr.POSITION_UNAVAILABLE) {
              msg = "Informasi lokasi GPS perangkat tidak tersedia.";
            } else if (lowErr.code === lowErr.TIMEOUT) {
              msg = "Waktu permintaan GPS habis (timeout).";
            }
            setLocationError(msg);
            updateLocation(DEFAULT_CENTER, "Lokasi Default (Jakarta)");
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setShowSearchResults(true);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const results = await searchLocationByAddress(searchQuery);
      setSearchResults(results);
      if (results.length === 1) {
        handleSelectSearchResult(results[0]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: GeocodeResult) => {
    const coords: [number, number] = [result.lat, result.lon];
    setUserLocation(coords);
    setLocationSource(`Alamat: ${result.displayname.slice(0, 30)}...`);
    setShowSearchResults(false);
    setSelectedPharmacy(null);
    setSelectedPlace(null);
    try {
      sessionStorage.setItem(
        SAVED_LOCATION_KEY,
        JSON.stringify({
          coords,
          source: `Alamat: ${result.displayname.slice(0, 30)}...`,
          address: result.displayname,
        }),
      );
    } catch {}

    loadPharmacies(result.lat, result.lon, result.displayname);
  };

  const handleManualLocationChange = async (coords: [number, number]) => {
    setUserLocation(coords);
    setSelectedPharmacy(null);
    setSelectedPlace(null);
    setRouteInfo(null);

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
          source: newAddress
            ? `Pin (${newAddress.slice(0, 30)}...)`
            : `Pin Manual (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`,
          address: newAddress,
        }),
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
      const nodes = await fetchNearbyPharmacies(
        lat,
        lon,
        undefined,
        currentAddress,
        dangerLevel,
      );
      setPharmacies(nodes);

      if (nodes.length > 0) {
        let bestMatch: PharmacyNode | null = null;
        if (dangerLevel === "tinggi") {
          bestMatch = nodes.find((p: PharmacyNode) => p.facilityType === "hospital") || nodes[0];
        } else {
          bestMatch = nodes[0];
        }

        if (bestMatch) {
          const matchedPlace: PlaceNode = {
            id: bestMatch.id,
            placeType: bestMatch.facilityType === "hospital" ? "hospital" : "pharmacy",
            lat: bestMatch.lat,
            lon: bestMatch.lon,
            name: bestMatch.name,
            address: bestMatch.address,
            distanceKm: bestMatch.distanceKm,
            rating: bestMatch.rating,
            userRatingsTotal: bestMatch.userRatingsTotal,
            openingHoursText: bestMatch.openingHoursText,
            isOpenNow: bestMatch.isOpenNow,
            openingStatus: bestMatch.openingStatus,
            operatingHours: bestMatch.operatingHours,
            phone: bestMatch.phone,
            whatsappNumber: bestMatch.whatsappNumber,
            facilityType: bestMatch.facilityType,
            _dataSource: bestMatch._dataSource,
            _dataSourceLabel: bestMatch._dataSourceLabel,
            _trustScore: bestMatch._trustScore,
            _cacheAge: bestMatch._cacheAge,
          };

          setSelectedPlace(matchedPlace);
          setSelectedPharmacy(bestMatch);
          setShowDetailPanel(true);
          selectPharmacyAndRoute(bestMatch, transportMode, [lat, lon]);
        }
      }
    } catch (err) {
      console.error("Fetch Places Error:", err);
    } finally {
      setLoadingPharmacies(false);
    }
  };

  const handleSelectPharmacy = (pharmacy: PharmacyNode | null) => {
    if (!pharmacy) {
      setSelectedPlace(null);
      setSelectedPharmacy(null);
      setRouteInfo(null);
      setShowDetailPanel(false);
      return;
    }

    const place: PlaceNode = {
      id: pharmacy.id,
      placeType: pharmacy.facilityType === "hospital" ? "hospital" : "pharmacy",
      lat: pharmacy.lat,
      lon: pharmacy.lon,
      name: pharmacy.name,
      address: pharmacy.address,
      distanceKm: pharmacy.distanceKm,
      rating: pharmacy.rating,
      userRatingsTotal: pharmacy.userRatingsTotal,
      openingHoursText: pharmacy.openingHoursText,
      isOpenNow: pharmacy.isOpenNow,
      openingStatus: pharmacy.openingStatus,
      operatingHours: pharmacy.operatingHours,
      phone: pharmacy.phone,
      whatsappNumber: pharmacy.whatsappNumber,
      facilityType: pharmacy.facilityType,
      _dataSource: pharmacy._dataSource,
      _dataSourceLabel: pharmacy._dataSourceLabel,
      _trustScore: pharmacy._trustScore,
      _cacheAge: pharmacy._cacheAge,
    };

    setSelectedPlace(place);
    setSelectedPharmacy(pharmacy);
    setShowDetailPanel(true);
    setRouteInfo(null);
    setMobileTab("map");

    selectPharmacyAndRoute(pharmacy, transportMode, userLocation || undefined);
  };

  const finalPhotoUrl = selectedPharmacy
    ? selectedPharmacy.photoUrl || getWikimediaFallbackPhoto(selectedPharmacy.facilityType, selectedPharmacy.name?.charCodeAt(0) || 0)
    : undefined;

  const finalDescription = selectedPharmacy
    ? getFacilityDescriptionByIndex(selectedPharmacy.placeId?.charCodeAt(0) || selectedPharmacy.name?.charCodeAt(0) || 0)
    : "";

  const finalReviewText = useMemo(() => {
    if (!selectedPharmacy) return "Fasilitas medis sangat lengkap, penanganan dokter spesialis cepat dan tanggap di UGD 24 Jam.";
    if (selectedPharmacy.facilityType === "hospital") return "Fasilitas medis sangat lengkap, penanganan dokter spesialis cepat dan tanggap di UGD 24 Jam.";
    if (selectedPharmacy.facilityType === "clinic") return "Dokter ramah dan teliti menjelaskan indikasi kesehatan. Antrean teratur dan tempat sangat bersih.";
    return "Obat resep lengkap, pelayanan petugas racik obat cepat, lokasi strategis dan harga terjangkau.";
  }, [selectedPharmacy?.facilityType]);

  // Hardware-Accelerated Drag Physics (Detail Panel)
  const detailSheetRef = useRef<HTMLDivElement>(null);
  const detailStartY = useRef<number>(0);
  const detailCurrentY = useRef<number>(0);

  const handleDetailTouchStart = (e: React.TouchEvent) => {
    detailStartY.current = e.touches[0].clientY;
    detailCurrentY.current = 0;
    if (detailSheetRef.current) {
      detailSheetRef.current.style.transition = "none";
    }
  };

  const handleDetailTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - detailStartY.current;
    if (deltaY > 0) {
      detailCurrentY.current = deltaY;
      if (detailSheetRef.current) {
        detailSheetRef.current.style.transform = `translate3d(0, ${deltaY}px, 0)`;
      }
    }
  };

  const handleDetailTouchEnd = () => {
    const sheet = detailSheetRef.current;
    if (!sheet) return;

    sheet.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
    if (detailCurrentY.current > 75) {
      sheet.style.transform = "translate3d(0, 100%, 0)";
      setTimeout(() => {
        setShowDetailPanel(false);
      }, 300);
    } else {
      sheet.style.transform = "translate3d(0, 0, 0)";
    }
  };

  const handleCloseDetails = useCallback(() => {
    if (detailSheetRef.current) {
      detailSheetRef.current.style.transition = "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
      detailSheetRef.current.style.transform = "translate3d(0, 100%, 0)";
    }
    setTimeout(() => {
      setShowDetailPanel(false);
      if (detailSheetRef.current) {
        detailSheetRef.current.style.transform = "translate3d(0, 0, 0)";
      }
    }, 280);
  }, []);

  useEffect(() => {
    if (showDetailPanel && detailSheetRef.current) {
      detailSheetRef.current.style.transform = "translate3d(0, 0, 0)";
      detailSheetRef.current.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
    }
  }, [showDetailPanel, selectedPharmacy]);

  const handleTransportModeChange = (newMode: TransportMode) => {
    setTransportMode(newMode);
    if (selectedPharmacy) {
      selectPharmacyAndRoute(selectedPharmacy, newMode, userLocation || undefined);
    }
  };

  const selectPharmacyAndRoute = async (
    pharmacy: PharmacyNode,
    mode: TransportMode,
    origin?: [number, number],
  ) => {
    const startLoc = origin || userLocation || DEFAULT_CENTER;
    setLoadingRoute(true);

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
    <div className="w-full rounded-3xl bg-[#F7F9FB] p-3 sm:p-4 border border-[#E5E7EB] shadow-[0_10px_35px_rgba(55,159,210,0.08)] mt-4">
      {/* Top Search & Location Header Bar */}
      <div className="mb-3.5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div>
              <h3 className="font-display text-sm font-bold text-[#111111]">
                {dangerLevel === "tinggi"
                  ? "Peta Rujukan Rumah Sakit & IGD"
                  : "Peta Klinik & Apotek Terdekat"}
              </h3>
              <p className="text-[11px] text-[#6B7280]">
                {conditionName
                  ? `Rekomendasi fasilitas untuk ${conditionName}`
                  : "Navigasi presisi fasilitas kesehatan terdekat"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => getUserGeolocation(true)}
              variant="outline"
              size="sm"
              disabled={loadingLocation}
              className="h-8 gap-1.5 rounded-xl text-xs bg-[#FFFFFF] border-[#E5E7EB] text-[color:var(--color-clinic-blue)] hover:bg-[color:var(--color-clinic-blue-soft)]/20 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`h-3 w-3 ${loadingLocation ? "animate-spin" : ""}`} />
              {loadingLocation ? "Mencari GPS..." : "GPS Presisi"}
            </Button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative" ref={searchContainerRef}>
          <form onSubmit={handleAddressSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-clinic-blue)]" />
              <Input
                type="text"
                placeholder="Cari lokasi Anda (misal: Denpasar Bali, Jakarta, Surabaya)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="pl-10 h-10 text-xs rounded-xl bg-[#FFFFFF] border-[#E5E7EB] focus-visible:border-[#4a6fa5] focus-visible:ring-1 focus-visible:ring-[#4a6fa5]"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-10 px-4 rounded-xl text-xs font-semibold bg-[#4a6fa5] text-white shadow-xs cursor-pointer hover:bg-[#35517d] active:scale-[0.98] transition-transform"
            >
              {isSearching ? "Mencari..." : "Cari Alamat"}
            </Button>
          </form>

          {/* Search Dropdown */}
          {showSearchResults && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-64 overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-1.5 shadow-xl text-xs">
              {/* Option 1: Paling Pertama -> Lokasi Saya Saat Ini (GPS) */}
              <button
                type="button"
                onClick={() => {
                  getUserGeolocation(true);
                  setShowSearchResults(false);
                }}
                className="mb-1 flex w-full items-center justify-between gap-2.5 rounded-xl border-b border-[#E5E7EB] bg-[color:var(--color-clinic-blue-soft)]/80 p-2.5 text-left font-semibold text-[color:var(--color-clinic-blue)] transition hover:bg-[color:var(--color-clinic-blue-soft)]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[color:var(--color-clinic-blue)] text-white shadow-xs">
                    <Crosshair className="h-4 w-4 animate-pulse" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[#111111] font-bold text-xs">Lokasi Saya Saat Ini</span>
                    <span className="text-[10px] text-[#6B7280]">
                      Gunakan GPS presisi perangkat Anda
                    </span>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-[color:var(--color-clinic-blue)] px-2 py-0.5 text-[9px] font-medium text-white">
                  Lokasi Anda
                </span>
              </button>

              {/* Searched Location Results */}
              {searchResults.length > 0 ? (
                searchResults.map((res, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left p-2.5 hover:bg-[#F7F9FB] rounded-xl flex items-start gap-2.5 border-b border-[#E5E7EB]/40 last:border-0 cursor-pointer transition"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-[#4a6fa5] mt-0.5" />
                    <span className="text-[#111111] line-clamp-2">{res.displayname}</span>
                  </button>
                ))
              ) : searchQuery.trim().length > 0 && !isSearching ? (
                <div className="p-2.5 text-center text-[#6B7280] text-[11px]">
                  Tekan <strong className="text-[#4a6fa5]">Cari Alamat</strong> atau Enter untuk
                  mencari &quot;{searchQuery}&quot;
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Active Position Info & Source Summary */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 font-medium text-[11px] text-[#6B7280] bg-[#FFFFFF] px-3 py-1.5 rounded-xl border border-[#E5E7EB]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#4a6fa5] shrink-0" />
            <span>
              Posisi: <strong className="text-[#111111]">{locationSource}</strong>
            </span>
            {userLocation && (
              <span className="text-[#6B7280] font-mono text-[10px]">
                ({userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)})
              </span>
            )}
          </div>

          <SourceSummaryBar sources={sourceStats} />
        </div>

        {/* Mobile View Toggle Bar (Only visible on mobile screens) */}
        <div className="grid grid-cols-2 lg:hidden p-1 bg-[#eef2f8] rounded-2xl border border-[#d1def0] mb-2 shadow-2xs gap-1.5">
          <button
            type="button"
            onClick={() => setMobileTab("map")}
            className={`flex items-center justify-center gap-1.5 h-9 px-2 sm:px-3 text-xs font-bold rounded-xl transition-all cursor-pointer border select-none ${
              mobileTab === "map"
                ? "bg-[#4a6fa5] text-white border-[#4a6fa5] shadow-xs font-extrabold"
                : "bg-white/80 text-[#4a6fa5] border-[#d1def0]/60 hover:bg-white hover:border-[#d1def0]"
            }`}
          >
            <Compass className="h-4 w-4 shrink-0" />
            <span className="truncate">Peta Navigasi</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("list")}
            className={`flex items-center justify-center gap-1.5 h-9 px-2 sm:px-3 text-xs font-bold rounded-xl transition-all cursor-pointer border select-none ${
              mobileTab === "list"
                ? "bg-[#4a6fa5] text-white border-[#4a6fa5] shadow-xs font-extrabold"
                : "bg-white/80 text-[#4a6fa5] border-[#d1def0]/60 hover:bg-white hover:border-[#d1def0]"
            }`}
          >
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">Daftar Fasilitas ({pharmacies.length})</span>
          </button>
        </div>

        {locationError && (
          <div className="flex items-center gap-2 rounded-xl bg-[#F7F9FB] p-3 text-xs text-[#4a6fa5] border border-[#d1def0]">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#4a6fa5]" />
            <span>{locationError}</span>
          </div>
        )}
      </div>

      {/* Main Composition: Desktop Layout & Mobile Responsive Mode */}
      <div className="flex flex-col lg:flex-row gap-3 lg:h-[720px] items-stretch">
        {/* 02. Clinic List Column */}
        <div
          className={`w-full lg:w-[420px] shrink-0 h-[480px] sm:h-[520px] lg:h-full flex-col ${
            mobileTab === "list" ? "flex" : "hidden lg:flex"
          }`}
        >
          <PharmacyList
            pharmacies={pharmacies}
            loadingPharmacies={loadingPharmacies}
            selectedPharmacy={selectedPharmacy}
            selectedPlace={selectedPlace}
            routeInfo={routeInfo}
            loadingRoute={loadingRoute}
            transportMode={transportMode}
            userLocation={userLocation}
            dangerLevel={dangerLevel}
            onSelectPharmacy={handleSelectPharmacy}
            onTransportModeChange={handleTransportModeChange}
            onCloseCard={() => {
              setSelectedPharmacy(null);
              setSelectedPlace(null);
              setRouteInfo(null);
              setShowDetailPanel(false);
            }}
          />
        </div>

        {/* 03. OpenStreetMap Canvas Area */}
        <div
          className={`relative flex-1 min-w-0 aspect-square w-full h-[450px] sm:h-[520px] lg:aspect-auto lg:h-full rounded-2xl overflow-hidden border border-[#E5E7EB] bg-[#FFFFFF] shadow-inner ${
            mobileTab === "map" ? "block" : "hidden lg:block"
          }`}
        >
          <OpenStreetMapCanvas
            userLocation={userLocation}
            pharmacies={pharmacies}
            selectedPharmacy={selectedPharmacy}
            routeInfo={routeInfo}
            onSelectPharmacy={handleSelectPharmacy}
            onManualLocationChange={handleManualLocationChange}
            className="w-full h-full min-h-0"
          />

          {/* Floating Active Route Banner when Detail Panel is Closed */}
          {selectedPharmacy && !showDetailPanel && (
            <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2.5 rounded-2xl bg-white/95 p-3 shadow-xl border border-[#E5E7EB] backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#4a6fa5] text-white shrink-0 shadow-xs">
                  <Navigation className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#111111] truncate">{selectedPharmacy.name}</p>
                  <p className="text-[11px] text-[#4a6fa5] font-semibold">
                    {routeInfo ? `Rute navigasi aktif (${routeInfo.distanceKm} km)` : "Rute navigasi aktif"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowDetailPanel(true)}
                  className="rounded-xl bg-[#4a6fa5] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#35517d] transition shadow-xs cursor-pointer"
                >
                  Buka Detail
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPharmacy(null);
                    setSelectedPlace(null);
                    setRouteInfo(null);
                    setShowDetailPanel(false);
                  }}
                  className="rounded-xl p-1.5 text-[#6B7280] hover:bg-slate-100 hover:text-red-600 transition cursor-pointer"
                  title="Hapus Rute"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Location Info Detail Card (Synchronized with page /maps with slide-to-close) */}
          {selectedPharmacy && showDetailPanel && (
            <div
              ref={detailSheetRef}
              className="absolute inset-x-0 bottom-0 top-auto max-h-[85%] sm:inset-auto sm:top-3 sm:right-3 sm:bottom-3 z-30 w-full sm:w-[380px] xl:w-[410px] sm:max-h-[calc(100%-24px)] bg-white rounded-t-3xl sm:rounded-3xl border-t sm:border border-[#E5E7EB] shadow-2xl flex flex-col will-change-transform translate-y-0 animate-in slide-in-from-bottom-full sm:slide-in-from-right-4 duration-300 backdrop-blur-md"
            >
              {/* Scroll / Drag Handle Bar to Close Details Panel (Slide down to close) */}
              <div
                onTouchStart={handleDetailTouchStart}
                onTouchMove={handleDetailTouchMove}
                onTouchEnd={handleDetailTouchEnd}
                onClick={() => {
                  if (detailCurrentY.current < 5) handleCloseDetails();
                }}
                className="w-full py-3.5 flex sm:hidden flex-col items-center justify-center cursor-grab active:cursor-grabbing active:bg-slate-100 rounded-t-3xl shrink-0 select-none border-b border-gray-100 touch-none"
                title="Geser ke Bawah untuk Menutup"
                role="button"
                tabIndex={0}
                aria-label="Tutup panel rincian fasilitas"
              >
                <div className="w-14 h-1.5 bg-slate-300 hover:bg-[#4a6fa5] rounded-full transition-colors" />
                <span className="text-[10px] font-semibold text-gray-400 mt-1">Geser ke bawah untuk menutup</span>
              </div>

              {/* Scrollable Content Container */}
              <div className="overflow-y-auto p-4 sm:p-5 flex flex-col flex-1 scrollbar-thin scrollbar-thumb-[#4a6fa5]/20">
                {/* Category Badge & Rating Header */}
                <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shadow-xs ${
                      selectedPharmacy.facilityType === "hospital"
                        ? "bg-red-500 text-white border-red-600"
                        : selectedPharmacy.facilityType === "clinic"
                          ? "bg-[#F59E0B] text-white border-amber-600"
                          : "bg-[#4a6fa5] text-white border-blue-600"
                    }`}
                  >
                    {selectedPharmacy.facilityType === "hospital" ? (
                      <><Building2 className="h-3 w-3 inline mr-1 shrink-0" /> RUMAH SAKIT</>
                    ) : selectedPharmacy.facilityType === "clinic" ? (
                      <><Stethoscope className="h-3 w-3 inline mr-1 shrink-0" /> KLINIK</>
                    ) : (
                      <><Pill className="h-3 w-3 inline mr-1 shrink-0" /> APOTEK</>
                    )}
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-2xs">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>
                        {selectedPharmacy.rating ? Number(selectedPharmacy.rating).toFixed(1) : "4.8"}
                      </span>
                      <span className="text-[10px] text-amber-700 font-normal">
                        ({selectedPharmacy.userRatingsTotal || "128"})
                      </span>
                    </div>

                    {/* Desktop-only Close Button */}
                    <button
                      type="button"
                      onClick={() => setShowDetailPanel(false)}
                      className="hidden sm:flex text-[#6B7280] hover:text-[#111111] p-1.5 rounded-full hover:bg-slate-100 shrink-0 transition cursor-pointer"
                      title="Tutup Panel Detail (Rute Tetap Aktif)"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

                {/* Facility Photo */}
                <div className="relative h-36 sm:h-40 w-full rounded-2xl overflow-hidden mb-3 border border-[#E5E7EB] bg-slate-100 shrink-0 shadow-xs">
                  <img
                    src={finalPhotoUrl || getWikimediaFallbackPhoto(selectedPharmacy.facilityType, selectedPharmacy.name?.charCodeAt(0) || 0)}
                    alt={selectedPharmacy.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getWikimediaFallbackPhoto(selectedPharmacy.facilityType, 0);
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Title & Address */}
                <div className="mb-3">
                  <h3 className="text-base sm:text-lg font-bold text-[#111111] leading-snug">
                    {selectedPharmacy.name}
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed flex items-start gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#4a6fa5] shrink-0 mt-0.5" />
                    <span>
                      {selectedPharmacy.address ||
                        `Jl. Sekitar (${selectedPharmacy.lat.toFixed(4)}, ${selectedPharmacy.lon.toFixed(4)})`}
                    </span>
                  </p>
                </div>

                {/* Operational Hours & Phone Contact */}
                <div className="mt-1 pt-3 border-t border-[#E5E7EB] flex flex-col gap-1.5 text-xs mb-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#4a6fa5] font-semibold">
                      <Clock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      {selectedPharmacy.openingHoursText || (selectedPharmacy.facilityType === "hospital" ? "Buka 24 Jam (IGD Siaga)" : "Buka 24 Jam")}
                    </span>
                    <span className="font-extrabold text-[#111111]">
                      {selectedPharmacy.distanceKm < 1
                        ? `${(selectedPharmacy.distanceKm * 1000).toFixed(0)} m`
                        : `${selectedPharmacy.distanceKm.toFixed(2)} km`}
                    </span>
                  </div>

                  {selectedPharmacy.phone && (
                    <div className="text-[11px] text-[#6B7280] font-medium flex items-center gap-1">
                      <Phone className="h-3 w-3 text-[#4a6fa5] shrink-0" />
                      <span>Telepon: <strong className="text-[#111111]">{selectedPharmacy.phone}</strong></span>
                    </div>
                  )}
                </div>

                {/* Description / Review snippet */}
                <div className="mb-4 p-3 bg-blue-50/60 border border-blue-200/80 rounded-2xl text-xs text-[#35517d] flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-[#4a6fa5] shrink-0 mt-0.5" />
                  <p className="italic leading-relaxed">{finalDescription || `"${finalReviewText}"`}</p>
                </div>

                {/* Direct Google Maps Navigation Primary CTA Button */}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPharmacy.lat},${selectedPharmacy.lon}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full h-11 bg-[#4a6fa5] hover:bg-[#35517d] text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition cursor-pointer mt-auto shrink-0"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Buka Navigasi Google Maps</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
