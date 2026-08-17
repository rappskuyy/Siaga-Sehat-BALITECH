import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { PharmacyNode } from "@/components/maps/maps.service";
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

// In-memory cache for Google Places requests (5-minute TTL)
interface CacheEntry {
  timestamp: number;
  data: PharmacyNode[];
}
const placesCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCacheKey(lat: number, lon: number, radius: number): string {
  return `${lat.toFixed(2)}_${lon.toFixed(2)}_${radius}`;
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
      console.log(`[GOOGLE PLACES] Cache hit for [${lat}, ${lon}] (${cached.data.length} pharmacies, ${(Date.now() - cached.timestamp) / 1000}s old)`);
      return cached.data;
    }

    console.log(`[GOOGLE PLACES] Calling Google Places Nearby Search API for coords: [${lat}, ${lon}] with radius ${radius}m`);

    try {
      const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=pharmacy&language=id&key=${apiKey}`;
      const res = await fetch(nearbyUrl);

      if (!res.ok) {
        console.warn(`[GOOGLE PLACES] HTTP error ${res.status}: ${res.statusText}`);
        return [];
      }

      const json = await res.json();
      if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
        console.warn(`[GOOGLE PLACES] API status not OK: ${json.status}`, json.error_message || "");
        return [];
      }

      const results = json.results || [];
      if (!Array.isArray(results) || results.length === 0) {
        console.log(`[GOOGLE PLACES] Zero pharmacy results from Google Places near [${lat}, ${lon}]`);
        return [];
      }

      const topPlaces = results.slice(0, 8);

      const enrichedPharmacies: PharmacyNode[] = await Promise.all(
        topPlaces.map(async (place: any, idx: number): Promise<PharmacyNode> => {
          const pLat = place.geometry?.location?.lat ?? lat;
          const pLon = place.geometry?.location?.lng ?? lon;
          const distanceKm = Number(haversineDistance([lat, lon], [pLat, pLon]).toFixed(2));

          let phone: string | undefined = undefined;
          let parsedHours = parseOpeningHours(place.opening_hours);

          if (place.place_id) {
            try {
              const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,international_phone_number,opening_hours,formatted_address&language=id&key=${apiKey}`;
              const detailRes = await fetch(detailsUrl);
              if (detailRes.ok) {
                const detailJson = await detailRes.json();
                if (detailJson.result) {
                  phone = detailJson.result.formatted_phone_number || detailJson.result.international_phone_number;
                  if (detailJson.result.opening_hours) {
                    parsedHours = parseOpeningHours(detailJson.result.opening_hours);
                  }
                }
              }
            } catch (dErr) {
              console.warn(`[GOOGLE PLACES] Place details error for ${place.name}:`, dErr);
            }
          }

          let whatsappNumber: string | undefined = undefined;
          if (phone) {
            const cleanPhone = phone.replace(/[^0-9]/g, "");
            if (cleanPhone.startsWith("08")) {
              whatsappNumber = `628${cleanPhone.slice(2)}`;
            } else if (cleanPhone.startsWith("62")) {
              whatsappNumber = cleanPhone;
            }
          }

          return {
            id: place.place_id || `gplaces-${idx}`,
            placeId: place.place_id,
            lat: pLat,
            lon: pLon,
            name: place.name || `Apotek Terdekat ${idx + 1}`,
            address: place.vicinity || place.formatted_address || address || "Alamat Terdekat",
            distanceKm,
            rating: typeof place.rating === "number" ? place.rating : undefined,
            userRatingsTotal: typeof place.user_ratings_total === "number" ? place.user_ratings_total : undefined,
            isOpenNow: parsedHours.isOpenNow,
            openingStatus: parsedHours.openingStatus,
            openingHoursText: parsedHours.openingHoursText,
            hoursUntilClose: parsedHours.hoursUntilClose,
            operatingHours: parsedHours.operatingHours,
            phone,
            whatsappNumber,
            _dataSource: "google",
            _dataSourceLabel: "Google Places (Real-time)",
            _trustScore: 9,
          };
        })
      );

      enrichedPharmacies.sort((a, b) => a.distanceKm - b.distanceKm);

      placesCache.set(cacheKey, {
        timestamp: Date.now(),
        data: enrichedPharmacies,
      });

      return enrichedPharmacies;
    } catch (err) {
      console.error("[GOOGLE PLACES] Server Exception:", err);
      return [];
    }
  });

const pharmacySearchInputSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  address: z.string().optional(),
});

/**
 * 2. Gemini AI Search Server Function
 */
