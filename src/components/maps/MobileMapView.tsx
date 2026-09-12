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
  Navigation,
  Star,
  Clock,
  Car,
  Bike,
  X,
  ExternalLink,
  ScanLine,
  User,
  Home,
  ChevronUp,
  Phone,
  List,
  Layers,
} from "lucide-react";
import { OpenStreetMapCanvas } from "./OpenStreetMapCanvas";
import {
  DEFAULT_CENTER,
  fetchNearbyPharmacies,
  fetchOSRMRoute,
  searchLocationByAddress,
  reverseGeocode,
  type PharmacyNode,
  type RouteInfo,
  type TransportMode,
} from "./maps.service";
import { getRandomFacilityPhoto, getFacilityDescriptionByIndex } from "@/data/facilitiesDummyData";
import { getWikimediaFallbackPhoto } from "@/lib/maps/wikimedia.service";
import { useAuth } from "@/lib/auth/auth-context";

const containerStyle = {
  width: "100%",
  height: "100%",
};

interface ExtendedRouteInfo extends RouteInfo {
  directionsResult?: any;
}

type Libraries = ("places" | "drawing" | "geometry" | "visualization")[];
const GOOGLE_MAPS_LIBRARIES: Libraries = Object.freeze(["places"]) as Libraries;

// SVG Marker Icons
const userLocationSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
  <circle cx="18" cy="18" r="16" fill="rgba(74,111,165,0.25)"/>
  <circle cx="18" cy="18" r="10" fill="#4a6fa5" stroke="#FFFFFF" stroke-width="3"/>
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

// Pharmacy Markers (Blue - updated to match landing page blue #4a6fa5)
const pharmacyPinSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42" fill="none">
  <path d="M17 0C7.611 0 0 7.611 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.611 26.389 0 17 0Z" fill="#4a6fa5"/>
  <circle cx="17" cy="16" r="7.5" fill="#FFFFFF"/>
  <circle cx="17" cy="16" r="4" fill="#35517d"/>
</svg>
`)}`;

const pharmacyActivePinSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="46" height="54" viewBox="0 0 46 54" fill="none">
  <circle cx="23" cy="19" r="19" fill="rgba(74, 111, 165, 0.45)"/>
  <path d="M23 2C14.163 2 7 9.163 7 18C7 30 23 48 23 48C23 48 39 30 39 18C39 9.163 31.837 2 23 2Z" fill="#35517d" stroke="#FFFFFF" stroke-width="2.5"/>
  <circle cx="23" cy="17" r="8" fill="#FFFFFF"/>
  <circle cx="23" cy="17" r="4" fill="#35517d"/>
</svg>
`)}`;

