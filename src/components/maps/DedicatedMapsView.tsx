import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Compass,
  MapPin,
  RefreshCw,
  Search,
  Building2,
  Pill,
  Stethoscope,
  Crosshair,
  Plus,
  Minus,
  Navigation,
  Star,
  Clock,
  Car,
  Bike,
  X,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ScanLine,
  User,
  LogIn,
  Info,
  MessageSquare,
  Home,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OpenStreetMapCanvas } from "./OpenStreetMapCanvas";
import {
  DEFAULT_CENTER,
  fetchNearbyPharmacies,
  fetchOSRMRoute,
  fetchIPLocation,
  searchLocationByAddress,
  reverseGeocode,
  type GeocodeResult,
  type PlaceNode,
  type PharmacyNode,
  type RouteInfo,
  type TransportMode,
} from "./maps.service";
import { PharmacyList } from "./PharmacyList";
import { SourceSummaryBar } from "./SourceBadge";
import { Footer } from "@/components/clinic/Footer";
import { useAuth } from "@/lib/auth/auth-context";
import { SiteHeader } from "@/components/layout/SiteHeader";

const containerStyle = {
  width: "100%",
  height: "100%",
};

interface ExtendedRouteInfo extends RouteInfo {
  directionsResult?: any;
}

type Libraries = ("places" | "drawing" | "geometry" | "visualization")[];
const GOOGLE_MAPS_LIBRARIES: Libraries = Object.freeze(["places"]) as Libraries;

import {
  fetchWikimediaFacilityPhoto,
  getWikimediaFallbackPhoto,
  WIKIMEDIA_FALLBACKS,
} from "@/lib/maps/wikimedia.service";

const FACILITY_PHOTOS = {
  hospital: WIKIMEDIA_FALLBACKS.hospital[0],
  clinic: WIKIMEDIA_FALLBACKS.clinic[0],
  pharmacy: WIKIMEDIA_FALLBACKS.pharmacy[0],
};

// Review comments snippets
const FACILITY_REVIEWS = {
  hospital:
    "Fasilitas medis sangat lengkap, penanganan dokter spesialis cepat dan tanggap di UGD 24 Jam.",
  clinic:
    "Dokter ramah dan teliti menjelaskan indikasi kesehatan. Antrean teratur dan tempat sangat bersih.",
  pharmacy:
    "Obat resep lengkap, pelayanan petugas racik obat cepat, lokasi strategis dan harga terjangkau.",
};

// Legacy SVG Markers removed - using OpenStreetMapCanvas with dynamic SVG teardrop pins



const NAV_ITEMS = ["Tentang Kami", "Layanan", "Dokter", "Hubungi"];

