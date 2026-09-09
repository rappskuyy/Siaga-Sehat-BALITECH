import { createServerFn } from "@tanstack/react-start";

const SYSTEM_PROMPT =
  'Kamu adalah asisten kesehatan virtual bernama "SiagaSehat AI". Kamu melakukan konsultasi kesehatan interaktif dalam Bahasa Indonesia yang jelas, hangat, empatik, dan mudah dipahami.\n\n' +
  "ATURAN PERCAKAPAN:\n" +
  "- Jika pengguna baru menyebutkan gejala atau bagian tubuh yang sakit, gali informasi penting SATU per SATU (jangan tanya semua sekaligus): usia, sudah berapa lama gejala dirasakan, seberapa parah, gejala penyerta, riwayat alergi/obat yang sedang dikonsumsi.\n" +
  "- Jika pengguna mengirimkan hasil Scan AI atau pilihan Anatomi, jelaskan kondisi tersebut dengan bahasa sederhana yang menenangkan, sebutkan tanda bahaya yang perlu diwaspadai, dan berikan langkah perawatan mandiri yang aman.\n" +
  '- Setelah informasi cukup atau setelah pengguna membagikan hasil skrining, berikan ringkasan terstruktur dengan judul: "Preliminary Analysis", "Risk Assessment", dan "Health Recommendation".\n' +
  "- Pada Health Recommendation, sertakan saran obat bebas/OTC umum dan alternatif herbal yang aman bila relevan, serta kapan harus segera ke dokter/IGD.\n" +
  '- Jangan pernah membuat diagnosis pasti 100%, gunakan bahasa "kemungkinan", "bisa jadi", "perlu dipastikan oleh dokter".\n' +
  "- Jika ada tanda bahaya (nyeri dada hebat, sesak napas berat, pendarahan hebat, penurunan kesadaran, ruam melepuh luas), segera sarankan ke IGD tanpa menunggu info lain.\n" +
  "- Jawaban ringkas, ramah, dan solutif.";

/**
 * Helper: resolve OpenAI-compatible base URL.
 * Supports KoboiLLM via OPENAI_BASE_URL env var.
 */
function getOpenAIBaseUrl(): string {
  const customBase = process.env.OPENAI_BASE_URL?.trim();
  if (customBase) {
    if (customBase.endsWith("/v1")) return customBase;
    if (customBase.endsWith("/")) return `${customBase}v1`;
    return customBase;
  }
  return "https://api.openai.com/v1";
}

/**
 * Fallback response generator if external AI endpoints are unreachable/rate-limited
 */
function generateFallbackChatReply(prompt: string): string {
  const lower = prompt.toLowerCase();

  // If this is a scan result consultation handover
  if (lower.includes("scan ai") || lower.includes("hasil skrining") || lower.includes("kondisi yang terdeteksi")) {
    return (
      "Halo! Saya telah menerima dan membaca rangkuman hasil Scan AI Anda.\n\n" +
      "📌 **Penjelasan Awal:**\n" +
      "Hasil pemindaian ini merupakan skrining awal edukatif untuk membantu Anda memahami kondisi fisik/kulit yang terlihat. Perubahan pada kulit atau gejala fisik umumnya dapat dipicu oleh faktor iritasi, alergi, infeksi ringan, maupun kelembapan berlebih.\n\n" +
      "⚠️ **Hal yang Perlu Diwaspadai (Tanda Bahaya):**\n" +
      "- Rasa nyeri atau perih yang bertambah parah dengan cepat.\n" +
      "- Ruam menyebar luas disertai demam atau keluar nanah/cairan berlebih.\n" +
      "- Tidak ada perbaikan setelah 3–5 hari perawatan mandiri.\n\n" +
      "💡 **Langkah Aman & Rekomendasi Awal:**\n" +
      "1. Jaga area yang bermasalah tetap bersih, kering, dan hindari menggaruk atau memencetnya.\n" +
      "2. Gunakan pelembap lembut tanpa pewangi atau kompres sejuk bila terasa gatal/perih.\n" +
      "3. Jika keluhan berlanjut, konsultasikan langsung ke dokter spesialis atau faskes terdekat untuk penanganan definitif.\n\n" +
      "Boleh saya tahu sudah berapa lama keluhan ini Anda rasakan, dan apakah ada rasa gatal atau nyeri yang mengganggu?"
    );
  }

  // If this is an anatomy result handover
  if (lower.includes("organ") || lower.includes("anatomi") || lower.includes("bagian tubuh")) {
    return (
      "Halo! Saya telah menerima data keluhan yang Anda tandai pada model Anatomi.\n\n" +
      "📌 **Analisis Awal:**\n" +
      "Keluhan pada bagian tubuh tersebut dapat berkaitan dengan ketegangan otot, peradangan ringan, atau faktor aktivitas harian. Evaluasi menyeluruh diperlukan untuk memastikan pemicu utamanya.\n\n" +
      "💡 **Langkah Awal yang Disarankan:**\n" +
      "- Istirahatkan bagian tubuh yang sakit dan hindari aktivitas berat sementara waktu.\n" +
      "- Perhatikan asupan cairan dan istirahat yang cukup.\n" +
      "- Bila nyeri mengganggu, kompres hangat/dingin dapat membantu meredakan ketidaknyamanan.\n\n" +
      "Boleh ceritakan lebih detail, sudah sejak kapan gejala ini muncul dan apakah terasa terus-menerus atau hilang timbul?"
    );
  }

  // General health guidance fallback
  return (
    "Halo! Saya asisten kesehatan SiagaSehat AI siap membantu Anda.\n\n" +
    "Untuk memberikan panduan dan analisis yang paling tepat, boleh ceritakan lebih detail:\n" +
    "1. Gejala utama apa yang sedang Anda rasakan?\n" +
    "2. Sudah berapa hari keluhan ini berlangsung?\n" +
    "3. Apakah ada gejala penyerta lain seperti demam, mual, atau nyeri di bagian tubuh tertentu?"
  );
}

