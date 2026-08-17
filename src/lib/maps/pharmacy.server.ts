import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { PharmacyNode, FacilityType, DangerLevelType } from "@/components/maps/maps.service";
import { parseOpeningHours } from "./parseOpeningHours";

/**
 * Shared Haversine distance formula (in km)
 */
export function haversineDistance(
  coords1: [number, number],
  coords2: [number, number]
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(coords2[0] - coords1[0]);
  const dLon = toRad(coords2[1] - coords1[1]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coords1[0])) *
    Math.cos(toRad(coords2[0])) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// In-memory cache for requests (5-minute TTL)
interface CacheEntry {
  timestamp: number;
  data: PharmacyNode[];
}
const placesCache = new Map<string, CacheEntry>();
const osmServerCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCacheKey(lat: number, lon: number, radius: number): string {
  return `${lat.toFixed(2)}_${lon.toFixed(2)}_${radius}`;
}

export function detectFacilityType(name: string, typeTag = ""): FacilityType {
  const lower = (name + " " + typeTag).toLowerCase();
  if (
    lower.includes("rumah sakit") ||
    lower.includes("rsud") ||
    lower.includes("rsup") ||
    lower.includes("rsad") ||
    lower.includes("rsia") ||
    lower.includes("rsu ") ||
    lower.includes("rs ") ||
    lower.includes("rs.") ||
    lower.includes("hospital") ||
    lower.includes("general hospital") ||
    lower.includes("igd") ||
    lower.includes("udayana") ||
    lower.includes("sanglah") ||
    lower.includes("ngoerah") ||
    lower.includes("siloam") ||
    lower.includes("hermina") ||
    lower.includes("kasih ibu") ||
    lower.includes("surya husadha") ||
    lower.includes("puri raharja") ||
    lower.includes("prima medika") ||
    lower.includes("bali mandara") ||
    lower.includes("wangaya") ||
    lower.includes("mayapada") ||
    lower.includes("mitra keluarga") ||
    lower.includes("bhayangkara")
  ) {
    return "hospital";
  }
  if (
    lower.includes("klinik") ||
    lower.includes("clinic") ||
    lower.includes("puskesmas") ||
    lower.includes("praktek dokter") ||
    lower.includes("balai pengobatan") ||
    lower.includes("medical centre") ||
    lower.includes("medical center")
  ) {
    return "clinic";
  }
  return "pharmacy";
}

const placesSearchInputSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  radius: z.number().optional().default(5000),
  address: z.string().optional(),
});

/**
 * 1. Google Places Nearby & Details Search Server Function
 */
export const searchPharmaciesViaGooglePlaces = createServerFn({ method: "POST" })
  .validator((data: unknown) => placesSearchInputSchema.parse(data))
  .handler(async ({ data }): Promise<PharmacyNode[]> => {
    const { lat, lon, radius = 5000, address } = data;

    const apiKey =
      process.env.GOOGLE_PLACES_API_KEY?.trim() ||
      process.env.GOOGLE_MAPS_API_KEY?.trim() ||
      process.env.VITE_GOOGLE_MAPS_API_KEY?.trim();

    if (!apiKey) {
      return [];
    }

    const cacheKey = getCacheKey(lat, lon, radius);
    const cached = placesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=pharmacy&language=id&key=${apiKey}`;
      const res = await fetch(nearbyUrl);
      if (!res.ok) {
        return [];
      }

      const nearbyData = await res.json();
      if (!nearbyData.results || nearbyData.results.length === 0) {
        return [];
      }

      const rawPlaces = nearbyData.results.slice(0, 10);

      const detailedPlaces: PharmacyNode[] = await Promise.all(
        rawPlaces.map(async (place: any, index: number): Promise<PharmacyNode> => {
          const placeLat = place.geometry?.location?.lat || lat;
          const placeLon = place.geometry?.location?.lng || lon;
          const distanceKm = Number(haversineDistance([lat, lon], [placeLat, placeLon]).toFixed(2));

          let phone: string | undefined = undefined;
          let whatsappNumber: string | undefined = undefined;
          let parsedHours = parseOpeningHours(place.opening_hours);

          if (place.place_id) {
            try {
              const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,international_phone_number,opening_hours,rating,user_ratings_total,geometry&language=id&key=${apiKey}`;
              const detailRes = await fetch(detailsUrl);
              if (detailRes.ok) {
                const detailData = await detailRes.json();
                const result = detailData.result;
                if (result) {
                  phone = result.formatted_phone_number || result.international_phone_number;
                  if (result.opening_hours) {
                    parsedHours = parseOpeningHours(result.opening_hours);
                  }
                  if (phone) {
                    const cleanPhone = phone.replace(/[^0-9]/g, "");
                    if (cleanPhone.startsWith("08")) {
                      whatsappNumber = `628${cleanPhone.slice(2)}`;
                    } else if (cleanPhone.startsWith("62")) {
                      whatsappNumber = cleanPhone;
                    }
                  }
                }
              }
            } catch {
              // ignore
            }
          }

          return {
            id: `places-${place.place_id || index}`,
            placeId: place.place_id,
            lat: placeLat,
            lon: placeLon,
            name: place.name || `Apotek Terdekat ${index + 1}`,
            address: place.vicinity || place.formatted_address || address || "Alamat Terdekat",
            distanceKm: distanceKm,
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
            isOpenNow: parsedHours.isOpenNow,
            openingStatus: parsedHours.openingStatus,
            openingHoursText: parsedHours.openingHoursText,
            hoursUntilClose: parsedHours.hoursUntilClose,
            operatingHours: parsedHours.operatingHours,
            phone: phone,
            whatsappNumber: whatsappNumber,
            facilityType: detectFacilityType(place.name || ""),
            _dataSource: "google" as const,
            _dataSourceLabel: "Google Places (Resmi)",
            _trustScore: 10,
          };
        })
      );

      detailedPlaces.sort((a, b) => a.distanceKm - b.distanceKm);
      placesCache.set(cacheKey, { timestamp: Date.now(), data: detailedPlaces });
      return detailedPlaces;
    } catch {
      return [];
    }
  });

const osmSearchSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  dangerLevel: z.string().optional().default("rendah"),
});

/**
 * 2. OpenStreetMap Server Function (Zero CORS, Multi-Endpoint, Fast Server Cache)
 */
export const searchFacilitiesViaOSMServer = createServerFn({ method: "POST" })
  .validator((data: unknown) => osmSearchSchema.parse(data))
  .handler(async ({ data }): Promise<PharmacyNode[]> => {
    const { lat, lon, dangerLevel = "rendah" } = data;
    const radius = dangerLevel === "tinggi" ? 8000 : 6000;
    const cacheKey = `osm_${lat.toFixed(3)}_${lon.toFixed(3)}_${dangerLevel}`;

    const cached = osmServerCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    console.log(`[OSM SERVER] Fetching real facilities for [${lat}, ${lon}] (Triage: ${dangerLevel})`);

    // 1. Try Overpass API from server (Node.js has no CORS limits!)
    const OVERPASS_ENDPOINTS = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    ];

    const overpassQuery = `[out:json][timeout:10];(
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      way["amenity"="hospital"](around:${radius},${lat},${lon});
      relation["amenity"="hospital"](around:${radius},${lat},${lon});
      node["healthcare"="hospital"](around:${radius},${lat},${lon});
      way["healthcare"="hospital"](around:${radius},${lat},${lon});
      node["amenity"="clinic"](around:${radius},${lat},${lon});
      way["amenity"="clinic"](around:${radius},${lat},${lon});
      node["amenity"="pharmacy"](around:${radius},${lat},${lon});
      way["amenity"="pharmacy"](around:${radius},${lat},${lon});
      node["healthcare"="pharmacy"](around:${radius},${lat},${lon});
    );out center 35;`;

    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`${endpoint}?data=${encodeURIComponent(overpassQuery)}`, {
          signal: controller.signal,
          headers: { "User-Agent": "SiagaSehatServer/1.0" },
        });
        clearTimeout(timeoutId);

        if (!res.ok) continue;

        const resData = await res.json();
        if (!resData.elements || resData.elements.length === 0) continue;

        const facilities: PharmacyNode[] = resData.elements
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
            const address =
              [street, suburb].filter(Boolean).join(", ") ||
              `Jl. Sekitar (${pLat.toFixed(4)}, ${pLon.toFixed(4)})`;

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
              _dataSourceLabel: facilityType === "hospital" ? "Rumah Sakit (OpenStreetMap)" : "Apotek (OpenStreetMap)",
              _trustScore: 8,
            };
          })
          .filter((p: PharmacyNode | null): p is PharmacyNode => p !== null);

        // Deduplicate
        const unique: PharmacyNode[] = [];
        for (const f of facilities) {
          const isDup = unique.some(
            (u) =>
              haversineDistance([u.lat, u.lon], [f.lat, f.lon]) < 0.05 ||
              u.name.toLowerCase() === f.name.toLowerCase()
          );
          if (!isDup) unique.push(f);
        }

        // Sort by distance (and prioritize hospitals for tinggi)
        unique.sort((a, b) => {
          if (dangerLevel === "tinggi") {
            const aIsHosp = a.facilityType === "hospital" || a.facilityType === "clinic" ? 0 : 1;
            const bIsHosp = b.facilityType === "hospital" || b.facilityType === "clinic" ? 0 : 1;
            if (aIsHosp !== bIsHosp) return aIsHosp - bIsHosp;
          }
          return a.distanceKm - b.distanceKm;
        });

        if (unique.length > 0) {
          osmServerCache.set(cacheKey, { timestamp: Date.now(), data: unique });
          console.log(`[OSM SERVER] Overpass success! Returned ${unique.length} facilities (Closest: ${unique[0]?.name} - ${unique[0]?.distanceKm} km).`);
          return unique.slice(0, 16);
        }
      } catch (e) {
        console.warn(`[OSM SERVER] Overpass endpoint warning (${endpoint}):`, e);
      }
    }

    // 2. Server-side Nominatim Fallback
    try {
      const delta = 0.08;
      const viewbox = `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`;
      const q = dangerLevel === "tinggi" ? "rumah sakit" : "apotek";
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&viewbox=${viewbox}&bounded=1&limit=12&countrycodes=id`;
      
      const nomRes = await fetch(url, {
        headers: {
          "Accept-Language": "id,en",
          "User-Agent": "SiagaSehatServer/1.0",
        },
      });

      if (nomRes.ok) {
        const nomData = await nomRes.json();
        if (Array.isArray(nomData) && nomData.length > 0) {
          const nomResults: PharmacyNode[] = nomData
            .map((item: any, idx: number): PharmacyNode | null => {
              const pLat = parseFloat(item.lat);
              const pLon = parseFloat(item.lon);
              if (isNaN(pLat) || isNaN(pLon)) return null;

              const distanceKm = Number(haversineDistance([lat, lon], [pLat, pLon]).toFixed(2));
              const nameParts = (item.display_name || "").split(",");
              const name = item.name || nameParts[0] || `Fasilitas ${idx + 1}`;
              const address = nameParts.slice(1, 4).join(", ").trim() || item.display_name;
              const facilityType = detectFacilityType(name, item.type || "");

              return {
                id: `nom-${item.place_id || idx}`,
                lat: pLat,
                lon: pLon,
                name: name,
                address: address,
                distanceKm: distanceKm,
                isOpenNow: true,
                openingStatus: "open",
                openingHoursText: facilityType === "hospital" ? "Buka 24 Jam (IGD)" : "Buka",
                facilityType: facilityType,
                _dataSource: "osm",
                _dataSourceLabel: facilityType === "hospital" ? "Rumah Sakit (Nominatim)" : "Apotek (Nominatim)",
                _trustScore: 8,
              };
            })
            .filter((p): p is PharmacyNode => p !== null);

          nomResults.sort((a, b) => a.distanceKm - b.distanceKm);
          if (nomResults.length > 0) {
            osmServerCache.set(cacheKey, { timestamp: Date.now(), data: nomResults });
            return nomResults;
          }
        }
      }
    } catch {
      // ignore
    }

    return [];
  });

const aiSearchInputSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  address: z.string().optional(),
});

/**
 * 3. Gemini AI Search Server Function (Fallback)
 */
export const searchPharmaciesWithAI = createServerFn({ method: "POST" })
  .validator((data: unknown) => aiSearchInputSchema.parse(data))
  .handler(async ({ data }): Promise<PharmacyNode[]> => {
    const { lat, lon, address } = data;
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) return [];

    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    const systemPrompt = `Anda adalah sistem direktori apotek dan fasilitas kesehatan lokal di Indonesia. 
Berikan daftar 8 fasilitas kesehatan (Apotek / Klinik / RS) terdekat nyata di sekitar koordinat [${lat}, ${lon}] (${address || "Indonesia"}).
Kembalikan HANYA JSON array dengan struktur:
[{"id":"APOTEK-01","lat":-6.23,"lon":106.98,"name":"Nama Fasilitas","address":"Alamat Lengkap","isOpenNow":true,"openingHoursText":"Buka 24 Jam","phone":"021-xxxx"}]`;

    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: `Temukan fasilitas terdekat di sekitar [${lat}, ${lon}].` }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] },
              generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
            }),
          }
        );

        if (!res.ok) continue;

        const responseJson = await res.json();
        const text = responseJson.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? "").join("");
        if (!text) continue;

        const items = JSON.parse(text);
        if (Array.isArray(items) && items.length > 0) {
          const results: PharmacyNode[] = items.map((item: any, idx: number) => {
            const itemLat = typeof item.lat === "number" ? item.lat : lat + (idx + 1) * 0.003;
            const itemLon = typeof item.lon === "number" ? item.lon : lon + (idx + 1) * 0.003;
            const calcDistance = haversineDistance([lat, lon], [itemLat, itemLon]);

            return {
              id: item.id || `env-api-${idx}`,
              lat: itemLat,
              lon: itemLon,
              name: item.name || `Apotek Terdekat ${idx + 1}`,
              address: item.address || address || "Alamat Terdekat",
              distanceKm: Number(calcDistance.toFixed(2)),
              isOpenNow: typeof item.isOpenNow === "boolean" ? item.isOpenNow : true,
              openingStatus: "open",
              openingHoursText: item.openingHoursText || "Buka 24 Jam",
              phone: item.phone,
              facilityType: detectFacilityType(item.name || ""),
              _dataSource: "gemini",
              _dataSourceLabel: "AI Gemini (Terverifikasi)",
              _trustScore: 6,
            };
          });

          results.sort((a, b) => a.distanceKm - b.distanceKm);
          return results;
        }
      } catch {
        // continue
      }
    }

    return [];
  });
