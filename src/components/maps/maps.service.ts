import {
  searchPharmaciesWithAI,
  searchPharmaciesViaGooglePlaces,
  haversineDistance,
} from "@/lib/maps/pharmacy.server";
import { parseOpeningHours, type OperatingHours } from "@/lib/maps/parseOpeningHours";
import {
  getCachedPharmacies,
  savePharmaciesToCache,
} from "@/lib/maps/offlinePharmacyHandler";

export const DEFAULT_CENTER: [number, number] = [-6.2088, 106.8456]; // Jakarta Pusat

export type TransportMode = "driving" | "motorcycle";
export type FacilityType = "pharmacy" | "hospital" | "clinic";
export type DangerLevelType = "rendah" | "sedang" | "tinggi";

export interface PharmacyNode {
  id: number | string;
  placeId?: string;
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

export function detectFacilityType(name: string, typeTag = ""): FacilityType {
  const lower = (name + " " + typeTag).toLowerCase();
  if (
    lower.includes("rumah sakit") ||
    lower.includes("rsud") ||
    lower.includes("rs ") ||
    lower.includes("rs.") ||
    lower.includes("hospital") ||
    lower.includes("igd") ||
    lower.includes("siloam") ||
    lower.includes("hermina") ||
    lower.includes("mayapada") ||
    lower.includes("mitra keluarga") ||
    lower.includes("advent") ||
    lower.includes("bhayangkara")
  ) {
    return "hospital";
  }
  if (
    lower.includes("klinik") ||
    lower.includes("clinic") ||
    lower.includes("puskesmas") ||
    lower.includes("praktek dokter") ||
    lower.includes("balai pengobatan")
  ) {
    return "clinic";
  }
  return "pharmacy";
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
  } catch (err) {
    console.warn("Reverse geocode error:", err);
  }
  return null;
}

/**
 * OpenStreetMap Nominatim POI Bounded Search (Primary Real-Time Data Source)
 */
