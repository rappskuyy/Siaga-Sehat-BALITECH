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
} from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";
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
import { useAuth } from "@/lib/auth/auth-context";

const containerStyle = {
  width: "100%",
  height: "100%",
};

interface ExtendedRouteInfo extends RouteInfo {
  directionsResult?: google.maps.DirectionsResult | null;
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
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [pharmacies, setPharmacies] = useState<PharmacyNode[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyNode | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<"all" | "hospital" | "clinic" | "pharmacy">("all");
  const [loading, setLoading] = useState(true);
  const [transportMode, setTransportMode] = useState<TransportMode>("driving");
  const [routeInfo, setRouteInfo] = useState<ExtendedRouteInfo | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);

  // Fetch user location
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const location = await fetchIPLocation();
        if (location && Array.isArray(location) && typeof location[0] === "number" && !isNaN(location[0])) {
          setUserLocation([location[0], location[1]]);
          mapRef.current?.panTo({ lat: location[0], lng: location[1] });
        } else {
          setUserLocation(DEFAULT_CENTER);
          mapRef.current?.panTo({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] });
        }
      } catch (error) {
        console.warn("Location fetch failed, using default:", error);
        setUserLocation(DEFAULT_CENTER);
        mapRef.current?.panTo({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] });
      }
    };
    initializeLocation();
  }, []);

  // Fetch nearby facilities
  useEffect(() => {
    const fetchFacilities = async () => {
      if (!userLocation) return;
      try {
        setLoading(true);
        const results = await fetchNearbyPharmacies(
          userLocation[0],
          userLocation[1],
          5000
        );
        setPharmacies(results);
      } catch (error) {
        console.error("Error fetching facilities:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchFacilities, 1000);
    return () => clearTimeout(timer);
  }, [userLocation]);

  // Filter pharmacies
  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter((p) => {
      const matchesFilter = facilityTypeFilter === "all" || p.facilityType === facilityTypeFilter;
      const matchesSearch =
        searchInput === "" ||
        p.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        p.address?.toLowerCase().includes(searchInput.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [pharmacies, facilityTypeFilter, searchInput]);

  const getMarkerIcon = (facility: PharmacyNode, isActive: boolean): string => {
    if (facility.facilityType === "hospital") {
      return isActive ? hospitalActivePinSvg : hospitalPinSvg;
    }
    if (facility.facilityType === "clinic") {
      return isActive ? clinicActivePinSvg : clinicPinSvg;
    }
    return isActive ? pharmacyActivePinSvg : pharmacyPinSvg;
  };

  const handleSelectFacility = async (facility: PharmacyNode) => {
    setSelectedPharmacy(facility);
    setShowDetailsPanel(true);

    if (userLocation) {
      try {
        const route = await fetchOSRMRoute(
          [userLocation[0], userLocation[1]],
          facility,
          transportMode
        );
        setRouteInfo(route);
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    }
  };

  const handleTransportModeChange = async (mode: TransportMode) => {
    setTransportMode(mode);
    if (selectedPharmacy && userLocation) {
      try {
        const route = await fetchOSRMRoute(
          [userLocation[0], userLocation[1]],
          selectedPharmacy,
          mode
        );
        setRouteInfo(route);
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    }
  };

  // Auto fit map bounds when route is loaded
  useEffect(() => {
    if (mapRef.current && routeInfo && routeInfo.coordinates && routeInfo.coordinates.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      routeInfo.coordinates.forEach((c) => bounds.extend({ lat: c[0], lng: c[1] }));
      mapRef.current.fitBounds(bounds, { top: 90, right: 40, bottom: 280, left: 40 });
    }
  }, [routeInfo]);

  if (!isLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#4a6fa5] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-[#6B7280] font-medium">Memuat Peta...</p>
        </div>
      </div>
    );
  }

  const finalPhotoUrl = selectedPharmacy
    ? getRandomFacilityPhoto()
    : undefined;

  const finalDescription = selectedPharmacy
    ? getFacilityDescriptionByIndex(selectedPharmacy.placeId?.charCodeAt(0) || 0)
    : "";

  return (
    <div className="fixed inset-0 w-full h-screen bg-white overflow-hidden flex flex-col lg:hidden">
      {/* Full Screen Google Map */}
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={userLocation ? { lat: userLocation[0], lng: userLocation[1] } : { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] }}
          zoom={16}
          options={{
            disableDefaultUI: true,
            zoomControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            mapTypeControl: false,
            styles: [
              {
                featureType: "poi",
                stylers: [{ visibility: "off" }],
              },
            ],
          }}
          onLoad={(map) => {
            mapRef.current = map;
          }}
        >
          {/* User Location Marker */}
          {userLocation && (
            <Marker
              position={{ lat: userLocation[0], lng: userLocation[1] }}
              icon={{
                url: userLocationSvg,
                scaledSize: new google.maps.Size(36, 36),
                anchor: new google.maps.Point(18, 18),
              }}
              title="Lokasi Anda"
            />
          )}

          {/* Facility Markers */}
          {filteredPharmacies.map((facility) => (
            <Marker
              key={facility.placeId}
              position={{ lat: facility.lat, lng: facility.lon }}
              icon={{
                url: getMarkerIcon(facility, selectedPharmacy?.placeId === facility.placeId),
                scaledSize: new google.maps.Size(
                  selectedPharmacy?.placeId === facility.placeId ? 46 : 34,
                  selectedPharmacy?.placeId === facility.placeId ? 54 : 42
                ),
                anchor: new google.maps.Point(
                  selectedPharmacy?.placeId === facility.placeId ? 23 : 17,
                  selectedPharmacy?.placeId === facility.placeId ? 27 : 21
                ),
              }}
              onClick={() => handleSelectFacility(facility)}
              title={facility.name}
            />
          ))}

          {/* Route Polyline (White Underlay + Blue Line) */}
          {routeInfo && routeInfo.coordinates && routeInfo.coordinates.length > 1 && (
            <>
              <Polyline
                path={routeInfo.coordinates.map((c) => ({ lat: c[0], lng: c[1] }))}
                options={{
                  strokeColor: "#FFFFFF",
                  strokeWeight: 8,
                  strokeOpacity: 0.95,
                  zIndex: 1,
                }}
              />
              <Polyline
                path={routeInfo.coordinates.map((c) => ({ lat: c[0], lng: c[1] }))}
                options={{
                  strokeColor: "#379FD2",
                  strokeWeight: 5,
                  strokeOpacity: 1,
                  zIndex: 2,
                }}
              />
            </>
          )}
        </GoogleMap>

        {/* Top Search Bar - Floating */}
        <div className="absolute top-4 left-4 right-4 z-40">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280] pointer-events-none" />
              <input
                type="text"
                placeholder="Cari rumah sakit, klinik, apotek..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-[#E5E7EB] bg-white text-sm shadow-md focus:outline-none focus:border-[#4a6fa5]"
              />
            </div>
            <button
              onClick={() => {
                setSearchInput("");
                setFacilityTypeFilter("all");
              }}
              className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] shadow-md hover:bg-slate-50 transition"
              title="Reset"
            >
              <RefreshCw className="h-4 w-4 text-[#6B7280]" />
            </button>
          </div>
        </div>

        {/* Category Filter Bubbles - Floating */}
        <div className="absolute top-16 left-4 right-4 z-40 flex gap-2 overflow-x-auto pb-2">
          {[
            { id: "all", label: "Semua", icon: Building2 },
            { id: "hospital", label: "Rumah Sakit", icon: Building2 },
            { id: "clinic", label: "Klinik", icon: Stethoscope },
            { id: "pharmacy", label: "Apotek", icon: Pill },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setFacilityTypeFilter(id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition shadow-sm ${
                facilityTypeFilter === id
                  ? "bg-[#4a6fa5] text-white"
                  : "bg-white text-[#111111] border border-[#E5E7EB]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Floating Facility Bubbles - Bottom (Scrollable) */}
        {!showDetailsPanel && filteredPharmacies.length > 0 && (
          <div className="absolute bottom-24 left-4 right-4 z-40 max-h-[120px] overflow-x-auto pb-2">
            <div className="flex gap-3 min-w-min">
              {filteredPharmacies.slice(0, 8).map((facility) => (
                <button
                  key={facility.placeId}
                  onClick={() => handleSelectFacility(facility)}
                  className="flex flex-col gap-2 p-3 rounded-xl bg-white border border-[#E5E7EB] shadow-md hover:shadow-lg hover:border-[#4a6fa5] transition flex-shrink-0 w-[150px]"
                >
                  <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-200">
                    <img
                      src={getRandomFacilityPhoto()}
                      alt={facility.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-[#111111] line-clamp-2">{facility.name}</h4>
                    <p className="text-[10px] text-[#6B7280] flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {facility.distanceKm.toFixed(2)} km
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Zoom Controls - Floating */}
        <div className="absolute bottom-24 right-4 z-40 flex flex-col gap-2">
          <button
            onClick={() => mapRef.current?.setZoom((mapRef.current?.getZoom() || 16) + 1)}
            className="p-2.5 rounded-lg bg-white border border-[#E5E7EB] shadow-md hover:bg-slate-50 transition"
            title="Perbesar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => mapRef.current?.setZoom((mapRef.current?.getZoom() || 16) - 1)}
            className="p-2.5 rounded-lg bg-white border border-[#E5E7EB] shadow-md hover:bg-slate-50 transition"
            title="Perkecil"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={() => {
              if (userLocation) {
                mapRef.current?.panTo({ lat: userLocation[0], lng: userLocation[1] });
                mapRef.current?.setZoom(16);
              }
            }}
            className="p-2.5 rounded-lg bg-[#4a6fa5] text-white border border-[#4a6fa5] shadow-md hover:bg-[#35517d] transition"
            title="Lokasi Saya"
          >
            <Crosshair className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Details Panel - Bottom Sheet */}
      {selectedPharmacy && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl border-t border-[#E5E7EB] shadow-2xl transition-transform duration-300 ${
            showDetailsPanel ? "translate-y-0" : "translate-y-[calc(100%-80px)]"
          }`}
          style={{ maxHeight: "70vh" }}
        >
          {/* Drag Handle */}
          <div
            className="flex justify-center items-center h-5 cursor-grab active:cursor-grabbing"
            onClick={() => setShowDetailsPanel(!showDetailsPanel)}
          >
            <div className="w-10 h-1 bg-[#E5E7EB] rounded-full"></div>
          </div>

          {/* Content */}
          <div className={`overflow-y-auto px-4 pb-6 ${showDetailsPanel ? "max-h-[calc(70vh-40px)]" : "hidden"}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-bold uppercase text-[#4a6fa5] block mb-1">
                  {selectedPharmacy.facilityType === "hospital" ? (
                    <>🏥 RUMAH SAKIT</>
                  ) : selectedPharmacy.facilityType === "clinic" ? (
                    <>🩺 KLINIK</>
                  ) : (
                    <>💊 APOTEK</>
                  )}
                </span>
                <h2 className="text-lg font-bold text-[#111111]">{selectedPharmacy.name}</h2>
              </div>
              <button
                onClick={() => {
                  setSelectedPharmacy(null);
                  setShowDetailsPanel(false);
                }}
                className="p-1.5 text-[#6B7280] hover:text-[#111111] hover:bg-slate-100 rounded-full transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Photo */}
            <div className="relative h-40 w-full rounded-2xl overflow-hidden mb-4 bg-slate-200">
              {finalPhotoUrl && (
                <img src={finalPhotoUrl} alt={selectedPharmacy.name} className="w-full h-full object-cover" />
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#E5E7EB]">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-[#111111]">{selectedPharmacy.rating ? Number(selectedPharmacy.rating).toFixed(1) : "4.8"}</span>
              <span className="text-xs text-[#6B7280]">
                ({selectedPharmacy.userRatingsTotal || "128"} ulasan)
              </span>
            </div>

            {/* Address */}
            <div className="mb-4">
              <p className="text-xs text-[#6B7280] font-medium mb-1">Lokasi</p>
              <p className="text-sm text-[#111111]">
                📍 {selectedPharmacy.address || `Jl. Sekitar (${selectedPharmacy.lat.toFixed(4)}, ${selectedPharmacy.lon.toFixed(4)})`}
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
