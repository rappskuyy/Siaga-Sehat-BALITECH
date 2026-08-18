import {
  searchPharmaciesWithAI,
  searchPharmaciesViaGooglePlaces,
  searchFacilitiesViaOSMServer,
  haversineDistance,
  detectFacilityType,
} from "@/lib/maps/pharmacy.server";
import { parseOpeningHours, type OperatingHours } from "@/lib/maps/parseOpeningHours";
import {
  getCachedPharmacies,
  savePharmaciesToCache,
} from "@/lib/maps/offlinePharmacyHandler";

export { haversineDistance, detectFacilityType };

export const DEFAULT_CENTER: [number, number] = [-6.2088, 106.8456]; // Jakarta Pusat

export type TransportMode = "driving" | "motorcycle";
export type FacilityType = "pharmacy" | "hospital" | "clinic";
export type DangerLevelType = "rendah" | "sedang" | "tinggi";

export type PlaceType = "pharmacy" | "hospital";

export interface PlaceNode {
  id: number | string;
  placeId?: string;
  placeType?: PlaceType;
  lat: number;
  lon: number;
  name: string;
  address?: string;
  distanceKm: number;
  rating?: number;
  userRatingsTotal?: number;
  openingHoursText?: string;
  isOpenNow?: boolean;
  openingStatus?: "open" | "closed" | "closing-soon";
  hoursUntilClose?: number;
  operatingHours?: OperatingHours;
  phone?: string;
  whatsappNumber?: string;
  facilityType?: FacilityType;
  _dataSource?: "google" | "osm" | "gemini" | "cache" | "unknown";
  _dataSourceLabel?: string;
  _trustScore?: number;
  _cacheAge?: string;
}

export type PharmacyNode = PlaceNode;

export interface RouteInfo {
  coordinates: [number, number][];
  distanceKm: number;
  durationMin: number;
  mode?: TransportMode;
}

export interface GeocodeResult {
  displayname: string;
  lat: number;
  lon: number;
}

export async function searchLocationByAddress(query: string): Promise<GeocodeResult[]> {
  if (!query || query.trim().length < 2) return [];

  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  // 1. Coba Google Maps Geocoder jika API Key tersedia
  if (
    googleApiKey &&
    typeof window !== "undefined" &&
    window.google &&
    window.google.maps &&
    window.google.maps.Geocoder
  ) {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await new Promise<google.maps.GeocoderResult[]>((resolve) => {
        geocoder.geocode(
          { address: query, componentRestrictions: { country: "ID" } },
          (results, status) => {
            if (status === "OK" && results) {
              resolve(results);
            } else {
              resolve([]);
            }
          }
        );
      });

      if (response && response.length > 0) {
        return response.map((item) => ({
          displayname: item.formatted_address,
          lat: item.geometry.location.lat(),
          lon: item.geometry.location.lng(),
        }));
      }
    } catch {
      // fallback to OSM Nominatim
    }
  }

  // 2. OpenStreetMap Nominatim Geocoding API
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=id`;
    const res = await fetch(url, {
      headers: {
        "Accept-Language": "id,en",
        "User-Agent": "SiagaSehatApp/1.0",
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: any) => ({
      displayname: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));
  } catch (err) {
    console.warn("Geocoding search error:", err);
    return [];
  }
}

export async function fetchIPLocation(): Promise<[number, number] | null> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return [data.latitude, data.longitude];
      }
    }
  } catch (e) {
    console.warn("IP Geolocation fallback error:", e);
  }
  return null;
}

export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, {
      headers: {
        "Accept-Language": "id,en",
        "User-Agent": "SiagaSehatApp/1.0",
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.display_name) {
        const nameParts = data.display_name.split(",");
        return nameParts.slice(0, 3).join(", ").trim();
      }
    }
  } catch {
    // silently fallback
  }
  return null;
}

/**
 * Modern Real Data Pipeline for Nearby Facilities:
 * 1. OpenStreetMap Server Function (Zero CORS, Multi-Endpoint, Fast Server Cache)
 * 2. Local Storage Offline Cache (< 6 hours old)
 * 3. Google Places API (If API key provided)
 * 4. Gemini AI Search (Supplemental Fallback)
 * 5. Clean Empty State (NO DUMMY DATA)
 */
export async function fetchNearbyPharmacies(
  lat: number,
  lon: number,
  mapInstance?: google.maps.Map,
  address?: string,
  dangerLevel: DangerLevelType = "rendah"
): Promise<PharmacyNode[]> {
  console.log(`[MAPS PIPELINE] Initiating real facility search for [${lat}, ${lon}] (${address || "Tanpa Alamat"}) - Triage: ${dangerLevel}`);

  // 1. PRIMARY: OpenStreetMap Server Function (Server-side Overpass & Nominatim with 0 CORS)
  try {
    const osmResults = await searchFacilitiesViaOSMServer({
      data: { lat, lon, dangerLevel },
    });
    if (osmResults && osmResults.length > 0) {
      savePharmaciesToCache(lat, lon, osmResults, address);
      return osmResults;
    }
  } catch (osmErr) {
    console.warn("[MAPS PIPELINE] OSM Server error, falling back to cache:", osmErr);
  }

  // 2. Local Storage Offline Cache
  const cachedPharmacies = getCachedPharmacies(lat, lon);
  if (cachedPharmacies && cachedPharmacies.length > 0) {
    return cachedPharmacies;
  }

  // 3. TERTIARY: Google Places API (if API key available)
  try {
    const googlePlacesResults = await searchPharmaciesViaGooglePlaces({
      data: { lat, lon, radius: 5000, address },
    });
    if (googlePlacesResults && googlePlacesResults.length > 0) {
      savePharmaciesToCache(lat, lon, googlePlacesResults, address);
      return googlePlacesResults;
    }
  } catch {
    // skip
  }

  // 4. Gemini AI Search (Supplemental Fallback)
  try {
    const aiResults = await searchPharmaciesWithAI({ data: { lat, lon, address } });
    if (aiResults && aiResults.length > 0) {
      savePharmaciesToCache(lat, lon, aiResults, address);
      return aiResults;
    }
  } catch {
    // skip
  }

  // 5. Clean Empty State (NO DUMMY DATA)
  return [];
}

export const fetchNearbyPlaces = fetchNearbyPharmacies;

export async function fetchOSRMRoute(
  start: [number, number],
  end: PlaceNode,
  mode: TransportMode = "driving"
): Promise<RouteInfo> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end.lon},${end.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("OSRM request failed");
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coords: [number, number][] = route.geometry.coordinates.map(
        (c: [number, number]) => [c[1], c[0]],
      );

      const fullCoords: [number, number][] = [start, ...coords, [end.lat, end.lon]];

      let durationMin = Math.ceil(route.duration / 60);
      if (mode === "motorcycle") {
        durationMin = Math.max(1, Math.ceil(durationMin * 0.75));
      }

      return {
        coordinates: fullCoords,
        distanceKm: Number((route.distance / 1000).toFixed(2)),
        durationMin: durationMin,
        mode: mode,
      };
    }
  } catch {
    // fallback straight line
  }

  const baseDuration = Math.ceil(end.distanceKm * 4);
  const durationMin = mode === "motorcycle" ? Math.max(1, Math.ceil(baseDuration * 0.75)) : baseDuration;

  return {
    coordinates: [start, [end.lat, end.lon]],
    distanceKm: end.distanceKm,
    durationMin: durationMin,
    mode: mode,
  };
}