export function DedicatedMapsView() {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSource, setLocationSource] = useState<string>("GPS Presisi (Lokasi Anda)");

  const [pharmacies, setPharmacies] = useState<PharmacyNode[]>([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState<boolean>(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyNode | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceNode | null>(null);

  const [transportMode, setTransportMode] = useState<TransportMode>("driving");
  const [routeInfo, setRouteInfo] = useState<ExtendedRouteInfo | null>(null);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false);

  // Mobile View Switcher Tab
  const [mobileTab, setMobileTab] = useState<"map" | "list" | "detail">("map");

  // Search Input State
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
      } catch {}
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
      async () => {
        const ipCoords = await fetchIPLocation();
        if (ipCoords) {
          await updateLocation(ipCoords, "Lokasi Jaringan (IP)");
          setLocationError("GPS browser belum merespons. Menggunakan perkiraan lokasi IP.");
        } else {
          await updateLocation(DEFAULT_CENTER, "Lokasi Default");
          setLocationError("Izin lokasi tidak diberikan. Cari alamat untuk menentukan posisi.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  };

  const loadPharmacies = async (lat: number, lon: number, addressName?: string) => {
    setLoadingPharmacies(true);
    try {
      const currentAddress = addressName || searchQuery;
      const nodes = await fetchNearbyPharmacies(
        lat,
        lon,
        undefined,
        currentAddress,
        "rendah",
      );
      setPharmacies(nodes);

      if (nodes.length > 0) {
        const bestMatch = nodes[0];
        const place: PlaceNode = {
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
          phone: bestMatch.phone,
          facilityType: bestMatch.facilityType,
          _dataSource: bestMatch._dataSource,
        };
        setSelectedPlace(place);
        setSelectedPharmacy(bestMatch);
        selectPharmacyAndRoute(bestMatch, transportMode, [lat, lon]);
      }
    } catch (err) {
      console.error("Fetch Places Error:", err);
    } finally {
      setLoadingPharmacies(false);
    }
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
    setRouteInfo(null);

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

  const handleSelectPharmacy = useCallback(
    (pharmacy: PharmacyNode | null) => {
      if (!pharmacy) {
        setSelectedPlace(null);
        setSelectedPharmacy(null);
        setRouteInfo(null);
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
        phone: pharmacy.phone,
        facilityType: pharmacy.facilityType,
        _dataSource: pharmacy._dataSource,
      };

      setSelectedPlace(place);
      setSelectedPharmacy(pharmacy);
      setRouteInfo(null);

      selectPharmacyAndRoute(pharmacy, transportMode, userLocation || undefined);
    },
    [transportMode, userLocation],
  );

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

  const [dynamicPhotoUrl, setDynamicPhotoUrl] = useState<string | null>(null);
  const [dynamicReviewText, setDynamicReviewText] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPharmacy) {
      setDynamicPhotoUrl(null);
      setDynamicReviewText(null);
      return;
    }

    if (selectedPharmacy.photoUrl) {
      setDynamicPhotoUrl(selectedPharmacy.photoUrl);
    } else {
      setDynamicPhotoUrl(null);
    }

    const winG = typeof window !== "undefined" ? (window as any).google : undefined;
    if (winG && winG.maps && winG.maps.places) {
      try {
        const dummyDiv = document.createElement("div");
        const service = new winG.maps.places.PlacesService(dummyDiv);

        service.findPlaceFromQuery(
          {
            query: `${selectedPharmacy.name} ${selectedPharmacy.address || ""}`,
            fields: ["place_id", "photos", "rating", "user_ratings_total"],
          },
          (results: any[], status: string) => {
            if (
              status === winG.maps.places.PlacesServiceStatus.OK &&
              results &&
              results[0]
            ) {
              if (results[0].photos && results[0].photos.length > 0) {
                setDynamicPhotoUrl(results[0].photos[0].getUrl({ maxWidth: 800, maxHeight: 600 }));
              }
              const pId = results[0].place_id;
              if (pId) {
                service.getDetails(
                  { placeId: pId, fields: ["photos", "reviews", "formatted_phone_number"] },
                  (details: any, dStatus: string) => {
                    if (dStatus === winG.maps.places.PlacesServiceStatus.OK && details) {
                      if (details.photos && details.photos.length > 0) {
                        setDynamicPhotoUrl(
                          details.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 }),
                        );
                      }
                      if (details.reviews && details.reviews.length > 0) {
                        setDynamicReviewText(details.reviews[0].text);
                      }
                    }
                  },
                );
              }
            }
          },
        );
      } catch (e) {
        console.error("Places photo error:", e);
      }
    }
  }, [selectedPharmacy?.id, selectedPharmacy?.name]);

  // Stable photo fallback from Wikimedia Commons
  const activePhotoUrl = useMemo(() => {
    if (!selectedPharmacy) return WIKIMEDIA_FALLBACKS.hospital[0];
    return getWikimediaFallbackPhoto(selectedPharmacy.facilityType, selectedPharmacy.name?.charCodeAt(0) || 0);
  }, [selectedPharmacy?.id, selectedPharmacy?.facilityType, selectedPharmacy?.name]);

  // Stable review snippet fallback
  const activeReviewText = useMemo(() => {
    if (!selectedPharmacy) return FACILITY_REVIEWS.hospital;
    if (selectedPharmacy.facilityType === "hospital") return FACILITY_REVIEWS.hospital;
    if (selectedPharmacy.facilityType === "clinic") return FACILITY_REVIEWS.clinic;
    return FACILITY_REVIEWS.pharmacy;
  }, [selectedPharmacy?.id, selectedPharmacy?.facilityType]);

  const finalPhotoUrl = dynamicPhotoUrl || selectedPharmacy?.photoUrl || activePhotoUrl;
  const finalReviewText = dynamicReviewText || activeReviewText;

  return (
    <div className="min-h-screen bg-[#F7F9FB] font-sans antialiased text-[#111111] flex flex-col justify-between pb-24 lg:pb-0">
      {/* ========================================================================= */}
      {/* 01. INTEGRATED WEBSITE HEADER NAVBAR (shared across the whole app)        */}
      {/* ========================================================================= */}
      <SiteHeader />

      {/* ========================================================================= */}
      {/* 02. MAIN RESPONSIVE PAGE CONTAINER                                       */}
      {/* ========================================================================= */}
      <main className="max-w-[1700px] mx-auto w-full p-3 sm:p-5 lg:p-8 flex-1 flex flex-col gap-3 sm:gap-4">
        {/* Top Search Bar & Location Header */}
        <div className="rounded-3xl bg-[#FFFFFF] p-3.5 sm:p-5 border border-[#E5E7EB] shadow-[0_10px_35px_rgba(55,159,210,0.08)] flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div>
                <h1 className="font-display text-sm sm:text-lg font-bold text-[#111111] leading-tight">
                  Peta Fasilitas Kesehatan
                </h1>
                <p className="text-[11px] sm:text-xs text-[#6B7280]">
                  Rumah Sakit, Klinik & Apotek di Seluruh Indonesia
                </p>
              </div>
            </div>

            <Button
              onClick={() => getUserGeolocation(true)}
              variant="outline"
              size="sm"
              disabled={loadingLocation}
              className="h-8 sm:h-9 gap-1.5 rounded-xl text-xs bg-[#FFFFFF] border-[#E5E7EB] text-[#4a6fa5] hover:bg-[#eef2f8] cursor-pointer shadow-2xs font-semibold shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingLocation ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{loadingLocation ? "GPS..." : "GPS Saya"}</span>
            </Button>
          </div>

          {/* Search Input Bar (Identical to Scanner) */}
          <div className="relative" ref={searchContainerRef}>
            <form onSubmit={handleAddressSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a6fa5]" />
                <Input
                  type="text"
                  placeholder="Ketik kota/alamat (misal: Bogor, Jakarta, Surabaya)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="pl-10 h-10 sm:h-11 text-xs sm:text-sm rounded-2xl bg-[#F7F9FB] border-[#E5E7EB] text-[#111111] focus-visible:border-[#4a6fa5] focus-visible:ring-1 focus-visible:ring-[#4a6fa5]"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="h-10 sm:h-11 px-4 sm:px-5 rounded-2xl text-xs sm:text-sm font-bold bg-[#4a6fa5] text-white shadow-xs cursor-pointer shrink-0 hover:bg-[#35517d] active:scale-[0.98] transition-transform"
              >
                {isSearching ? "..." : "Cari"}
              </Button>
            </form>

            {/* Auto-complete Dropdown Menu */}
            {showSearchResults && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-72 overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-2 shadow-2xl text-xs">
                {/* Option 1: Lokasi Saya Saat Ini (GPS) */}
                <button
                  type="button"
                  onClick={() => {
                    getUserGeolocation(true);
                    setShowSearchResults(false);
                  }}
                  className="w-full text-left p-2.5 bg-[#eef2f8] hover:bg-blue-100/80 rounded-xl flex items-center justify-between gap-2.5 border border-[#d1def0] cursor-pointer mb-1 text-[#4a6fa5] font-semibold transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#4a6fa5] text-white shrink-0 shadow-xs">
                      <Crosshair className="h-4 w-4 animate-pulse" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[#111111] font-bold text-xs">Lokasi Saya Saat Ini</span>
                      <span className="text-[10px] text-[#6B7280]">
                        Deteksi GPS presisi lokasi Anda
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-[#4a6fa5] text-white px-2 py-0.5 rounded-full shrink-0 font-bold">
                    GPS Anda
                  </span>
                </button>

                {/* Searched Location Results */}
                {searchResults.length > 0 ? (
                  searchResults.map((res, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSearchResult(res)}
                      className="w-full text-left p-2.5 hover:bg-[#F7F9FB] rounded-xl flex items-start gap-2 border-b border-[#E5E7EB]/40 last:border-0 cursor-pointer transition text-xs"
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-[#4a6fa5] mt-0.5" />
                      <span className="text-[#111111] line-clamp-2 leading-relaxed">
                        {res.displayname}
                      </span>
                    </button>
                  ))
                ) : searchQuery.trim().length > 0 && !isSearching ? (
                  <div className="p-2.5 text-center text-[#6B7280] text-xs">
                    Tekan <strong className="text-[#4a6fa5]">Cari</strong> untuk mencari &quot;
                    {searchQuery}&quot;
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Active Position Info & Source Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-0.5">
            <div className="flex items-center gap-1.5 font-medium text-[11px] sm:text-xs text-[#6B7280] bg-[#FFFFFF] px-3 py-1.5 rounded-xl border border-[#E5E7EB] truncate">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#4a6fa5] shrink-0" />
              <span className="truncate">
                Posisi: <strong className="text-[#111111]">{locationSource}</strong>
              </span>
            </div>

            <SourceSummaryBar sources={sourceStats} />
          </div>

          {/* Mobile View Toggle Bar (Responsive Segment Switcher) */}
          <div
            className={`grid lg:hidden p-1 bg-[#eef2f8] rounded-2xl border border-[#d1def0] shadow-2xs gap-1.5 ${
              selectedPharmacy ? "grid-cols-3" : "grid-cols-2"
            }`}
          >
            <button
              type="button"
              onClick={() => setMobileTab("map")}
              className={`flex items-center justify-center gap-1.5 h-9 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer border select-none ${
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
              className={`flex items-center justify-center gap-1.5 h-9 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer border select-none ${
                mobileTab === "list"
                  ? "bg-[#4a6fa5] text-white border-[#4a6fa5] shadow-xs font-extrabold"
                  : "bg-white/80 text-[#4a6fa5] border-[#d1def0]/60 hover:bg-white hover:border-[#d1def0]"
              }`}
            >
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate">Daftar Fasilitas ({pharmacies.length})</span>
            </button>
            {selectedPharmacy && (
              <button
                type="button"
                onClick={() => setMobileTab("detail")}
                className={`flex items-center justify-center gap-1.5 h-9 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer border select-none ${
                  mobileTab === "detail"
                    ? "bg-[#F59E0B] text-white border-[#F59E0B] shadow-xs font-extrabold"
                    : "bg-white/80 text-[#D97706] border-amber-200/80 hover:bg-white hover:border-amber-300"
                }`}
              >
                <Info className="h-4 w-4 shrink-0" />
                <span className="truncate">Detail</span>
              </button>
            )}
          </div>
        </div>

        {/* Main 3-Column Desktop Layout & Mobile View */}
        <div className="flex flex-col lg:flex-row gap-4 min-h-[450px] lg:h-[560px] xl:h-[580px] items-stretch">
          {/* Column 1 (Left): PharmacyList */}
          <div
            className={`w-full lg:w-[340px] xl:w-[380px] shrink-0 h-full flex-col ${
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
              dangerLevel="rendah"
              onSelectPharmacy={handleSelectPharmacy}
              onTransportModeChange={handleTransportModeChange}
              onCloseCard={() => {
                setSelectedPharmacy(null);
                setSelectedPlace(null);
                setRouteInfo(null);
              }}
            />
          </div>

          {/* Column 2 (Center): Clean Unobstructed Map Canvas */}
          <div
            className={`relative flex-1 min-w-0 h-full rounded-3xl overflow-hidden border border-[#E5E7EB] bg-[#FFFFFF] shadow-md flex flex-col ${
              mobileTab === "map" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="relative flex-1 w-full h-full">
              <OpenStreetMapCanvas
                userLocation={userLocation}
                pharmacies={pharmacies}
                selectedPharmacy={selectedPharmacy}
                routeInfo={routeInfo}
                onSelectPharmacy={handleSelectPharmacy}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Column 3 (Right Side Dedicated Detail Panel - Outside the Map!) */}
          {selectedPharmacy && (
            <div
              className={`w-full lg:w-[380px] xl:w-[420px] shrink-0 h-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-3xl p-4 sm:p-5 shadow-lg flex-col overflow-y-auto animate-fade-in scrollbar-thin scrollbar-thumb-[#4a6fa5]/20 ${
                mobileTab === "detail" ? "flex" : "hidden lg:flex"
              }`}
            >
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

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPharmacy(null);
                      setSelectedPlace(null);
                      setRouteInfo(null);
                    }}
                    className="text-[#6B7280] hover:text-[#111111] p-1.5 rounded-full hover:bg-slate-100 shrink-0 transition cursor-pointer"
                    title="Tutup Panel Detail"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Clean Full Photo Header */}
              <div className="relative h-36 sm:h-40 w-full rounded-2xl overflow-hidden mb-3 border border-[#E5E7EB] bg-slate-100 shrink-0 shadow-xs">
                <img
                  src={finalPhotoUrl || getWikimediaFallbackPhoto(selectedPharmacy.facilityType, selectedPharmacy.name.charCodeAt(0) || 0)}
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
                <h3 className="text-lg font-bold text-[#111111] leading-snug">
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
                    {selectedPharmacy.openingHoursText || "Buka 24 Jam (IGD Siaga)"}
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

              {/* Review Comment Snippet */}
              <div className="mb-3.5 p-3 bg-blue-50/60 border border-blue-200/80 rounded-2xl text-xs text-[#35517d] flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-[#4a6fa5] shrink-0 mt-0.5" />
                <p className="italic leading-relaxed">&quot;{finalReviewText}&quot;</p>
              </div>

              {/* Mode Transport Switcher & Duration ETA */}
              <div className="p-2.5 bg-[#F7F9FB] rounded-2xl border border-[#E5E7EB] mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTransportModeChange("driving")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                      transportMode === "driving"
                        ? "bg-[#4a6fa5] text-white shadow-xs"
                        : "bg-white text-[#6B7280] border border-[#E5E7EB]"
                    }`}
                  >
                    <Car className="h-3.5 w-3.5" /> Mobil
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTransportModeChange("motorcycle")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                      transportMode === "motorcycle"
                        ? "bg-[#4a6fa5] text-white shadow-xs"
                        : "bg-white text-[#6B7280] border border-[#E5E7EB]"
                    }`}
                  >
                    <Bike className="h-3.5 w-3.5" /> Motor
                  </button>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-[#4a6fa5] text-sm sm:text-base">
                    {routeInfo
                      ? `${routeInfo.durationMin} Menit`
                      : `${Math.ceil(selectedPharmacy.distanceKm * 4)} Menit`}
                  </div>
                  <div className="text-[10px] text-[#6B7280]">Estimasi Waktu</div>
                </div>
              </div>

              {/* Direct Google Maps Navigation Primary CTA Button */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPharmacy.lat},${selectedPharmacy.lon}`}
                target="_blank"
                rel="noreferrer"
                className="w-full h-11 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition cursor-pointer mt-auto"
              >
                <Navigation className="h-4 w-4" />
                <span>Buka Navigasi Google Maps</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
        <Footer />
      </main>

      {/* ========================================================================= */}
      {/* 03. MOBILE BOTTOM NAVIGATION BAR                                          */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] py-2 px-4 flex lg:hidden items-center justify-around shadow-lg">
        <Link
          to="/"
          className="flex flex-col items-center gap-0.5 text-[#6B7280] hover:text-[#4a6fa5] transition"
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Beranda</span>
        </Link>

        <Link
          to="/maps"
          className="flex flex-col items-center gap-0.5 text-[#4a6fa5] font-bold transition"
        >
          <Compass className="h-5 w-5" />
          <span className="text-[10px] font-extrabold">Peta</span>
        </Link>

        <Link
          to="/scanner"
          className="flex flex-col items-center gap-0.5 text-[#6B7280] hover:text-[#4a6fa5] transition"
        >
          <ScanLine className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Scan</span>
        </Link>

        <Link
          to="/anatomy"
          className="flex flex-col items-center gap-0.5 text-[#6B7280] hover:text-[#4a6fa5] transition"
        >
          <Stethoscope className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Anatomi</span>
        </Link>

        <Link
          to="/profile"
          className="flex flex-col items-center gap-0.5 text-[#6B7280] hover:text-[#4a6fa5] transition"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Profil</span>
        </Link>
      </div>
    </div>
  );
}
