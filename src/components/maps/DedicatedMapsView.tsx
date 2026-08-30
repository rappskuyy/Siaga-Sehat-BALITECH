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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
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
import { useAuth } from "@/lib/auth/auth-context";
import { SiteHeader } from "@/components/layout/SiteHeader";

const containerStyle = {
  width: "100%",
  height: "100%",
};

interface ExtendedRouteInfo extends RouteInfo {
  directionsResult?: google.maps.DirectionsResult | null;
}

type Libraries = ("places" | "drawing" | "geometry" | "visualization")[];
const GOOGLE_MAPS_LIBRARIES: Libraries = Object.freeze(["places"]) as Libraries;

// High quality photo fallbacks
const FACILITY_PHOTOS = {
  hospital:
    "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80",
  clinic:
    "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80",
  pharmacy:
    "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&auto=format&fit=crop&q=80",
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

// SVG Marker Icons (Identical to Scanner)
const userLocationSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
  <circle cx="18" cy="18" r="16" fill="rgba(37,99,235,0.25)"/>
  <circle cx="18" cy="18" r="10" fill="#2563EB" stroke="#FFFFFF" stroke-width="3"/>
  <circle cx="18" cy="18" r="4" fill="#FFFFFF"/>
</svg>
`)}`;

// 🏥 Hospital Markers (Red)
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

// 🩺 Clinic Markers (Yellow)
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

// 💊 Pharmacy Markers (Blue)
const pharmacyPinSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42" fill="none">
  <path d="M17 0C7.611 0 0 7.611 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.611 26.389 0 17 0Z" fill="#379FD2"/>
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
 * OpenStreetMap Canvas (Light Tiles Daytime Mode)
 */
function OpenStreetMapCanvas({
  userLocation,
  pharmacies,
  selectedPharmacy,
  routeInfo,
  onSelectPharmacy,
}: {
  userLocation: [number, number] | null;
  pharmacies: PharmacyNode[];
  selectedPharmacy: PharmacyNode | null;
  routeInfo: RouteInfo | null;
  onSelectPharmacy: (p: PharmacyNode) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const routePolyline = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isSubscribed = true;

    import("leaflet").then((L) => {
      if (!isSubscribed || !mapContainerRef.current) return;

      if (!leafletInstance.current) {
        const centerPos: [number, number] = selectedPharmacy
          ? [selectedPharmacy.lat, selectedPharmacy.lon]
          : userLocation || DEFAULT_CENTER;

        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView(centerPos, 14);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        leafletInstance.current = map;
        markersLayer.current = L.layerGroup().addTo(map);
      }
    });

    return () => {
      isSubscribed = false;
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!leafletInstance.current || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      const map = leafletInstance.current;
      const group = markersLayer.current;
      if (!map || !group) return;

      group.clearLayers();

      // Render User Location
      if (userLocation) {
        const userIcon = L.divIcon({
          className: "custom-user-pin",
          html: `<div style="width:24px;height:24px;border-radius:50%;background:#2563EB;border:3px solid #FFFFFF;box-shadow:0 0 10px rgba(37,99,235,0.6);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        L.marker(userLocation, { icon: userIcon }).addTo(group);
      }

      // Render Facility Pins
      pharmacies.forEach((pharm) => {
        const isSelected = selectedPharmacy?.id === pharm.id;
        const isHospital = pharm.facilityType === "hospital";
        const isClinic = pharm.facilityType === "clinic";

        const bgCol = isHospital ? "#EF4444" : isClinic ? "#F59E0B" : "#379FD2";
        const pinSize = isSelected ? 36 : 28;
        const emoji = isHospital ? "🏥" : isClinic ? "🩺" : "💊";

        const iconHtml = `
          <div style="
            width: ${pinSize}px;
            height: ${pinSize}px;
            border-radius: 50%;
            background: ${bgCol};
            border: 2.5px solid #FFFFFF;
            box-shadow: 0 3px 10px ${bgCol}70;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? 17 : 13}px;
            transform: ${isSelected ? "scale(1.15)" : "scale(1)"};
            transition: transform 0.2s ease;
          ">
            ${emoji}
          </div>
        `;

        const facilityIcon = L.divIcon({
          className: "custom-facility-pin",
          html: iconHtml,
          iconSize: [pinSize, pinSize],
          iconAnchor: [pinSize / 2, pinSize / 2],
        });

        const m = L.marker([pharm.lat, pharm.lon], { icon: facilityIcon }).addTo(group);
        m.on("click", () => onSelectPharmacy(pharm));
      });

      // Clear previous polyline
      if (routePolyline.current) {
        map.removeLayer(routePolyline.current);
        routePolyline.current = null;
      }

      // Draw polyline if routeInfo available
      if (routeInfo && routeInfo.coordinates && routeInfo.coordinates.length > 1) {
        const polyline = L.polyline(routeInfo.coordinates, {
          color: "#379FD2",
          weight: 5,
          opacity: 0.95,
        }).addTo(map);

        routePolyline.current = polyline;
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      } else if (selectedPharmacy) {
        map.panTo([selectedPharmacy.lat, selectedPharmacy.lon]);
      }
    });
  }, [userLocation, pharmacies, selectedPharmacy, routeInfo, onSelectPharmacy]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}

/**
 * Route Polyline Renderer for Google Maps
 */
function MapRouteRenderer({
  map,
  routeInfo,
}: {
  map: google.maps.Map | null;
  routeInfo: ExtendedRouteInfo | null;
}) {
  const underlayPolylineRef = useRef<google.maps.Polyline | null>(null);
  const foregroundPolylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (underlayPolylineRef.current) {
      underlayPolylineRef.current.setMap(null);
      underlayPolylineRef.current = null;
    }
    if (foregroundPolylineRef.current) {
      foregroundPolylineRef.current.setMap(null);
      foregroundPolylineRef.current = null;
    }

    if (!map || !routeInfo || !routeInfo.coordinates || routeInfo.coordinates.length < 2) return;

    const path = routeInfo.coordinates.map((c) => ({ lat: c[0], lng: c[1] }));

    const underlay = new google.maps.Polyline({
      map: map,
      path: path,
      strokeColor: "#FFFFFF",
      strokeWeight: 8,
      strokeOpacity: 0.95,
      zIndex: 1,
    });
    underlayPolylineRef.current = underlay;

    const foreground = new google.maps.Polyline({
      map: map,
      path: path,
      strokeColor: "#379FD2",
      strokeWeight: 5,
      strokeOpacity: 1,
      zIndex: 2,
    });
    foregroundPolylineRef.current = foreground;

    if (window.google && window.google.maps && path.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      path.forEach((pt) => bounds.extend(pt));
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }

    return () => {
      if (underlayPolylineRef.current) underlayPolylineRef.current.setMap(null);
      if (foregroundPolylineRef.current) foregroundPolylineRef.current.setMap(null);
    };
  }, [map, routeInfo]);

  return null;
}

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

  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Standardized loader ID
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: googleApiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const onLoad = useCallback(
    function callback(mapInstance: google.maps.Map) {
      setMap(mapInstance);
      if (userLocation) {
        mapInstance.panTo({ lat: userLocation[0], lng: userLocation[1] });
        mapInstance.setZoom(14);
      }
    },
    [userLocation],
  );

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

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
        map || undefined,
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

    if (map) {
      map.panTo({ lat: result.lat, lng: result.lon });
      map.setZoom(14);
    }

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

      if (map) {
        map.panTo({ lat: pharmacy.lat, lng: pharmacy.lon });
        map.setZoom(15);
      }

      selectPharmacyAndRoute(pharmacy, transportMode, userLocation || undefined);
    },
    [map, transportMode, userLocation],
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

    const useOSRM = async () => {
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
      if (window.google && window.google.maps && window.google.maps.DirectionsService) {
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
              await useOSRM();
            }
          },
        );
      } else {
        await useOSRM();
      }
    } catch {
      await useOSRM();
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

  const useGoogleMapsEngine = Boolean(isLoaded && !loadError);

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

    if (
      typeof window !== "undefined" &&
      window.google &&
      window.google.maps &&
      window.google.maps.places
    ) {
      try {
        const dummyDiv = document.createElement("div");
        const service = new window.google.maps.places.PlacesService(dummyDiv);

        service.findPlaceFromQuery(
          {
            query: `${selectedPharmacy.name} ${selectedPharmacy.address || ""}`,
            fields: ["place_id", "photos", "rating", "user_ratings_total"],
          },
          (results, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
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
                  (details, dStatus) => {
                    if (dStatus === window.google.maps.places.PlacesServiceStatus.OK && details) {
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

  // Stable photo fallback
  const activePhotoUrl = useMemo(() => {
    if (!selectedPharmacy) return FACILITY_PHOTOS.hospital;
    if (selectedPharmacy.facilityType === "hospital") return FACILITY_PHOTOS.hospital;
    if (selectedPharmacy.facilityType === "clinic") return FACILITY_PHOTOS.clinic;
    return FACILITY_PHOTOS.pharmacy;
  }, [selectedPharmacy?.id, selectedPharmacy?.facilityType]);

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
    <div className="min-h-screen bg-[#F7F9FB] font-sans antialiased text-[#111111] flex flex-col justify-between pb-16 md:pb-0">
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
              <span className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-2xl bg-gradient-blue-primary text-[#FFFFFF] shadow-xs">
                <Compass className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
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
              className="h-8 sm:h-9 gap-1.5 rounded-xl text-xs bg-[#FFFFFF] border-[#E5E7EB] text-[#379FD2] hover:bg-[#ABE2FE]/20 cursor-pointer shadow-2xs font-semibold shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingLocation ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{loadingLocation ? "GPS..." : "GPS Saya"}</span>
            </Button>
          </div>

          {/* Search Input Bar (Identical to Scanner) */}
          <div className="relative" ref={searchContainerRef}>
            <form onSubmit={handleAddressSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#379FD2]" />
                <Input
                  type="text"
                  placeholder="Ketik kota/alamat (misal: Bogor, Jakarta, Surabaya)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="pl-10 h-10 sm:h-11 text-xs sm:text-sm rounded-2xl bg-[#F7F9FB] border-[#E5E7EB] text-[#111111] focus-visible:border-[#5BB4E0] focus-visible:ring-1 focus-visible:ring-[#5BB4E0]"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="h-10 sm:h-11 px-4 sm:px-5 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-blue-primary text-[#FFFFFF] hover:opacity-95 shadow-xs cursor-pointer shrink-0"
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
                  className="w-full text-left p-2.5 bg-blue-50/80 hover:bg-blue-100/80 rounded-xl flex items-center justify-between gap-2.5 border border-blue-200/60 cursor-pointer mb-1 text-[#379FD2] font-semibold transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#379FD2] text-white shrink-0 shadow-xs">
                      <Crosshair className="h-4 w-4 animate-pulse" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[#111111] font-bold text-xs">Lokasi Saya Saat Ini</span>
                      <span className="text-[10px] text-[#6B7280]">
                        Deteksi GPS presisi lokasi Anda
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-[#379FD2] text-white px-2 py-0.5 rounded-full shrink-0 font-bold">
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
                      <MapPin className="h-4 w-4 shrink-0 text-[#379FD2] mt-0.5" />
                      <span className="text-[#111111] line-clamp-2 leading-relaxed">
                        {res.displayname}
                      </span>
                    </button>
                  ))
                ) : searchQuery.trim().length > 0 && !isSearching ? (
                  <div className="p-2.5 text-center text-[#6B7280] text-xs">
                    Tekan <strong className="text-[#379FD2]">Cari</strong> untuk mencari &quot;
                    {searchQuery}&quot;
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Active Position Info & Source Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-0.5">
            <div className="flex items-center gap-1.5 font-medium text-[11px] sm:text-xs text-[#6B7280] bg-[#FFFFFF] px-3 py-1.5 rounded-xl border border-[#E5E7EB] truncate">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#379FD2] shrink-0" />
              <span className="truncate">
                Posisi: <strong className="text-[#111111]">{locationSource}</strong>
              </span>
            </div>

            <SourceSummaryBar sources={sourceStats} />
          </div>

          {/* Mobile View Toggle Bar (Responsive Segment Switcher) */}
          <div className="flex lg:hidden items-center p-1 bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-2xs">
            <button
              type="button"
              onClick={() => setMobileTab("map")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                mobileTab === "map"
                  ? "bg-[#379FD2] text-white shadow-xs"
                  : "text-[#6B7280] hover:text-[#379FD2]"
              }`}
            >
              <Compass className="h-4 w-4" />
              Peta Navigasi
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("list")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                mobileTab === "list"
                  ? "bg-[#379FD2] text-white shadow-xs"
                  : "text-[#6B7280] hover:text-[#379FD2]"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Daftar ({pharmacies.length})
            </button>
            {selectedPharmacy && (
              <button
                type="button"
                onClick={() => setMobileTab("detail")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  mobileTab === "detail"
                    ? "bg-[#F59E0B] text-white shadow-xs"
                    : "text-[#6B7280] hover:text-[#F59E0B]"
                }`}
              >
                <Info className="h-4 w-4" />
                Detail
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
              {useGoogleMapsEngine ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={mapCenter}
                  zoom={14}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                  options={{
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    zoomControl: false,
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
                    />
                  )}

                  {/* Facility Markers */}
                  {pharmacies.map((pharm) => {
                    const isSelected = selectedPharmacy?.id === pharm.id;
                    const isHospital = pharm.facilityType === "hospital";
                    const isClinic = pharm.facilityType === "clinic";

                    const pinUrl = isHospital
                      ? isSelected
                        ? hospitalActivePinSvg
                        : hospitalPinSvg
                      : isClinic
                        ? isSelected
                          ? clinicActivePinSvg
                          : clinicPinSvg
                        : isSelected
                          ? pharmacyActivePinSvg
                          : pharmacyPinSvg;

                    return (
                      <Marker
                        key={pharm.id}
                        position={{ lat: pharm.lat, lng: pharm.lon }}
                        onClick={() => handleSelectPharmacy(pharm)}
                        icon={{
                          url: pinUrl,
                          scaledSize: isSelected
                            ? new google.maps.Size(46, 54)
                            : new google.maps.Size(34, 42),
                          anchor: isSelected
                            ? new google.maps.Point(23, 48)
                            : new google.maps.Point(17, 42),
                        }}
                      />
                    );
                  })}

                  <MapRouteRenderer map={map} routeInfo={routeInfo} />
                </GoogleMap>
              ) : (
                <OpenStreetMapCanvas
                  userLocation={userLocation}
                  pharmacies={pharmacies}
                  selectedPharmacy={selectedPharmacy}
                  routeInfo={routeInfo}
                  onSelectPharmacy={handleSelectPharmacy}
                />
              )}

              {/* Map Controls */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 shadow-md">
                <button
                  type="button"
                  onClick={() => map?.setZoom((map.getZoom() || 14) + 1)}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-[#FFFFFF] text-[#379FD2] hover:bg-[#ABE2FE]/20 border border-[#E5E7EB] transition cursor-pointer shadow-xs"
                  title="Perbesar"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => map?.setZoom((map.getZoom() || 14) - 1)}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-[#FFFFFF] text-[#379FD2] hover:bg-[#ABE2FE]/20 border border-[#E5E7EB] transition cursor-pointer shadow-xs"
                  title="Perkecil"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (userLocation && map) {
                      map.panTo({ lat: userLocation[0], lng: userLocation[1] });
                      map.setZoom(15);
                    }
                  }}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-[#FFFFFF] text-[#379FD2] hover:bg-[#ABE2FE]/20 border border-[#E5E7EB] transition cursor-pointer shadow-xs"
                  title="Posisi Saya"
                >
                  <Crosshair className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Column 3 (Right Side Dedicated Detail Panel - Outside the Map!) */}
          {selectedPharmacy && (
            <div
              className={`w-full lg:w-[380px] xl:w-[420px] shrink-0 h-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-3xl p-4 sm:p-5 shadow-lg flex-col overflow-y-auto animate-fade-in scrollbar-thin scrollbar-thumb-[#379FD2]/20 ${
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
                        : "bg-[#379FD2] text-white border-blue-600"
                  }`}
                >
                  {selectedPharmacy.facilityType === "hospital" ? (
                    <>🏥 RUMAH SAKIT</>
                  ) : selectedPharmacy.facilityType === "clinic" ? (
                    <>🩺 KLINIK</>
                  ) : (
                    <>💊 APOTEK</>
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
                  src={finalPhotoUrl}
                  alt={selectedPharmacy.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Title & Address */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-[#111111] leading-snug">
                  {selectedPharmacy.name}
                </h3>
                <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                  📍{" "}
                  {selectedPharmacy.address ||
                    `Jl. Sekitar (${selectedPharmacy.lat.toFixed(4)}, ${selectedPharmacy.lon.toFixed(4)})`}
                </p>
              </div>

              {/* Operational Hours & Phone Contact */}
              <div className="mt-1 pt-3 border-t border-[#E5E7EB] flex flex-col gap-1.5 text-xs mb-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#379FD2] font-semibold">
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
                  <div className="text-[11px] text-[#6B7280] font-medium">
                    📞 Telepon: <strong className="text-[#111111]">{selectedPharmacy.phone}</strong>
                  </div>
                )}
              </div>

              {/* Review Comment Snippet */}
              <div className="mb-3.5 p-3 bg-cyan-50/60 border border-cyan-200/80 rounded-2xl text-xs text-[#2781AF] flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-[#379FD2] shrink-0 mt-0.5" />
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
                        ? "bg-[#379FD2] text-white shadow-xs"
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
                        ? "bg-[#379FD2] text-white shadow-xs"
                        : "bg-white text-[#6B7280] border border-[#E5E7EB]"
                    }`}
                  >
                    <Bike className="h-3.5 w-3.5" /> Motor
                  </button>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-[#379FD2] text-sm sm:text-base">
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
      </main>

      {/* ========================================================================= */}
      {/* 03. MOBILE BOTTOM NAVIGATION BAR                                          */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] py-2 px-4 flex lg:hidden items-center justify-around shadow-lg">
        <Link
          to="/"
          className="flex flex-col items-center gap-0.5 text-[#6B7280] hover:text-[#379FD2] transition"
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Beranda</span>
        </Link>

        <Link
          to="/maps"
          className="flex flex-col items-center gap-0.5 text-[#379FD2] font-bold transition"
        >
          <Compass className="h-5 w-5" />
          <span className="text-[10px] font-extrabold">Peta</span>
        </Link>

        <Link
          to="/scanner"
          className="flex flex-col items-center gap-0.5 text-[#6B7280] hover:text-[#379FD2] transition"
        >
          <ScanLine className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Scan AI</span>
        </Link>

        <Link
          to="/anatomy"
          className="flex flex-col items-center gap-0.5 text-[#6B7280] hover:text-[#379FD2] transition"
        >
          <Stethoscope className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Anatomi</span>
        </Link>

        <Link
          to="/profile"
          className="flex flex-col items-center gap-0.5 text-[#6B7280] hover:text-[#379FD2] transition"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Profil</span>
        </Link>
      </div>
    </div>
  );
}