export async function fetchNominatimPharmacies(
  lat: number,
  lon: number,
  dangerLevel: DangerLevelType = "rendah"
): Promise<PharmacyNode[]> {
  console.log(`[OSM NOMINATIM] Fetching real facilities for coords: [${lat}, ${lon}] (Triage: ${dangerLevel})`);

  let QUERIES = ["apotek", "pharmacy", "kimia farma", "k-24", "guardian", "century"];
  if (dangerLevel === "tinggi") {
    QUERIES = ["rumah sakit", "rsud", "hospital", "igd", "puskesmas", "klinik", "apotek 24 jam", "k-24"];
  } else if (dangerLevel === "sedang") {
    QUERIES = ["apotek", "klinik", "puskesmas", "rumah sakit", "k-24", "kimia farma"];
  }

  const DELTA_STEPS = [0.05, 0.12, 0.22];
  const allResults: PharmacyNode[] = [];

  for (const delta of DELTA_STEPS) {
    const viewbox = `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`;

    for (const q of QUERIES) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&viewbox=${viewbox}&bounded=1&limit=10&countrycodes=id`;
        const res = await fetch(url, {
          headers: {
            "Accept-Language": "id,en",
            "User-Agent": "SiagaSehatApp/1.0",
          },
        });

        if (!res.ok) continue;

        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) continue;

        const nodes: PharmacyNode[] = data
          .map((item: any, index: number): PharmacyNode | null => {
            const pLat = parseFloat(item.lat);
            const pLon = parseFloat(item.lon);
            if (isNaN(pLat) || isNaN(pLon)) return null;

            const distanceKm = haversineDistance([lat, lon], [pLat, pLon]);
            if (distanceKm > 40) return null;

            const nameParts = (item.display_name || "").split(",");
            const rawCleanName = item.name || nameParts[0] || `Fasilitas Kesehatan ${index + 1}`;
            const address = nameParts.slice(1, 4).join(", ").trim() || item.display_name;
            const facilityType = detectFacilityType(rawCleanName, item.type || "");

            return {
              id: `nom-${item.place_id || index}`,
              lat: pLat,
              lon: pLon,
              name: rawCleanName,
              address: address,
              distanceKm: Number(distanceKm.toFixed(2)),
              isOpenNow: true,
              openingStatus: "open",
              openingHoursText: facilityType === "hospital" ? "Buka 24 Jam (IGD)" : "Buka",
              facilityType,
              _dataSource: "osm",
              _dataSourceLabel: facilityType === "hospital" ? "Rumah Sakit (Real OSM)" : "Apotek (Real OSM)",
              _trustScore: 8,
            };
          })
          .filter((p): p is PharmacyNode => p !== null);

        for (const n of nodes) {
          const isDuplicate = allResults.some(
            (u) => haversineDistance([u.lat, u.lon], [n.lat, n.lon]) < 0.05 || u.name.toLowerCase() === n.name.toLowerCase()
          );
          if (!isDuplicate) {
            allResults.push(n);
          }
        }

        if (allResults.length >= 8) {
          break;
        }
      } catch {
        // continue
      }
    }

    if (allResults.length >= 6) {
      break;
    }
  }

  if (allResults.length > 0) {
    // Sort according to priority:
    // If high danger: prioritize hospitals & clinics first, then pharmacies
    if (dangerLevel === "tinggi") {
      allResults.sort((a, b) => {
        const aScore = a.facilityType === "hospital" ? 0 : a.facilityType === "clinic" ? 1 : 2;
        const bScore = b.facilityType === "hospital" ? 0 : b.facilityType === "clinic" ? 1 : 2;
        if (aScore !== bScore) return aScore - bScore;
        return a.distanceKm - b.distanceKm;
      });
    } else {
      allResults.sort((a, b) => a.distanceKm - b.distanceKm);
    }
    return allResults.slice(0, 12);
  }

  return [];
}

/**
 * OpenStreetMap Overpass API (Secondary Geospatial Query)
 */
export async function fetchOverpassPharmacies(
  lat: number,
  lon: number,
  dangerLevel: DangerLevelType = "rendah"
): Promise<PharmacyNode[]> {
  const amenityFilter =
    dangerLevel === "tinggi"
      ? 'node["amenity"="hospital"](around:8000,${lat},${lon});node["amenity"="clinic"](around:8000,${lat},${lon});node["amenity"="pharmacy"](around:8000,${lat},${lon});'
      : dangerLevel === "sedang"
      ? 'node["amenity"="pharmacy"](around:6000,${lat},${lon});node["amenity"="clinic"](around:6000,${lat},${lon});node["amenity"="hospital"](around:6000,${lat},${lon});'
      : 'node["amenity"="pharmacy"](around:5000,${lat},${lon});node["healthcare"="pharmacy"](around:5000,${lat},${lon});';

  const query = `[out:json][timeout:6];(${amenityFilter.replace(/\$\{lat\}/g, String(lat)).replace(/\$\{lon\}/g, String(lon))});out center 15;`;
  const endpoint = "https://overpass-api.de/api/interpreter";

  try {
    const res = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.elements || data.elements.length === 0) return [];

    const pharmacies: PharmacyNode[] = data.elements
      .map((el: any, index: number) => {
        const pLat = el.lat || el.center?.lat;
        const pLon = el.lon || el.center?.lon;
        if (!pLat || !pLon) return null;

        const distanceKm = haversineDistance([lat, lon], [pLat, pLon]);
        const tags = el.tags || {};
        const rawName = tags.name || tags["name:id"] || tags.brand || tags.operator;
        const name = rawName ? rawName : `Fasilitas Kesehatan ${index + 1}`;

        const street = tags["addr:street"] || tags["addr:full"] || "";
        const suburb = tags["addr:subdistrict"] || tags["addr:city"] || "";
        const address = [street, suburb].filter(Boolean).join(", ") || `Jl. Sekitar (${pLat.toFixed(4)}, ${pLon.toFixed(4)})`;

        const parsedHours = parseOpeningHours(undefined, tags.opening_hours);
        const facilityType = detectFacilityType(name, tags.amenity || tags.healthcare || "");

        return {
          id: `osm-${el.id || index}`,
          lat: pLat,
          lon: pLon,
          name: name,
          address: address,
          distanceKm: Number(distanceKm.toFixed(2)),
          rating: tags.stars ? parseFloat(tags.stars) : undefined,
          isOpenNow: parsedHours.isOpenNow,
          openingStatus: parsedHours.openingStatus,
          openingHoursText: facilityType === "hospital" ? "Buka 24 Jam (IGD)" : parsedHours.openingHoursText,
          hoursUntilClose: parsedHours.hoursUntilClose,
          operatingHours: parsedHours.operatingHours,
          phone: tags.phone || tags["contact:phone"],
          facilityType,
          _dataSource: "osm" as const,
          _dataSourceLabel: facilityType === "hospital" ? "Rumah Sakit (Overpass)" : "Apotek (Overpass)",
          _trustScore: 8,
        };
      })
      .filter((p: PharmacyNode | null): p is PharmacyNode => p !== null);

    pharmacies.sort((a, b) => a.distanceKm - b.distanceKm);
    return pharmacies.slice(0, 10);
  } catch {
    return [];
  }
}

/**
 * Modern Real Data Pipeline for Nearby Facilities:
 * Adapts search based on illness danger level (Apotek vs Rumah Sakit & Klinik)
 */
export async function fetchNearbyPharmacies(
  lat: number,
  lon: number,
  mapInstance?: google.maps.Map,
  address?: string,
  dangerLevel: DangerLevelType = "rendah"
): Promise<PharmacyNode[]> {
  console.log(`[MAPS PIPELINE] Initiating real facility search for [${lat}, ${lon}] (${address || "Tanpa Alamat"}) - Triage: ${dangerLevel}`);

  // 1. PRIMARY: OpenStreetMap Nominatim POI Search (Instant Real Data)
  try {
    const nominatimResults = await fetchNominatimPharmacies(lat, lon, dangerLevel);
    if (nominatimResults && nominatimResults.length > 0) {
      savePharmaciesToCache(lat, lon, nominatimResults, address);
      return nominatimResults;
    }
  } catch (nomErr) {
    console.warn("[MAPS PIPELINE] Nominatim error:", nomErr);
  }

  // 2. SECONDARY: OpenStreetMap Overpass API
  try {
    const overpassResults = await fetchOverpassPharmacies(lat, lon, dangerLevel);
    if (overpassResults && overpassResults.length > 0) {
      savePharmaciesToCache(lat, lon, overpassResults, address);
      return overpassResults;
    }
  } catch (osmErr) {
    console.warn("[MAPS PIPELINE] Overpass error:", osmErr);
  }

  // 3. Local Storage Offline Cache
  const cachedPharmacies = getCachedPharmacies(lat, lon);
  if (cachedPharmacies && cachedPharmacies.length > 0) {
    return cachedPharmacies;
  }

  // 4. TERTIARY: Google Places API (if API key available)
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

  // 5. Gemini AI Search (Supplemental Fallback)
  try {
    const aiResults = await searchPharmaciesWithAI({ data: { lat, lon, address } });
    if (aiResults && aiResults.length > 0) {
      savePharmaciesToCache(lat, lon, aiResults, address);
      return aiResults;
    }
  } catch {
    // skip
  }

  // 6. Clean Empty State (NO DUMMY DATA)
  return [];
}

export async function fetchOSRMRoute(
  start: [number, number],
  end: PharmacyNode,
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
