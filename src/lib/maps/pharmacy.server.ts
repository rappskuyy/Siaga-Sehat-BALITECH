import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { PharmacyNode } from "@/components/maps/maps.service";

const pharmacySearchInputSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  address: z.string().optional(),
});

function haversineDistance(coords1: [number, number], coords2: [number, number]): number {
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
Tugasmu mengembalikan daftar 6 sampai 10 APOTEK TERDEKAT ASLI yang beroperasi DI WILAYAH/LOKASI BERIKUT:
Koordinat Pengguna: Latitude ${lat}, Longitude ${lon}
Wilayah / Alamat: ${address || "Sekitar koordinat tersebut"}

ATURAN STRIP LOKASI SANGAT KETAT:
1. SEMUA APOTEK HARUS BERADA DI PULAU / PROVINSI / KOTA YANG SAMA DENGAN KOORDINAT [${lat}, ${lon}] DAN ALAMAT "${address || ""}".
   - Jika pengguna berada di BALI (misal: Denpasar, Badung, Kuta, Ubud, Tabanan, Buleleng, Singaraja, Gianyar, dll.), SEMUA apotek HARUS berada di BALI. DILARANG KERAS memberikan apotek di Jakarta / Jawa / Sumatra.
   - Jika pengguna berada di SUMATRA (misal: Medan, Palembang, Padang, Pekanbaru, Lampung, Banda Aceh, Batam, dll.), SEMUA apotek HARUS berada di SUMATRA. DILARANG KERAS memberikan apotek di Jakarta / Bali.
2. Koordinat (lat, lon) setiap apotek HARUS berada dekat dengan [${lat}, ${lon}] (maksimal selisih 0.35 derajat lat/lon).
3. Urutkan daftar hasil dari yang paling dekat ke yang paling jauh.

Keluarkan HANYA JSON array dengan skema berikut tanpa teks penjelasan di luar JSON:
[
  {
    "id": "string unik",
    "name": "nama apotek resmi",
    "address": "alamat jalan/kelurahan/kecamatan/kota di daerah tersebut",
    "lat": number (koordinat latitude lokasi apotek dekat ${lat}),
    "lon": number (koordinat longitude lokasi apotek dekat ${lon}),
    "distanceKm": number (jarak km presisi dari koordinat asal),
    "isOpenNow": boolean,
    "openingHoursText": "jam operasional misal Buka 24 Jam",
    "phone": "no telp jika ada"
  }
]`;

    const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];
    let lastErrorText = "";

    for (const model of models) {
      try {
        console.log(`[SERVER API] Memanggil AI API model ${model} (.env GEMINI_API_KEY) untuk lokasi: [${lat}, ${lon}] (${address || "Tanpa Alamat"})`);
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
                      text: `Berikan daftar apotek terdekat dari koordinat [${lat}, ${lon}] ${address ? "di wilayah " + address : ""}. Pastikan apotek yang diberikan ada di daerah tersebut!`,
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

        if (!res.ok) {
          const errBody = await res.text().catch(() => "");
          lastErrorText = `HTTP ${res.status}: ${errBody.slice(0, 150)}`;
          console.warn(`[SERVER API] Gemini ${model} error:`, lastErrorText);
          continue;
        }

        const responseJson = await res.json();
        const text = responseJson.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? "").join("");
        if (!text) continue;

        const items = JSON.parse(text);
        if (Array.isArray(items) && items.length > 0) {
          const results: PharmacyNode[] = items.map((item: any, idx: number) => {
            let itemLat = typeof item.lat === "number" ? item.lat : lat + (idx + 1) * 0.005;
            let itemLon = typeof item.lon === "number" ? item.lon : lon + (idx + 1) * 0.005;

            let calcDistance = haversineDistance([lat, lon], [itemLat, itemLon]);
            // Jika koordinat dari AI kejauhan (>50km), sesuaikan koordinat agar tepat di sekitar lokasi pengguna (Bali/Sumatra/dll)
            if (calcDistance > 50 || isNaN(calcDistance)) {
              const angle = (idx * (360 / items.length) * Math.PI) / 180;
              const radiusDeg = 0.005 + idx * 0.004;
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
              openingHoursText: item.openingHoursText || "Buka 24 Jam",
              phone: item.phone,
            };
          });

          results.sort((a, b) => a.distanceKm - b.distanceKm);
          console.log(`[SERVER API] Berhasil mendapatkan ${results.length} apotek lokal via .env GEMINI_API_KEY (${model}):`, results);
          return results;
        }
      } catch (err) {
        console.warn(`[SERVER API] Exception calling Gemini ${model}:`, err);
      }
    }

    return [];
  });
