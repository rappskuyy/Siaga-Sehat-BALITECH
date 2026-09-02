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
  fetchIPLocation,
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

  // High-precision GPS Geolocation
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
      const ipCoords = await fetchIPLocation();
      if (ipCoords) {
        await updateLocationAndFacilities(ipCoords, "Lokasi IP");
      } else {
        await updateLocationAndFacilities(DEFAULT_CENTER, "Lokasi Default");
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        await updateLocationAndFacilities(coords, "GPS Presisi");
      },
      async () => {
        const ipCoords = await fetchIPLocation();
        if (ipCoords) {
          await updateLocationAndFacilities(ipCoords, "Lokasi IP");
        } else {
          await updateLocationAndFacilities(DEFAULT_CENTER, "Lokasi Default");
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  }, []);

  useEffect(() => {
    getUserGeolocation();
  }, [getUserGeolocation]);

  // Load nearby facilities and calculate OSRM route for nearest facility
  const loadNearbyFacilities = async (lat: number, lon: number) => {
    setLoadingFacilities(true);
    try {
      // Fetch all nearby hospitals, clinics, and pharmacies around [lat, lon]
      const results = await fetchNearbyPharmacies(lat, lon, undefined, undefined, "rendah");
      setPharmacies(results);

      if (results.length > 0) {
        const nearest = results[0];
        setSelectedPharmacy(nearest);
        const route = await fetchOSRMRoute([lat, lon], nearest, transportMode);
        setRouteInfo(route);
      } else {
        setSelectedPharmacy(null);
        setRouteInfo(null);
      }
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

  const handleSelectFacility = async (facility: PharmacyNode) => {
    setSelectedPharmacy(facility);
    setShowDetailsPanel(true);
    setShowLocationList(false); // Otomatis hide daftar lokasi saat fasilitas dipilih

    const startLoc = userLocation || DEFAULT_CENTER;
    try {
      const route = await fetchOSRMRoute(startLoc, facility, transportMode);
      setRouteInfo(route);
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

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
    ? getFacilityDescriptionByIndex(selectedPharmacy.placeId?.charCodeAt(0) || 0)
    : "";

  return (
    <div className="fixed inset-0 w-full h-screen bg-white overflow-hidden flex flex-col lg:hidden">
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
        <div className="absolute top-3 left-3 right-3 z-40">
          <form onSubmit={handleAddressSearch} className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280] pointer-events-none" />
              <input
                type="text"
                placeholder="Cari lokasi / rumah sakit..."
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
                className="w-full pl-10 pr-8 py-2.5 rounded-2xl border border-[#E5E7EB] bg-white/95 backdrop-blur-md text-xs font-medium text-[#111111] shadow-lg focus:outline-none focus:border-[#4a6fa5]"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setShowSearchResults(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => getUserGeolocation(true)}
              className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E5E7EB] shadow-lg hover:bg-slate-50 transition active:scale-95 flex items-center justify-center text-[#4a6fa5]"
              title="Perbarui GPS"
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
        <div className="absolute top-16 left-3 right-3 z-40 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar items-center">
          {[
            { id: "all", label: "Semua", icon: Building2 },
            { id: "hospital", label: "Rumah Sakit", icon: Building2 },
            { id: "clinic", label: "Klinik", icon: Stethoscope },
            { id: "pharmacy", label: "Apotek", icon: Pill },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setFacilityTypeFilter(id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition shadow-md backdrop-blur-md ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition shadow-md backdrop-blur-md shrink-0 ${
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
        {selectedPharmacy && routeInfo && (
          <div className="absolute top-28 left-3 right-3 z-40">
            <div className="bg-[#4a6fa5] text-white px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center justify-between gap-2 border border-white/20 backdrop-blur-md">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Navigation className="h-4 w-4 text-white" />
                </div>
                <div className="truncate">
                  <p className="text-[11px] font-bold truncate">{selectedPharmacy.name}</p>
                  <p className="text-[10px] text-white/80 font-medium">
                    Estimasi {routeInfo.durationMin} Menit • {routeInfo.distanceKm} km
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsPanel(true)}
                className="px-3 py-1.5 rounded-xl bg-white text-[#4a6fa5] text-[11px] font-extrabold hover:bg-slate-100 transition shrink-0 shadow-sm"
              >
                Detail
              </button>
            </div>
          </div>
        )}

        {/* Floating Facility Cards Horizontal Carousel - Bottom (Shown only when showLocationList is true) */}
        {showLocationList && !showDetailsPanel && filteredPharmacies.length > 0 && (
          <div className="absolute bottom-[80px] left-3 right-3 z-40 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#E5E7EB] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 max-h-[230px] flex flex-col">
            {/* Scroll/Drag Handle Bar to Close Location List */}
            <div
              onClick={() => setShowLocationList(false)}
              className="w-full flex flex-col items-center pb-2 cursor-pointer group"
              title="Tutup / Geser Ke Bawah"
            >
              <div className="w-12 h-1.5 bg-gray-300 group-hover:bg-[#4a6fa5] rounded-full transition-colors" />
            </div>

            <div className="flex items-center justify-between mb-2 shrink-0 px-1">
              <h3 className="text-xs font-extrabold text-[#111111] flex items-center gap-1.5">
                <List className="h-4 w-4 text-[#4a6fa5]" />
                Daftar Lokasi Terdekat ({filteredPharmacies.length})
              </h3>
            </div>
            <div className="overflow-y-auto space-y-2 pr-1 max-h-[160px]">
              {filteredPharmacies.map((facility) => {
                const isSelected = selectedPharmacy?.id === facility.id;
                const isHosp = facility.facilityType === "hospital";
                const isClinic = facility.facilityType === "clinic";
                return (
                  <button
                    key={facility.id}
                    onClick={() => handleSelectFacility(facility)}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? "bg-[#4a6fa5]/10 border-[#4a6fa5] ring-1 ring-[#4a6fa5]"
                        : "bg-white border-[#E5E7EB] hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {/* Facility Category Icon Badge (No broken/useless images) */}
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
                        <h4 className="text-xs font-bold text-[#111111] truncate">{facility.name}</h4>
                        <p className="text-[10px] text-gray-500 truncate">{facility.address || "Alamat Terdaftar"}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-[#4a6fa5] block">
                        {facility.distanceKm < 1 ? `${(facility.distanceKm * 1000).toFixed(0)} m` : `${facility.distanceKm.toFixed(1)} km`}
                      </span>
                      <span className="text-[10px] text-amber-500 font-bold">★ {facility.rating || "4.8"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Floating Toggle Button (Bottom Left) when list is hidden */}
        {!showLocationList && !showDetailsPanel && (
          <div className="absolute bottom-[80px] left-3 z-40">
            <button
              onClick={() => setShowLocationList(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E5E7EB] shadow-xl text-xs font-bold text-[#4a6fa5] hover:bg-slate-50 active:scale-95 transition"
            >
              <List className="h-4 w-4" />
              Daftar Lokasi ({filteredPharmacies.length})
            </button>
          </div>
        )}

        {/* Recenter GPS Floating Button (Bottom Right) */}
        {!showDetailsPanel && (
          <div className="absolute bottom-[80px] right-3 z-40">
            <button
              onClick={() => getUserGeolocation(true)}
              className="p-3 rounded-full bg-[#4a6fa5] text-white border-2 border-white shadow-xl hover:bg-[#35517d] transition active:scale-90 flex items-center justify-center"
              title="Lokasi Presisi Saya"
            >
              <Crosshair className={`h-5 w-5 ${loadingLocation ? "animate-spin" : ""}`} />
            </button>
          </div>
        )}
      </div>

      {/* Details Panel - Bottom Sheet */}
      {selectedPharmacy && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl border-t border-[#E5E7EB] shadow-2xl transition-transform duration-300 ${
            showDetailsPanel ? "translate-y-0" : "translate-y-[calc(100%-80px)]"
          }`}
          style={{ maxHeight: "70vh" }}
        >
          {/* Scroll / Drag Handle to Close Details Panel */}
          <div
            className="flex justify-center items-center py-2.5 cursor-pointer group"
            onClick={() => {
              setShowDetailsPanel(false);
              setSelectedPharmacy(null);
            }}
            title="Tutup Keterangan / Geser Ke Bawah"
          >
            <div className="w-12 h-1.5 bg-[#D1D5DB] group-hover:bg-[#4a6fa5] rounded-full transition-colors"></div>
          </div>

          {/* Content */}
          <div className={`overflow-y-auto px-4 pb-6 ${showDetailsPanel ? "max-h-[calc(70vh-40px)]" : "hidden"}`}>
            {/* Header (No X button) */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-bold uppercase text-[#4a6fa5] flex items-center gap-1.5 mb-1">
                  {selectedPharmacy.facilityType === "hospital" ? (
                    <><Building2 className="h-3.5 w-3.5 text-red-500 shrink-0" /> RUMAH SAKIT</>
                  ) : selectedPharmacy.facilityType === "clinic" ? (
                    <><Stethoscope className="h-3.5 w-3.5 text-amber-500 shrink-0" /> KLINIK</>
                  ) : (
                    <><Pill className="h-3.5 w-3.5 text-blue-500 shrink-0" /> APOTEK</>
                  )}
                </span>
                <h2 className="text-lg font-bold text-[#111111]">{selectedPharmacy.name}</h2>
              </div>
            </div>

            {/* Photo */}
            <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-4 bg-slate-100 border border-[#E5E7EB] shadow-xs">
              <img
                src={finalPhotoUrl || getWikimediaFallbackPhoto(selectedPharmacy.facilityType, selectedPharmacy.name.charCodeAt(0) || 0)}
                alt={selectedPharmacy.name}
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

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#E5E7EB]">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
              <span className="font-bold text-[#111111]">{selectedPharmacy.rating ? Number(selectedPharmacy.rating).toFixed(1) : "4.8"}</span>
              <span className="text-xs text-[#6B7280]">
                ({selectedPharmacy.userRatingsTotal || "128"} ulasan)
              </span>
            </div>

            {/* Address */}
            <div className="mb-4">
              <p className="text-xs text-[#6B7280] font-medium mb-1">Lokasi</p>
              <p className="text-sm text-[#111111] flex items-start gap-1.5">
                <MapPin className="h-4 w-4 text-[#4a6fa5] shrink-0 mt-0.5" />
                <span>
                  {selectedPharmacy.address || `Jl. Sekitar (${selectedPharmacy.lat.toFixed(4)}, ${selectedPharmacy.lon.toFixed(4)})`}
                </span>
              </p>
            </div>

            {/* Description */}
            <div className="mb-4">
              <p className="text-xs text-[#6B7280] font-medium mb-2">Deskripsi</p>
              <p className="text-sm text-[#111111] leading-relaxed">{finalDescription}</p>
            </div>

            {/* Hours & Distance */}
            <div className="mb-4 p-3 bg-[#eef2f8] rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-semibold text-[#4a6fa5]">
                  {selectedPharmacy.openingHoursText || "Buka 24 Jam"}
                </span>
              </div>
              <span className="text-sm font-bold text-[#111111]">
                {selectedPharmacy.distanceKm < 1
                  ? `${(selectedPharmacy.distanceKm * 1000).toFixed(0)} m`
                  : `${selectedPharmacy.distanceKm.toFixed(2)} km`}
              </span>
            </div>

            {/* Phone */}
            {selectedPharmacy.phone && (
              <div className="mb-4 p-3 bg-slate-50 rounded-xl flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#4a6fa5]" />
                <span className="text-sm text-[#111111] font-medium">{selectedPharmacy.phone}</span>
              </div>
            )}

            {/* Transport Mode Selector */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => handleTransportModeChange("driving")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                  transportMode === "driving"
                    ? "bg-[#4a6fa5] text-white"
                    : "bg-slate-100 text-[#111111] border border-[#E5E7EB]"
                }`}
              >
                <Car className="h-4 w-4" /> Mobil
              </button>
              <button
                onClick={() => handleTransportModeChange("motorcycle")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                  transportMode === "motorcycle"
                    ? "bg-[#4a6fa5] text-white"
                    : "bg-slate-100 text-[#111111] border border-[#E5E7EB]"
                }`}
              >
                <Bike className="h-4 w-4" /> Motor
              </button>
            </div>

            {/* Duration */}
            {routeInfo && (
              <div className="mb-4 p-3 bg-[#eef2f8] rounded-xl text-center">
                <p className="text-xs text-[#6B7280] font-medium">Estimasi Waktu</p>
                <p className="text-lg font-bold text-[#4a6fa5]">{routeInfo.durationMin} Menit</p>
              </div>
            )}

            {/* Navigation Button */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPharmacy.lat},${selectedPharmacy.lon}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition"
            >
              <Navigation className="h-4 w-4" />
              Navigasi Google Maps
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] py-2 px-4 flex lg:hidden items-center justify-around shadow-lg">
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
          <span className="text-[10px] font-semibold">Scan AI</span>
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
