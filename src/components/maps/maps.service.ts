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

export async function searchLocationByAddress(query: string): Promise<GeocodeResult[]> {
  if (!query || query.trim().length < 2) return [];

  // 1. Coba Google Maps Geocoder jika API sudah termuat di client
  if (
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
      // Fallback to Nominatim
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
): Promise<PharmacyNode[]> {
  console.log(`[OSM NOMINATIM] Fetching real pharmacies for coords: [${lat}, ${lon}]`);
  const QUERIES = ["apotek", "pharmacy", "kimia farma", "k-24", "guardian", "century"];
  const DELTA_STEPS = [0.04, 0.1, 0.2];

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

        const pharmacies: PharmacyNode[] = data
          .map((item: any, index: number): PharmacyNode | null => {
            const pLat = parseFloat(item.lat);
            const pLon = parseFloat(item.lon);
            if (isNaN(pLat) || isNaN(pLon)) return null;

            const distanceKm = haversineDistance([lat, lon], [pLat, pLon]);
            if (distanceKm > 35) return null;

            const nameParts = (item.display_name || "").split(",");
            const rawCleanName = item.name || nameParts[0] || `Apotek ${index + 1}`;
            const address = nameParts.slice(1, 4).join(", ").trim() || item.display_name;

            return {
              id: `nom-${item.place_id || index}`,
              lat: pLat,
              lon: pLon,
              name: rawCleanName,
              address: address,
              distanceKm: Number(distanceKm.toFixed(2)),
              isOpenNow: true,
              openingStatus: "open",
              openingHoursText: "Buka",
              _dataSource: "osm",
              _dataSourceLabel: "OpenStreetMap (Real API)",
              _trustScore: 8,
            };
          })
          .filter((p): p is PharmacyNode => p !== null);

        if (pharmacies.length > 0) {
          pharmacies.sort((a, b) => a.distanceKm - b.distanceKm);
          console.log(`[OSM NOMINATIM] Successfully returned ${pharmacies.length} real pharmacies from OpenStreetMap.`);
          return pharmacies.slice(0, 10);
        }
      } catch {
        // continue to next query
      }
    }
  }

  return [];
}

/**
 * OpenStreetMap Overpass API (Secondary Geospatial Query)
 */
export async function fetchOverpassPharmacies(
  lat: number,
  lon: number,
): Promise<PharmacyNode[]> {
  const query = `[out:json][timeout:6];(node["amenity"="pharmacy"](around:5000,${lat},${lon});node["healthcare"="pharmacy"](around:5000,${lat},${lon});node["name"~"Apotek|Kimia Farma|K-24|Guardian|Century",i](around:5000,${lat},${lon}););out center 15;`;
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
        const name = rawName ? rawName : `Apotek Terdekat ${index + 1}`;

        const street = tags["addr:street"] || tags["addr:full"] || "";
        const suburb = tags["addr:subdistrict"] || tags["addr:city"] || "";
        const address = [street, suburb].filter(Boolean).join(", ") || `Jl. Sekitar (${pLat.toFixed(4)}, ${pLon.toFixed(4)})`;

        const parsedHours = parseOpeningHours(undefined, tags.opening_hours);

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
          openingHoursText: parsedHours.openingHoursText,
          hoursUntilClose: parsedHours.hoursUntilClose,
          operatingHours: parsedHours.operatingHours,
          phone: tags.phone || tags["contact:phone"],
          _dataSource: "osm" as const,
          _dataSourceLabel: "OpenStreetMap (Overpass)",
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
 * Modern Real Data Pipeline for Nearby Pharmacies:
 * 1. OpenStreetMap Nominatim POI Search (PRIMARY REAL DATA - Fast & Reliable)
 * 2. OpenStreetMap Overpass API (SECONDARY REAL DATA)
 * 3. Local Storage Offline Cache (< 6 hours old)
 * 4. Google Places API (If API key provided)
 * 5. Gemini AI Search (Supplemental Fallback)
 * 6. Clean Empty State (NO DUMMY DATA)
 */
export async function fetchNearbyPharmacies(
  lat: number,
  lon: number,
  mapInstance?: google.maps.Map,
  address?: string,
): Promise<PharmacyNode[]> {
  console.log(`[MAPS PIPELINE] Initiating real pharmacy search for [${lat}, ${lon}] (${address || "Tanpa Alamat"})`);

  // 1. PRIMARY: OpenStreetMap Nominatim POI Search (Instant Real Data in Indonesia)
  try {
    const nominatimResults = await fetchNominatimPharmacies(lat, lon);
    if (nominatimResults && nominatimResults.length > 0) {
      savePharmaciesToCache(lat, lon, nominatimResults, address);
      return nominatimResults;
    }
  } catch (nomErr) {
    console.warn("[MAPS PIPELINE] Nominatim error:", nomErr);
  }

  // 2. SECONDARY: OpenStreetMap Overpass API
  try {
    const overpassResults = await fetchOverpassPharmacies(lat, lon);
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

  // 4. TERTIARY: Google Places API (jika API key terpasang di .env)
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

  // 6. NO DUMMY DATA
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
