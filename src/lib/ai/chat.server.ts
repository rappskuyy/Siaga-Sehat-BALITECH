import { createServerFn } from "@tanstack/react-start";

const SYSTEM_PROMPT =
  'Kamu adalah asisten kesehatan virtual bernama "SiagaSehat AI". Kamu melakukan konsultasi kesehatan interaktif dalam Bahasa Indonesia yang jelas, empatik, praktis, dan mudah dipindai.\n\n' +
  "ATURAN PERCAKAPAN:\n" +
  "- Pada awal konsultasi, jangan langsung memberikan solusi atau rekomendasi. Gali informasi secara bertahap dan tanyakan hanya SATU hal per balasan: pertama umur pengguna, lalu keluhan/gejala lain yang menyertai, lalu durasi dan tingkat keparahan bila belum diketahui.\n" +
  "- Setelah umur dan minimal satu gejala utama sudah diketahui, WAJIB berikan solusi awal yang aman pada balasan yang sama. Jangan hanya menulis pembuka seperti 'berikut solusinya' tanpa isi.\n" +
  "- Jika umur, gejala, dan demam/nyeri sudah disebutkan di riwayat, anggap data minimum TERPENUHI dan berikan bagian YANG BISA DILAKUKAN terlebih dahulu.\n" +
  "- Jika durasi atau tingkat keparahan belum diketahui tetapi data minimum sudah terpenuhi, berikan solusi aman berdasarkan informasi yang ada lalu tanyakan SATU pertanyaan lanjutan di bagian paling akhir.\n" +
  "- Jika pengguna menyebut tanda bahaya, lewati tahap tanya jawab dan arahkan ke IGD.\n" +
  "- Jika pengguna menekan pertanyaan lanjutan seperti solusi, penyebab, pantangan, obat, atau langkah selanjutnya setelah informasi cukup, jawab bagian yang diminta secara langsung.\n" +
  "- Untuk keluhan yang sudah cukup jelas, gunakan format wajib berikut (sesuaikan bagian yang relevan):\n" +
  "  ANALISIS AWAL: kemungkinan kondisi dan alasan singkat.\n" +
  "  KEMUNGKINAN PENYEBAB: 2-4 penyebab yang masuk akal.\n" +
  "  YANG BISA DILAKUKAN: langkah perawatan mandiri yang konkret dan berurutan.\n" +
  "  OBAT/REKOMENDASI: opsi obat bebas hanya bila relevan, tulis peringatan kontraindikasi dan jangan mengarang dosis; sertakan alternatif non-obat bila aman.\n" +
  "- JANGAN menambahkan bagian PANTANGAN atau KAPAN KE DOKTER pada jawaban solusi awal. Simpan kedua topik itu untuk tombol pertanyaan lanjutan. Pengecualian: jika ada tanda bahaya, tampilkan peringatan singkat untuk segera ke IGD.\n" +
  "- Jika pengguna menekan pertanyaan lanjutan seperti penyebab, pantangan, kapan ke dokter, obat, atau langkah selanjutnya, jawab topik yang diminta secara langsung.\n" +
  "- Gunakan bullet list dan paragraf pendek. Jangan menggunakan diagnosis pasti, jangan menjanjikan kesembuhan, dan jangan merekomendasikan obat resep tanpa pemeriksaan dokter.\n" +
  '- Jangan pernah membuat diagnosis pasti 100%, gunakan bahasa "kemungkinan", "bisa jadi", "perlu dipastikan oleh dokter".\n' +
  "- Jika ada tanda bahaya (nyeri dada hebat, sesak napas berat, pendarahan hebat, penurunan kesadaran, dll), segera sarankan ke IGD tanpa menunggu info lain.\n" +
  "- Jawaban idealnya 6-12 bullet/baris yang informatif, ramah, dan tidak bertele-tele.";

/**
 * Helper: resolve OpenAI-compatible base URL.
 * Supports KoboiLLM via OPENAI_BASE_URL env var.
 */
function getOpenAIBaseUrl(): string {
  const customBase = process.env.OPENAI_BASE_URL?.trim();
  if (customBase) {
    // Normalize: ensure it ends with /v1
    if (customBase.endsWith("/v1")) return customBase;
    if (customBase.endsWith("/")) return `${customBase}v1`;
    return customBase;
  }
  return "https://api.openai.com/v1";
}

async function chatWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY belum dikonfigurasi di server.");

  const models = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-2.5-pro"];
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
          signal: AbortSignal.timeout(12000),
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 1800,
              thinkingConfig: { thinkingBudget: 0 },
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
      if (text) return text;
    } catch (err) {
      lastErrText = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(`Gemini API tidak dapat dihubungi (${lastErrText || "semua model sibuk/error"})`);
}

async function chatWithOpenAI(
  prompt: string,
  config: { apiKey?: string; baseUrl?: string; model?: string } = {},
): Promise<string> {
  const apiKey = (config.apiKey || process.env.OPENAI_API_KEY)?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY belum dikonfigurasi di server.");

  const model = config.model || process.env.OPENAI_MODEL || "gpt-4o-mini";
  const baseUrl = config.baseUrl || getOpenAIBaseUrl();

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 3000,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenAI/KoboiLLM error ${res.status}: ${txt.slice(0, 200)}`);
  }

  const payload = await res.json();
  const text = getCompletionText(payload);
  if (!text) throw new Error("OpenAI/KoboiLLM tidak mengembalikan respon valid.");

  return text;
}

function getCompletionText(payload: unknown): string | null {
  const content = (payload as { choices?: Array<{ message?: { content?: unknown } }> })
    .choices?.[0]?.message?.content;

  if (typeof content === "string" && content.trim()) return content.trim();
  if (Array.isArray(content)) {
    const text = content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          const value = (part as { text?: unknown }).text;
          return typeof value === "string" ? value : "";
        }
        return "";
      })
      .join("")
      .trim();
    return text || null;
  }
  return null;
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
    let lastError: Error | null = null;

    if (provider === "openai" || provider === "koboillm") {
      const isKoboi = provider === "koboillm";
      const apiKey = isKoboi ? process.env.KOBOILLM_API_KEY : process.env.OPENAI_API_KEY;
      const baseUrl = isKoboi ? process.env.KOBOILLM_BASE_URL : undefined;
      const model = isKoboi ? process.env.KOBOILLM_MODEL : undefined;

      if (apiKey?.trim()) {
        try {
          const reply = await chatWithOpenAI(prompt, { apiKey, baseUrl, model });
          return { reply };
        } catch (err) {
          console.warn(`${isKoboi ? "KoboiLLM" : "OpenAI"} chat failed, trying Gemini as fallback:`, err);
          lastError = err instanceof Error ? err : new Error(String(err));
        }
      }
      if (process.env.GEMINI_API_KEY?.trim()) {
        try {
          const reply = await chatWithGemini(prompt);
          return { reply };
        } catch (err) {
          console.error("Gemini chat fallback failed:", err);
          lastError = err instanceof Error ? err : new Error(String(err));
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
          lastError = err instanceof Error ? err : new Error(String(err));
        }
      }
      if (process.env.OPENAI_API_KEY?.trim()) {
        try {
          const reply = await chatWithOpenAI(prompt);
          return { reply };
        } catch (err) {
          console.error("OpenAI chat fallback failed:", err);
          lastError = err instanceof Error ? err : new Error(String(err));
        }
      }
    }

    throw (
      lastError ||
      new Error(
        "API AI belum dikonfigurasi di server. Tambahkan OPENAI_API_KEY atau GEMINI_API_KEY ke file .env lalu restart server.",
      )
    );
  });
