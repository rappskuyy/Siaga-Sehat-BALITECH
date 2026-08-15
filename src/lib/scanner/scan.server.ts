import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SCAN_RESULT_JSON_SCHEMA, type ScanResult } from "./types";

const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

const scanInputSchema = z.object({
  imageBase64: z.string().min(1),
  mediaType: z.enum(ALLOWED_MEDIA_TYPES),
});

const SYSTEM_PROMPT = `Kamu adalah asisten skrining kesehatan berbasis AI bernama "SiagaSehat Scanner". Tugasmu menganalisis foto kondisi kulit/tubuh yang diunggah pengguna dan memberikan hasil analisis edukatif awal berdasarkan DATASET INFORMASI PENYAKIT & KESEHATAN INDONESIA.

DATASET INFORMASI PENYAKIT ACUAN:
1. Dermatitis Kontak & Eksim (Atopik / Iritan / Alergi):
   - Gejala: Kulit kemerahan, gatal, bersisik, kering, atau melepuh kecil.
   - Obat OTC: Krim Hydrocortisone 1%, Pelembap Hypoallergenic, Lotion Kalamin.
   - Obat Herbal: Gel Lidah Buaya (Aloe Vera), Kompres Minyak Zaitun.
2. Tinea & Infeksi Jamur Kulit (Panu, Kadas, Kurap, Tinea Pedis):
   - Gejala: Bercak berbatas tegas, bersisik halus, gatal terutama saat berkeringat.
   - Obat OTC: Krim Mikonazol 2%, Ketokonazol 2%, Salep 2-4.
   - Obat Herbal: Ekstrak Daun Sirih, Minyak Kelapa Murni (VCO).
3. Acne Vulgaris & Peradangan Kelenjar (Jerawat Papul, Pustul, Komedo):
   - Gejala: Bintil merah peradangan, bintik bernanah, komedo hitam/putih.
   - Obat OTC: Asam Salisilat topikal, Benzoil Peroksida 2.5%, Gel Sulfur.
   - Obat Herbal: Tea Tree Oil (Minyak Pohon Teh), Masker Kunyit & Madu.
4. Urtikaria & Reaksi Alergi Kulit (Biduran / Kaligata):
   - Gejala: Bentol kemerahan menimbul (wheal), gatal intens, timbul hilang cepat.
   - Obat OTC: Antihistamin Oral (Cetirizine 10mg / Loratadine 10mg), Lotion Kalamin.
   - Obat Herbal: Air Kelapa Hijau, Kompres Air Dingin, Ekstrak Jahe.
5. Scabies & Infeksi Parasit Kulit (Kudis):
   - Gejala: Bintil gatal hebat terutama malam hari di sela jari, pergelangan, lipatan.
   - Obat OTC / Tindakan: Bersihkan pakaian/sprei dengan air panas. Butuh salep khusus dari dokter (Permethrin 5%).
   - Obat Herbal: Minyak Mimba (Neem Oil), Minyak Cengkeh terencerkan.
6. Impetigo & Infeksi Bakteri Kulit (Bisul / Folikulitis):
   - Gejala: Bintil berair/bernanah yang pecah membentuk keropeng kuning keemasan.
   - Obat OTC: Salep Antiseptik Povidone Iodine, Pembersih Antiseptik Chlorhexidine.
   - Obat Herbal: Ekstrak Bawang Putih terencerkan, Air Seduhan Daun Sirih.
7. Herpes Zoster & Virus Kulit (Cacar Ular / Cacar Air):
   - Gejala: Gelembung bintil berair berkelompok sesuai alur saraf, panas, nyeri menusuk.
   - Obat OTC: Parasetamol 500mg (pereda nyeri), Bedak Salisil (mengeringkan bintil). Butuh konfirmasi dokter untuk antivirus.
   - Obat Herbal: Kompres Dingin Air Antiseptik Alami.
8. Psoriasis & Gangguan Inflamasi Kronis:
   - Gejala: Plak kemerahan menebal dilapisi sisik tebal berwarna perak.
   - Obat OTC: Pelembap Tebal (Petroleum Jelly/Ceramide), Salep Asam Salisilat.
   - Obat Herbal: Gel Lidah Buaya Murni, Mandi Garam Epsom.
9. Gigitan Serangga & Dermatitis Venenata (Contoh: Tomcat/Serangga):
   - Gejala: Ruam melepuh memanjang seperti luka bakar, perih dan panas.
   - Obat OTC: Salep Hydrocortisone, Kompres Dingin NaCl/Air Bersih.
   - Obat Herbal: Gel Aloe Vera pendingin.

ATURAN ANALISIS INFORMASI PENYAKIT:
- Selalu jawab dalam Bahasa Indonesia yang jelas dan mudah dipahami.
- Jika gambar tidak menunjukkan kondisi kesehatan/kulit (buram, foto benda, dsb), set "gambar_dapat_dianalisis" ke false dan berikan petunjuk di "ringkasan".
- Klasifikasikan "tingkat_bahaya" ("rendah", "sedang", "tinggi") secara akurat. Jika "tinggi", set "harus_ke_dokter" ke true.
- "obat_rekomendasi": Hanya cantumkan obat bebas/OTC umum di Indonesia beserta dosis aman.
- "obat_herbal": Cantumkan tanaman obat / cara alami tradisional aman.
- Jangan pernah membuat diagnosis pasti 100% — gunakan bahasa "kemungkinan", "berdasarkan gambar terlihat seperti", dsb.
- Keluarkan HANYA data terstruktur sesuai skema JSON tanpa teks tambahan di luar skema.`;

