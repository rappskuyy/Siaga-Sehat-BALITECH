import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SCAN_RESULT_JSON_SCHEMA, type ScanResult } from "./types";

// Catatan: sengaja panggil REST API OpenAI/Gemini langsung via fetch (bukan lewat SDK resmi
// mereka), karena SDK Node mereka membawa dependency yang tidak selalu kompatibel dengan
// runtime Cloudflare Workers yang dipakai app ini saat deploy. fetch murni aman di Workers.

const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

const scanInputSchema = z.object({
  imageBase64: z.string().min(1),
  mediaType: z.enum(ALLOWED_MEDIA_TYPES),
});

const SYSTEM_PROMPT = `Kamu adalah asisten skrining kesehatan berbasis AI bernama "SiagaSehat Scanner". Tugasmu menganalisis foto kondisi kulit/tubuh yang diunggah pengguna dan memberikan informasi edukatif awal — BUKAN diagnosis medis resmi.

Aturan penting:
- Selalu jawab dalam Bahasa Indonesia yang jelas dan mudah dipahami orang awam.
- Jika gambar tidak menunjukkan kondisi kesehatan/kulit yang bisa dianalisis (misalnya foto tidak relevan, buram, atau bukan bagian tubuh), set "gambar_dapat_dianalisis" ke false dan jelaskan di "ringkasan" apa yang perlu difoto ulang. Isi field array dengan array kosong dan field lain dengan nilai netral.
- "tingkat_bahaya": "tinggi" untuk kondisi yang berpotensi serius/butuh penanganan cepat, "sedang" untuk kondisi yang perlu diperhatikan tapi tidak darurat, "rendah" untuk kondisi ringan/umum.
- Jika "tingkat_bahaya" adalah "tinggi", WAJIB set "harus_ke_dokter" ke true dan jelaskan alasannya dengan tegas namun tidak menakut-nakuti.
- "obat_rekomendasi" HANYA boleh berisi obat bebas/bebas terbatas (OTC) yang umum dijual di apotek Indonesia (contoh: parasetamol, salep antiseptik, antihistamin topikal, dsb) dengan dosis dewasa umum. JANGAN merekomendasikan obat keras/resep. Selalu tambahkan di "catatan" bahwa dosis perlu disesuaikan dan sebaiknya dikonfirmasi ke apoteker/dokter, terutama untuk anak-anak, ibu hamil/menyusui, dan penderita penyakit kronis.
- "obat_herbal" berisi bahan alami umum (misalnya jahe, kunyit, lidah buaya) beserta cara pakainya secara singkat dan aman.
- Jangan pernah membuat diagnosis pasti 100% — gunakan bahasa "kemungkinan", "berdasarkan gambar terlihat seperti", dsb.
- Keluarkan HANYA data terstruktur sesuai skema yang diberikan, tanpa teks tambahan di luar skema.`;

const USER_PROMPT =
  "Analisis foto ini dan berikan hasil skrining kesehatan awal sesuai skema yang telah ditentukan.";

/**
 * Provider aktif dipilih lewat env var AI_PROVIDER ("openai" | "gemini").
 * Default ke "openai" jika tidak diset.
 */
function getProvider(): "openai" | "gemini" {
  const provider = (process.env.AI_PROVIDER ?? "openai").toLowerCase();
  if (provider !== "openai" && provider !== "gemini") {
    throw new Error(
      `AI_PROVIDER="${provider}" tidak dikenal. Gunakan "openai" atau "gemini".`,
    );
  }
  return provider;
}

async function analyzeWithOpenAI(data: {
  imageBase64: string;
  mediaType: string;
}): Promise<ScanResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY belum dikonfigurasi di server. Tambahkan API key OpenAI ke file .env (untuk `npm run dev`) atau .dev.vars (untuk `wrangler dev`/preview), lalu restart server.",
    );
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-5.4",
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
    throw new Error(
      `Gagal menghubungi OpenAI (status ${res.status}). ${errText.slice(0, 300)}`,
    );
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

  try {
    return JSON.parse(text) as ScanResult;
  } catch {
    throw new Error("Gagal membaca hasil analisis dari AI. Silakan coba lagi.");
  }
}

/**
 * Skema Gemini pakai subset OpenAPI yang lebih terbatas dari JSON Schema biasa —
 * field seperti "additionalProperties" tidak dikenali dan bikin request ditolak (400).
 * Fungsi ini membuang field-field yang tidak didukung secara rekursif.
 */
function toGeminiSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) {
    return schema.map(toGeminiSchema);
  }
  if (schema !== null && typeof schema === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema)) {
      if (key === "additionalProperties") continue;
      result[key] = toGeminiSchema(value);
    }
    return result;
  }
  return schema;
}

const GEMINI_RESULT_SCHEMA = toGeminiSchema(SCAN_RESULT_JSON_SCHEMA);

async function analyzeWithGemini(data: {
  imageBase64: string;
  mediaType: string;
}): Promise<ScanResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY belum dikonfigurasi di server. Tambahkan API key Gemini ke file .env (untuk `npm run dev`) atau .dev.vars (untuk `wrangler dev`/preview), lalu restart server.",
    );
  }

  const model = "gemini-3.5-flash";
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
          role: "system",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: GEMINI_RESULT_SCHEMA,
        },
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `Gagal menghubungi Gemini (status ${res.status}). ${errText.slice(0, 300)}`,
    );
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

  try {
    return JSON.parse(text) as ScanResult;
  } catch {
    throw new Error("Gagal membaca hasil analisis dari AI. Silakan coba lagi.");
  }
}

export const analyzeHealthImage = createServerFn({ method: "POST" })
  .validator((data: unknown) => scanInputSchema.parse(data))
  .handler(async ({ data }): Promise<ScanResult> => {
    const provider = getProvider();

    if (provider === "gemini") {
      return analyzeWithGemini(data);
    }

    return analyzeWithOpenAI(data);
  });