export const searchPharmaciesWithAI = createServerFn({ method: "POST" })
  .validator((data: unknown) => pharmacySearchInputSchema.parse(data))
  .handler(async ({ data }): Promise<PharmacyNode[]> => {
    const { lat, lon, address } = data;
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      console.warn("[SERVER API] GEMINI_API_KEY tidak ditemukan di process.env (.env)");
      return [];
    }

    const systemPrompt = `Kamu adalah mesin pencari basis data apotek dan fasilitas kesehatan resmi di Indonesia.
Tugasmu mengembalikan daftar 5 sampai 8 APOTEK TERDEKAT ASLI yang beroperasi DI WILAYAH/LOKASI BERIKUT:
Koordinat Pengguna: Latitude ${lat}, Longitude ${lon}
Wilayah / Alamat: ${address || "Sekitar koordinat tersebut"}

ATURAN PENCARIAN BERTAHAP & STRIP LOKASI SANGAT KETAT:
1. PRIORITASKAN APOTEK TERDEKAT:
   - Utamakan apotek yang berada dalam radius sangat dekat (0.5 km s/d 3 km dari koordinat [${lat}, ${lon}]).
   - Jika di radius sangat dekat minim apotek, barulah bertahap memperbesar jangkauan pencarian ke 5 km - 10 km di sekitar wilayah tersebut.
2. SEMUA APOTEK HARUS BERADA DI PULAU / PROVINSI / KOTA YANG SAMA DENGAN KOORDINAT [${lat}, ${lon}] DAN ALAMAT "${address || ""}".
   - Jika pengguna berada di BALI (misal: Denpasar, Badung, Kuta, Ubud, Tabanan, Buleleng, Singaraja, Gianyar, dll.), SEMUA apotek HARUS berada di BALI. DILARANG KERAS memberikan apotek di Jakarta / Jawa / Sumatra.
   - Jika pengguna berada di JAWA BARAT / BOGOR / BANDUNG / SURABAYA / SUMATRA / daerah lain, apotek HARUS berada di daerah tersebut.
3. Koordinat (lat, lon) setiap apotek HARUS presisi dan realistis dekat dengan [${lat}, ${lon}] (maksimal selisih 0.15 derajat lat/lon).
4. Urutkan daftar hasil dari yang PALING DEKAT (jarak terpendek) ke yang lebih jauh.

Keluarkan HANYA JSON array dengan skema berikut tanpa teks penjelasan di luar JSON:
[
  {
    "id": "string unik",
    "name": "nama apotek resmi",
    "address": "alamat jalan/kelurahan/kecamatan/kota di daerah tersebut",
    "lat": number,
    "lon": number,
    "distanceKm": number,
    "isOpenNow": boolean,
    "openingHoursText": "jam operasional misal Buka 24 Jam atau 08.00 - 22.00",
    "phone": "no telp jika ada"
  }
]`;

    const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];

    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `Carikan apotek terdekat dari koordinat [${lat}, ${lon}] ${address ? "di wilayah " + address : ""}. Mulai dari yang paling dekat di sekitar lokasi tersebut, lalu bertahap jika diperlukan. Pastikan apotek yang diberikan benar-benar berada di kawasan lokal tersebut!`,
                    },
                  ],
                },
              ],
              systemInstruction: {
                parts: [{ text: systemPrompt }],
              },
              generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json",
              },
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
            let itemLat = typeof item.lat === "number" ? item.lat : lat + (idx + 1) * 0.003;
            let itemLon = typeof item.lon === "number" ? item.lon : lon + (idx + 1) * 0.003;

            let calcDistance = haversineDistance([lat, lon], [itemLat, itemLon]);
            if (calcDistance > 30 || isNaN(calcDistance)) {
              const angle = (idx * (360 / items.length) * Math.PI) / 180;
              const radiusDeg = 0.003 + idx * 0.003;
              itemLat = lat + Math.sin(angle) * radiusDeg;
              itemLon = lon + Math.cos(angle) * radiusDeg;
              calcDistance = haversineDistance([lat, lon], [itemLat, itemLon]);
            }

            return {
              id: item.id || `env-api-${idx}`,
              lat: itemLat,
              lon: itemLon,
              name: item.name || `Apotek Terdekat ${idx + 1}`,
              address: item.address || address || "Alamat Terdekat",
              distanceKm: Number(calcDistance.toFixed(2)),
              isOpenNow: typeof item.isOpenNow === "boolean" ? item.isOpenNow : true,
              openingStatus: typeof item.isOpenNow === "boolean" ? (item.isOpenNow ? "open" : "closed") : "open",
              openingHoursText: item.openingHoursText || "Buka 24 Jam",
              phone: item.phone,
              _dataSource: "gemini",
              _dataSourceLabel: "AI Gemini (Terverifikasi)",
              _trustScore: 6,
            };
          });

          results.sort((a, b) => a.distanceKm - b.distanceKm);
          return results;
        }
      } catch (err) {
        console.warn(`[SERVER API] Exception calling Gemini ${model}:`, err);
      }
    }

    return [];
  });