const USER_PROMPT =
  "Analisis foto ini dan berikan hasil skrining kesehatan awal sesuai skema yang telah ditentukan.";

async function analyzeWithOpenAI(data: {
  imageBase64: string;
  mediaType: string;
}): Promise<ScanResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY belum dikonfigurasi di server. Tambahkan API key OpenAI ke file .env lalu restart server.",
    );
  }

  const models = Array.from(
    new Set([process.env.OPENAI_MODEL, "gpt-4o", "gpt-4o-mini"].filter((m): m is string => Boolean(m))),
  );

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: `data:${data.mediaType};base64,${data.imageBase64}` },
                },
                { type: "text", text: USER_PROMPT },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "scan_result",
              strict: true,
              schema: SCAN_RESULT_JSON_SCHEMA,
            },
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`OpenAI ${model} (status ${res.status}). ${errText.slice(0, 250)}`);
      }

      const payload = (await res.json()) as {
        choices?: Array<{ message?: { content?: string | null; refusal?: string | null } }>;
      };

      const message = payload.choices?.[0]?.message;
      if (message?.refusal) {
        throw new Error(
          "AI menolak menganalisis gambar ini. Coba unggah foto yang lebih jelas dan relevan dengan kondisi kesehatan.",
        );
      }

      const text = message?.content;
      if (!text) {
        throw new Error("AI tidak mengembalikan hasil analisis yang valid.");
      }

      return JSON.parse(text) as ScanResult;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (lastError.message.includes("menolak menganalisis")) {
        throw lastError;
      }
    }
  }

  throw lastError ?? new Error("Gagal menghubungi OpenAI API.");
}

function toGeminiSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) {
    return schema.map(toGeminiSchema);
  }
  if (schema !== null && typeof schema === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema)) {
      if (key === "additionalProperties") continue;
      if (key === "type" && typeof value === "string") {
        result[key] = value.toUpperCase();
      } else {
        result[key] = toGeminiSchema(value);
      }
    }
    return result;
  }
  return schema;
}

const SCAN_CACHE = new Map<string, { result: ScanResult; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

function getSimpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36) + str.length;
}

const GEMINI_RESULT_SCHEMA = toGeminiSchema(SCAN_RESULT_JSON_SCHEMA);

const delayMs = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function analyzeWithGemini(data: {
  imageBase64: string;
  mediaType: string;
}): Promise<ScanResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY belum dikonfigurasi di server. Tambahkan API key Gemini ke file .env lalu restart server.",
    );
  }

  const cacheKey = getSimpleHash(data.imageBase64);
  const cached = SCAN_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result;
  }

  const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];

  let lastError: Error | null = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 3; attempt++) {
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
                      inlineData: {
                        mimeType: data.mediaType,
                        data: data.imageBase64,
                      },
                    },
                    { text: USER_PROMPT },
                  ],
                },
              ],
              systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }],
              },
              generationConfig: {
                responseMimeType: "application/json",
                responseSchema: GEMINI_RESULT_SCHEMA,
              },
            }),
          },
        );

        if (res.status === 404) {
          const errText = await res.text().catch(() => "");
          lastError = new Error(`Gemini ${model} (status 404). ${errText.slice(0, 200)}`);
          break;
        }

        if (res.status === 429) {
          if (attempt < 3) {
            await delayMs(attempt * 1500);
            continue;
          }
          throw new Error(
            "Batas kuota gratis (rate limit 429) Gemini API sedang tercapai. Silakan tunggu 10 detik lalu coba tekan Scan kembali.",
          );
        }

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          throw new Error(`Gemini ${model} (status ${res.status}). ${errText.slice(0, 250)}`);
        }

        const payload = (await res.json()) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
            finishReason?: string;
          }>;
        };

        if (payload.candidates?.[0]?.finishReason === "SAFETY") {
          throw new Error(
            "AI menolak menganalisis gambar ini. Coba unggah foto yang lebih jelas dan relevan dengan kondisi kesehatan.",
          );
        }

        const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("");
        if (!text) {
          throw new Error("AI tidak mengembalikan hasil analisis yang valid.");
        }

        const parsedResult = JSON.parse(text) as ScanResult;
        SCAN_CACHE.set(cacheKey, { result: parsedResult, timestamp: Date.now() });
        return parsedResult;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (
          lastError.message.includes("menolak menganalisis") ||
          lastError.message.includes("rate limit 429")
        ) {
          throw lastError;
        }
      }
    }
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    try {
      return await analyzeWithOpenAI(data);
    } catch {
      // ignore
    }
  }

  throw (
    lastError ??
    new Error(
      "Gagal terhubung ke Gemini API. Mohon periksa GEMINI_API_KEY Anda di file .env.",
    )
  );
}

export const analyzeHealthImage = createServerFn({ method: "POST" })
  .validator((data: unknown) => scanInputSchema.parse(data))
  .handler(async ({ data }): Promise<ScanResult> => {
    return analyzeWithGemini(data);
  });