export function MobileMapView() {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [locationSource, setLocationSource] = useState<string>("GPS Presisi");
  const [pharmacies, setPharmacies] = useState<PharmacyNode[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyNode | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<"all" | "hospital" | "clinic" | "pharmacy">("all");
  const [loadingFacilities, setLoadingFacilities] = useState<boolean>(false);
  const [showLocationList, setShowLocationList] = useState<boolean>(false);
  const [transportMode, setTransportMode] = useState<TransportMode>("driving");
  const [routeInfo, setRouteInfo] = useState<ExtendedRouteInfo | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);

  // High-precision GPS Geolocation via Browser Geolocation API
  const getUserGeolocation = useCallback(async (isManualClick = false) => {
    setLoadingLocation(true);

    const updateLocationAndFacilities = async (coords: [number, number], source: string) => {
      setUserLocation(coords);
      setLocationSource(source);
      setLoadingLocation(false);

      let address = "";
      try {
        address = (await reverseGeocode(coords[0], coords[1])) || "";
        if (address) {
          setSearchInput(address);
        }
      } catch {}

      await loadNearbyFacilities(coords[0], coords[1]);
    };

    if (!navigator.geolocation) {
      await updateLocationAndFacilities(DEFAULT_CENTER, "Lokasi Default");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        await updateLocationAndFacilities(coords, "GPS Browser (Geolocation API)");
      },
      (err) => {
        console.warn("GPS High Accuracy error, fallback ke standard GPS:", err);
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
            await updateLocationAndFacilities(coords, "GPS Browser (Geolocation API)");
          },
          (lowErr) => {
            console.warn("Geolocation API error:", lowErr);
            updateLocationAndFacilities(DEFAULT_CENTER, "Lokasi Default (Jakarta)");
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, []);

  useEffect(() => {
    // Only query GPS immediately if user has already granted permission, otherwise load default center
    if (typeof navigator !== "undefined" && navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((perm) => {
          if (perm.state === "granted") {
            getUserGeolocation();
          } else {
            setUserLocation(DEFAULT_CENTER);
            loadNearbyFacilities(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
          }
        })
        .catch(() => {
          setUserLocation(DEFAULT_CENTER);
          loadNearbyFacilities(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
        });
    } else {
      setUserLocation(DEFAULT_CENTER);
      loadNearbyFacilities(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
    }
  }, [getUserGeolocation]);

  // Load nearby facilities around user location
  const loadNearbyFacilities = async (lat: number, lon: number) => {
    setLoadingFacilities(true);
    try {
      // Fetch all nearby hospitals, clinics, and pharmacies around [lat, lon]
      const results = await fetchNearbyPharmacies(lat, lon, undefined, undefined, "rendah");
      setPharmacies(results);

      // Keep map centered on user's location initially (do not auto-select destination)
      setSelectedPharmacy(null);
      setRouteInfo(null);
    } catch (error) {
      console.error("Error fetching facilities:", error);
    } finally {
      setLoadingFacilities(false);
    }
  };

  // Filter pharmacies by facility type filter (All, Hospital, Clinic, Pharmacy)
  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter((p) => {
      if (facilityTypeFilter === "all") return true;
      return p.facilityType === facilityTypeFilter;
    });
  }, [pharmacies, facilityTypeFilter]);

  // Hardware-Accelerated 120FPS Drag Physics (Detail Panel)
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
        setShowDetailsPanel(false);
      }, 300);
    } else {
      sheet.style.transform = "translate3d(0, 0, 0)";
    }
  };

  // Hardware-Accelerated 120FPS Drag Physics (Location List Sheet)
  const listSheetRef = useRef<HTMLDivElement>(null);
  const listStartY = useRef<number>(0);
  const listCurrentY = useRef<number>(0);

  const handleListTouchStart = (e: React.TouchEvent) => {
    listStartY.current = e.touches[0].clientY;
    listCurrentY.current = 0;
    if (listSheetRef.current) {
      listSheetRef.current.style.transition = "none";
    }
  };

  const handleListTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - listStartY.current;
    if (deltaY > 0) {
      listCurrentY.current = deltaY;
      if (listSheetRef.current) {
        listSheetRef.current.style.transform = `translate3d(0, ${deltaY}px, 0)`;
      }
    }
  };

  const handleListTouchEnd = () => {
    const sheet = listSheetRef.current;
    if (!sheet) return;

    sheet.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
    if (listCurrentY.current > 70) {
      sheet.style.transform = "translate3d(0, 100%, 0)";
      setTimeout(() => {
        setShowLocationList(false);
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
      setShowDetailsPanel(false);
      if (detailSheetRef.current) {
        detailSheetRef.current.style.transform = "translate3d(0, 0, 0)";
      }
    }, 280);
  }, []);

  const handleSelectFacility = async (facility: PharmacyNode) => {
    setSelectedPharmacy(facility);
    setShowDetailsPanel(true);
    setShowLocationList(false); // Otomatis hide daftar lokasi saat fasilitas dipilih

    if (detailSheetRef.current) {
      detailSheetRef.current.style.transform = "translate3d(0, 0, 0)";
      detailSheetRef.current.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
    }

    const startLoc = userLocation || DEFAULT_CENTER;
    try {
      const route = await fetchOSRMRoute(startLoc, facility, transportMode);
      setRouteInfo(route);
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  useEffect(() => {
    if (showDetailsPanel && detailSheetRef.current) {
      detailSheetRef.current.style.transform = "translate3d(0, 0, 0)";
      detailSheetRef.current.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
    }
  }, [showDetailsPanel, selectedPharmacy]);

  const handleTransportModeChange = async (mode: TransportMode) => {
    setTransportMode(mode);
    if (selectedPharmacy) {
      const startLoc = userLocation || DEFAULT_CENTER;
      try {
        const route = await fetchOSRMRoute(startLoc, selectedPharmacy, mode);
        setRouteInfo(route);
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    }
  };

  // Handle Manual Pin Placement on Map click
  const handleManualLocationChange = async (coords: [number, number]) => {
    setUserLocation(coords);
    setLocationSource("Pin Manual");
    let address = "";
    try {
      address = (await reverseGeocode(coords[0], coords[1])) || "";
      if (address) setSearchInput(address);
    } catch {}
    await loadNearbyFacilities(coords[0], coords[1]);
  };

  // Address Geocoding Search
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setIsSearching(true);
    setShowSearchResults(true);
    try {
      const results = await searchLocationByAddress(searchInput);
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

  const handleSelectSearchResult = (result: any) => {
    const coords: [number, number] = [result.lat, result.lon];
    setUserLocation(coords);
    setLocationSource(`Alamat: ${result.displayname.slice(0, 25)}...`);
    setShowSearchResults(false);
    setShowLocationList(false);
    loadNearbyFacilities(result.lat, result.lon);
  };

  const finalPhotoUrl = selectedPharmacy
    ? getWikimediaFallbackPhoto(selectedPharmacy.facilityType, selectedPharmacy.name?.charCodeAt(0) || 0)
    : undefined;
  const finalDescription = selectedPharmacy
    ? getFacilityDescriptionByIndex(selectedPharmacy.placeId?.charCodeAt(0) || selectedPharmacy.name?.charCodeAt(0) || 0)
    : "";

  return (
    <div className="fixed inset-0 w-full h-[100dvh] min-h-[100dvh] bg-white overflow-hidden flex flex-col lg:hidden">
      <h1 className="sr-only">Peta Fasilitas Kesehatan, Rumah Sakit, Klinik, dan Apotek Terdekat</h1>

      {/* Full Screen OpenStreetMap */}
      <div className="flex-1 relative">
        <OpenStreetMapCanvas
          userLocation={userLocation}
          pharmacies={filteredPharmacies}
          selectedPharmacy={selectedPharmacy}
          routeInfo={routeInfo}
          onSelectPharmacy={handleSelectFacility}
          onManualLocationChange={handleManualLocationChange}
          className="w-full h-full"
        />

        {/* Top Search Bar - Floating */}
        <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3 right-3 z-40">
          <form onSubmit={handleAddressSearch} className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280] pointer-events-none" />
              <input
                type="text"
                placeholder="Cari lokasi / rumah sakit..."
                aria-label="Cari lokasi atau nama fasilitas kesehatan"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (e.target.value.length > 2) {
                    searchLocationByAddress(e.target.value)
                      .then((res) => {
                        setSearchResults(res);
                        setShowSearchResults(true);
                      })
                      .catch(() => {});
                  } else {
                    setShowSearchResults(false);
                  }
                }}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-[#E5E7EB] bg-white/95 backdrop-blur-md text-xs font-medium text-[#111111] shadow-lg focus:outline-none focus:border-[#4a6fa5]"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setShowSearchResults(false);
                  }}
                  aria-label="Hapus teks pencarian"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => getUserGeolocation(true)}
              className="p-2.5 min-w-[42px] min-h-[42px] rounded-2xl bg-white/95 backdrop-blur-md border border-[#E5E7EB] shadow-lg hover:bg-slate-50 transition active:scale-95 flex items-center justify-center text-[#4a6fa5]"
              title="Perbarui GPS"
              aria-label="Perbarui lokasi GPS saya"
            >
              <RefreshCw className={`h-4 w-4 ${loadingLocation ? "animate-spin" : ""}`} />
            </button>
          </form>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="mt-2 bg-white rounded-2xl border border-[#E5E7EB] shadow-xl overflow-hidden max-h-48 overflow-y-auto z-50">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSearchResult(item)}
                  aria-label={`Pilih lokasi ${item.displayname}`}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-[#111111] hover:bg-slate-50 border-b border-gray-100 last:border-0 flex items-start gap-2"
                >
                  <MapPin className="h-3.5 w-3.5 text-[#4a6fa5] mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{item.displayname}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Filter Bubbles */}
        <div className="absolute top-[calc(3.75rem+env(safe-area-inset-top,0px))] left-3 right-3 z-40 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar items-center">
          {[
            { id: "all", label: "Semua", icon: Building2 },
            { id: "hospital", label: "Rumah Sakit", icon: Building2 },
            { id: "clinic", label: "Klinik", icon: Stethoscope },
            { id: "pharmacy", label: "Apotek", icon: Pill },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setFacilityTypeFilter(id as any)}
              aria-label={`Filter fasilitas ${label}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-[11px] font-bold whitespace-nowrap transition shadow-md backdrop-blur-md ${
                facilityTypeFilter === id
                  ? "bg-[#4a6fa5] text-white"
                  : "bg-white/95 text-[#111111] border border-[#E5E7EB]"
              }`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
          <button
            onClick={() => setShowLocationList(!showLocationList)}
            aria-label={showLocationList ? "Sembunyikan daftar lokasi" : `Lihat daftar ${filteredPharmacies.length} lokasi`}
            className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-[11px] font-bold whitespace-nowrap transition shadow-md backdrop-blur-md shrink-0 ${
              showLocationList
                ? "bg-amber-500 text-white"
                : "bg-white/95 text-[#4a6fa5] border border-[#4a6fa5]/40"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            {showLocationList ? "Sembunyikan Daftar" : `Daftar Lokasi (${filteredPharmacies.length})`}
          </button>
        </div>

        {/* Active Route Floating Card Banner */}
        {selectedPharmacy && routeInfo && !showDetailsPanel && (
          <div className="absolute top-[calc(6.5rem+env(safe-area-inset-top,0px))] left-3 right-3 z-40 animate-fade-in">
            <div className="bg-[#4a6fa5] text-white px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center justify-between gap-2 border border-white/20 backdrop-blur-md">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Navigation className="h-4 w-4 text-white" />
                </div>
                <div className="truncate">
                  <p className="text-[11px] font-bold truncate">{selectedPharmacy.name}</p>
                  <p className="text-[10px] text-white/80 font-medium">
                    Jarak: {routeInfo.distanceKm} km
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowDetailsPanel(true)}
                  aria-label="Buka rincian fasilitas terpilih"
                  className="px-3 py-1.5 rounded-xl bg-white text-[#4a6fa5] text-[11px] font-extrabold hover:bg-slate-100 transition shrink-0 shadow-sm cursor-pointer"
                >
                  Detail
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPharmacy(null);
                    setRouteInfo(null);
                  }}
                  aria-label="Hapus rute navigasi aktif"
                  className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
                  title="Hapus Rute"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Facility Cards Horizontal Carousel - Bottom (Shown only when showLocationList is true) */}
        {showLocationList && !showDetailsPanel && filteredPharmacies.length > 0 && (
          <div
            ref={listSheetRef}
            className="absolute bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] left-3 right-3 z-40 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#E5E7EB] shadow-2xl max-h-[48dvh] flex flex-col will-change-transform translate-y-0"
          >
            {/* Scroll/Drag Handle Bar to Close Location List */}
            <div
              onTouchStart={handleListTouchStart}
              onTouchMove={handleListTouchMove}
              onTouchEnd={handleListTouchEnd}
              onClick={() => {
                if (listCurrentY.current < 5) {
                  if (listSheetRef.current) {
                    listSheetRef.current.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
                    listSheetRef.current.style.transform = "translate3d(0, 100%, 0)";
                  }
                  setTimeout(() => setShowLocationList(false), 300);
                }
              }}
              className="w-full py-2.5 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing active:bg-slate-100/80 rounded-t-2xl shrink-0 select-none border-b border-gray-100 mb-2 touch-none"
              title="Geser ke Bawah untuk Menutup"
              role="button"
              tabIndex={0}
              aria-label="Tutup daftar lokasi fasilitas"
            >
              <div className="w-14 h-1.5 bg-slate-300 hover:bg-[#4a6fa5] rounded-full transition-colors" />
              <span className="text-[10px] font-semibold text-gray-400 mt-0.5">Geser ke bawah untuk menutup</span>
            </div>

            <div className="flex items-center justify-between mb-2 shrink-0 px-1">
              <h2 className="text-xs font-extrabold text-[#111111] flex items-center gap-1.5">
                <List className="h-4 w-4 text-[#4a6fa5]" />
                Daftar Lokasi Terdekat ({filteredPharmacies.length})
              </h2>
            </div>
            <div className="overflow-y-auto space-y-2 pr-1 max-h-[calc(48dvh-80px)]">
              {filteredPharmacies.map((facility) => {
                const isSelected = selectedPharmacy?.id === facility.id;
                const isHosp = facility.facilityType === "hospital";
                const isClinic = facility.facilityType === "clinic";
                return (
                  <button
                    key={facility.id}
                    onClick={() => handleSelectFacility(facility)}
                    aria-label={`Pilih ${facility.name}, jarak ${facility.distanceKm.toFixed(1)} km`}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? "bg-[#4a6fa5]/10 border-[#4a6fa5] ring-1 ring-[#4a6fa5]"
                        : "bg-white border-[#E5E7EB] hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {/* Facility Category Icon Badge */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isHosp ? "bg-red-50 text-red-600 border-red-200" : isClinic ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-blue-50 text-blue-600 border-blue-200"
                      }`}>
                        {isHosp ? <Building2 className="h-4 w-4" /> : isClinic ? <Stethoscope className="h-4 w-4" /> : <Pill className="h-4 w-4" />}
                      </div>
                      <div className="truncate">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md block w-max mb-0.5 ${
                          isHosp ? "bg-red-100 text-red-700" : isClinic ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {isHosp ? "RUMAH SAKIT" : isClinic ? "KLINIK" : "APOTEK"}
                        </span>
                        <h3 className="text-xs font-bold text-[#111111] truncate">{facility.name}</h3>
                        <p className="text-[10px] text-gray-500 truncate">{facility.address || "Alamat Terdaftar"}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-[#4a6fa5] block">
                        {facility.distanceKm < 1 ? `${(facility.distanceKm * 1000).toFixed(0)} m` : `${facility.distanceKm.toFixed(1)} km`}
                      </span>
                      <span className="text-[10px] text-amber-500 font-bold inline-flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                        {facility.rating || "4.8"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Floating Toggle Button (Bottom Left) when list is hidden - Safely elevated above bottom nav */}
        {!showLocationList && !showDetailsPanel && (
          <div className="absolute bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] left-3 z-30">
            <button
              onClick={() => setShowLocationList(true)}
              aria-label={`Buka daftar ${filteredPharmacies.length} lokasi terdekat`}
              className="flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-2xl bg-white/95 backdrop-blur-md border border-[#E5E7EB] shadow-xl text-xs font-bold text-[#4a6fa5] hover:bg-slate-50 active:scale-95 transition"
            >
              <List className="h-4 w-4" />
              Daftar Lokasi ({filteredPharmacies.length})
            </button>
          </div>
        )}

        {/* Recenter GPS Floating Button (Bottom Right) - Safely elevated above bottom nav */}
        {!showDetailsPanel && (
          <div className="absolute bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-3 z-30">
            <button
              onClick={() => getUserGeolocation(true)}
              className="p-3 min-w-[46px] min-h-[46px] rounded-full bg-[#4a6fa5] text-white border-2 border-white shadow-xl hover:bg-[#35517d] transition active:scale-90 flex items-center justify-center"
              title="Lokasi Presisi Saya"
              aria-label="Pusatkan ke lokasi saya saat ini"
            >
              <Crosshair className={`h-5 w-5 ${loadingLocation ? "animate-spin" : ""}`} />
            </button>
          </div>
        )}
      </div>

      {/* Details Panel - Premium Bottom Sheet with high accessibility and full description */}
      {selectedPharmacy && showDetailsPanel && (
        <div
          ref={detailSheetRef}
          className="absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl border-t border-[#E5E7EB] shadow-2xl flex flex-col max-h-[72dvh] will-change-transform translate-y-0 animate-in slide-in-from-bottom-full duration-300"
        >
          {/* Scroll / Drag Handle Bar to Close Details Panel */}
          <div
            onTouchStart={handleDetailTouchStart}
            onTouchMove={handleDetailTouchMove}
            onTouchEnd={handleDetailTouchEnd}
            onClick={() => {
              if (detailCurrentY.current < 5) handleCloseDetails();
            }}
            className="w-full py-2.5 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing active:bg-slate-100 rounded-t-3xl shrink-0 select-none border-b border-gray-100 touch-none bg-white"
            title="Geser ke Bawah untuk Menutup"
            role="button"
            tabIndex={0}
            aria-label="Tutup panel rincian fasilitas"
          >
            <div className="w-12 h-1.5 bg-slate-300 hover:bg-[#4a6fa5] rounded-full transition-colors" />
            <span className="text-[10px] font-semibold text-gray-400 mt-0.5">Geser ke bawah untuk menutup</span>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto px-4 pt-3 pb-2 flex-1 scrollbar-thin scrollbar-thumb-[#4a6fa5]/20">
            {/* Header with Category Badge, Rating */}
            <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
              <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-full border shadow-2xs flex items-center gap-1 ${
                selectedPharmacy.facilityType === "hospital"
                  ? "bg-red-50 text-red-600 border-red-200"
                  : selectedPharmacy.facilityType === "clinic"
                    ? "bg-amber-50 text-amber-600 border-amber-200"
                    : "bg-blue-50 text-blue-600 border-blue-200"
              }`}>
                {selectedPharmacy.facilityType === "hospital" ? (
                  <><Building2 className="h-3 w-3 text-red-500 shrink-0" /> RUMAH SAKIT</>
                ) : selectedPharmacy.facilityType === "clinic" ? (
                  <><Stethoscope className="h-3 w-3 text-amber-500 shrink-0" /> KLINIK</>
                ) : (
                  <><Pill className="h-3 w-3 text-blue-500 shrink-0" /> APOTEK</>
                )}
              </span>

              <div className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-2xs">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span>{selectedPharmacy.rating ? Number(selectedPharmacy.rating).toFixed(1) : "4.8"}</span>
                <span className="text-[10px] text-amber-700 font-normal">
                  ({selectedPharmacy.userRatingsTotal || "128"})
                </span>
              </div>
            </div>

            {/* Title & Distance */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h2 className="text-sm sm:text-base font-bold text-[#111111] leading-snug">
                {selectedPharmacy.name}
              </h2>
              <span className="text-xs font-extrabold text-[#4a6fa5] shrink-0">
                {selectedPharmacy.distanceKm < 1
                  ? `${(selectedPharmacy.distanceKm * 1000).toFixed(0)} m`
                  : `${selectedPharmacy.distanceKm.toFixed(1)} km`}
              </span>
            </div>

            {/* Compact Photo Banner */}
            <div className="relative h-24 sm:h-28 w-full rounded-xl overflow-hidden mb-2.5 bg-slate-100 border border-[#E5E7EB] shadow-2xs shrink-0">
              <img
                src={finalPhotoUrl || getWikimediaFallbackPhoto(selectedPharmacy.facilityType, selectedPharmacy.name.charCodeAt(0) || 0)}
                alt={selectedPharmacy.name}
                width="360"
                height="112"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.style.display = "none";
                  }
                }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Address */}
            <p className="text-xs text-[#6B7280] flex items-start gap-1.5 mb-2 leading-relaxed">
              <MapPin className="h-3.5 w-3.5 text-[#4a6fa5] shrink-0 mt-0.5" />
              <span>
                {selectedPharmacy.address || `Jl. Sekitar (${selectedPharmacy.lat.toFixed(4)}, ${selectedPharmacy.lon.toFixed(4)})`}
              </span>
            </p>

            {/* Hours & Phone Bar */}
            <div className="mb-2.5 p-2 bg-[#eef2f8] rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="font-semibold text-[#4a6fa5] text-[11px]">
                  {selectedPharmacy.openingHoursText || (selectedPharmacy.facilityType === "hospital" ? "Buka 24 Jam (IGD)" : "Buka 24 Jam")}
                </span>
              </div>
              {selectedPharmacy.phone && (
                <a
                  href={`tel:${selectedPharmacy.phone}`}
                  className="text-[11px] text-[#4a6fa5] font-semibold flex items-center gap-1 hover:underline"
                >
                  <Phone className="h-3 w-3 shrink-0" />
                  <span>{selectedPharmacy.phone}</span>
                </a>
              )}
            </div>

            {/* Description / Review snippet - Elevated & Full text without any truncation */}
            {finalDescription && (
              <div className="p-3 bg-slate-50 rounded-xl mb-2 border border-gray-100">
                <p className="text-xs text-gray-700 italic leading-relaxed">
                  &ldquo;{finalDescription}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Fixed CTA Action Bar at Bottom of Sheet - Never cut off by gesture/navigation bars */}
          <div className="p-3 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white border-t border-gray-100 shrink-0">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPharmacy.lat},${selectedPharmacy.lon}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Buka petunjuk arah di aplikasi Google Maps"
              className="w-full py-3 min-h-[46px] rounded-xl bg-[#4a6fa5] hover:bg-[#35517d] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition cursor-pointer active:scale-[0.99]"
            >
              <Navigation className="h-4 w-4" />
              <span>Buka Navigasi Google Maps</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar - Elevated with safe-area-inset-bottom */}
      <nav aria-label="Navigasi Utama Mobile" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] px-4 flex lg:hidden items-center justify-around shadow-lg">
        <Link
          to="/"
          aria-label="Menuju halaman Beranda"
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-0.5 text-[#6B7280] hover:text-[#4a6fa5] transition"
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Beranda</span>
        </Link>

        <Link
          to="/maps"
          aria-label="Halaman Peta Fasilitas Aktif"
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-0.5 text-[#4a6fa5] font-bold transition"
        >
          <Compass className="h-5 w-5" />
          <span className="text-[10px] font-extrabold">Peta</span>
        </Link>

        <Link
          to="/scanner"
          aria-label="Menuju halaman Scanner AI"
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-0.5 text-[#6B7280] hover:text-[#4a6fa5] transition"
        >
          <ScanLine className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Scan</span>
        </Link>

        <Link
          to="/anatomy"
          aria-label="Menuju halaman Anatomi Interaktif"
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-0.5 text-[#6B7280] hover:text-[#4a6fa5] transition"
        >
          <Stethoscope className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Anatomi</span>
        </Link>

        <Link
          to="/profile"
          aria-label="Menuju halaman Profil Pengguna"
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-0.5 text-[#6B7280] hover:text-[#4a6fa5] transition"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Profil</span>
        </Link>
      </nav>
    </div>
  );
}