async function chatWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY belum dikonfigurasi di server.");

  // Working & verified Google Gemini models in order of preference
  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.5-pro",
  ];
  let lastErrText = "";

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
          signal: AbortSignal.timeout(25000),
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 1500,
              temperature: 0.7,
            },
          }),
        },
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        lastErrText = `Model ${model} status ${res.status}: ${txt.slice(0, 150)}`;
        continue;
      }

      const payload = await res.json();
      const text =
        payload.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text ?? "")
          .join("") || "";
      if (text && text.trim().length > 0) return text.trim();
    } catch (err) {
      lastErrText = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(`Gemini API tidak dapat dihubungi (${lastErrText || "semua model sibuk/error"})`);
}

async function chatWithOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY belum dikonfigurasi di server.");

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const baseUrl = getOpenAIBaseUrl();

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(25000),
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenAI error ${res.status}: ${txt.slice(0, 200)}`);
  }

  const payload = await res.json();
  const text = payload.choices?.[0]?.message?.content;
  if (!text || text.trim().length === 0) throw new Error("OpenAI tidak mengembalikan respon valid.");

  return text.trim();
}

export const chatWithAI = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Invalid input");
    const d = data as { prompt?: unknown };
    if (!d.prompt || typeof d.prompt !== "string") throw new Error("prompt is required");
    return d;
  })
  .handler(async ({ data }): Promise<{ reply: string }> => {
    const { prompt } = data as { prompt: string };
    const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase().trim();

    if (provider === "openai") {
      if (process.env.OPENAI_API_KEY?.trim()) {
        try {
          const reply = await chatWithOpenAI(prompt);
          return { reply };
        } catch (err) {
          console.warn("OpenAI chat failed, trying Gemini as fallback:", err);
        }
      }
      if (process.env.GEMINI_API_KEY?.trim()) {
        try {
          const reply = await chatWithGemini(prompt);
          return { reply };
        } catch (err) {
          console.error("Gemini chat fallback failed:", err);
        }
      }
    } else {
      // Default: Gemini first
      if (process.env.GEMINI_API_KEY?.trim()) {
        try {
          const reply = await chatWithGemini(prompt);
          return { reply };
        } catch (err) {
          console.warn("Gemini chat failed, trying OpenAI as fallback:", err);
        }
      }
      if (process.env.OPENAI_API_KEY?.trim()) {
        try {
          const reply = await chatWithOpenAI(prompt);
          return { reply };
        } catch (err) {
          console.error("OpenAI chat fallback failed:", err);
        }
      }
    }

    // High-resilience fallback: provide structured clinical guidance rather than throwing UI errors
    console.info("Using intelligent medical fallback response for consultation chat.");
    return {
      reply: generateFallbackChatReply(prompt),
    };
  });
