import { createServerFn } from "@tanstack/react-start";

const SYSTEM_PROMPT =
  'Kamu adalah asisten kesehatan virtual bernama "SiagaSehat AI". Kamu melakukan konsultasi kesehatan interaktif dalam Bahasa Indonesia yang jelas, empatik, praktis, dan mudah dipindai.\n\n' +
  "ATURAN PERCAKAPAN:\n" +
  "- Pada awal konsultasi, jangan langsung memberikan solusi atau rekomendasi. Gali informasi secara bertahap dan tanyakan hanya SATU hal per balasan: pertama umur pengguna, lalu keluhan/gejala lain yang menyertai, lalu durasi dan tingkat keparahan bila belum diketahui.\n" +
  "- Setelah umur dan keluhan penyerta sudah diketahui, barulah berikan solusi awal yang aman. Jika pengguna menyebut tanda bahaya, lewati tahap tanya jawab dan arahkan ke IGD.\n" +
  "- Jika pengguna menekan pertanyaan lanjutan seperti solusi, penyebab, pantangan, obat, atau langkah selanjutnya setelah informasi cukup, jawab bagian yang diminta secara langsung.\n" +
  "- Untuk keluhan yang sudah cukup jelas, gunakan format wajib berikut (sesuaikan bagian yang relevan):\n" +
  "  ANALISIS AWAL: kemungkinan kondisi dan alasan singkat.\n" +
  "  KEMUNGKINAN PENYEBAB: 2-4 penyebab yang masuk akal.\n" +
  "  YANG BISA DILAKUKAN: langkah perawatan mandiri yang konkret dan berurutan.\n" +
  "  OBAT/REKOMENDASI: opsi obat bebas hanya bila relevan, tulis peringatan kontraindikasi dan jangan mengarang dosis; sertakan alternatif non-obat bila aman.\n" +
  "  PANTANGAN: hal yang perlu dihindari.\n" +
  "  KAPAN KE DOKTER: tanda bahaya atau batas waktu mencari bantuan medis.\n" +
  "- Jika pertanyaan hanya meminta satu hal seperti penyebab atau pantangan, jawab bagian itu secara langsung lalu tambahkan langkah aman dan kapan perlu ke dokter.\n" +
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
              maxOutputTokens: 1500,
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

function extractChatCompletionText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, any>;

  if (typeof p.text === "string" && p.text.trim()) return p.text;
  if (typeof p.response === "string" && p.response.trim()) return p.response;
  if (typeof p.content === "string" && p.content.trim()) return p.content;

  const message = p.choices?.[0]?.message;
  const content = message?.content;
  if (typeof content === "string" && content.trim()) return content;

  if (Array.isArray(content)) {
    const text = content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          const val = part.text;
          return typeof val === "string" ? val : "";
        }
        return "";
      })
      .join("")
      .trim();
    if (text) return text;
  }

  const choiceText = p.choices?.[0]?.text;
  if (typeof choiceText === "string" && choiceText.trim()) return choiceText;

  return null;
}

async function chatWithOpenAI(
  prompt: string,
  config: { apiKey?: string; baseUrl?: string; model?: string } = {},
): Promise<string> {
  const apiKey = (config.apiKey || process.env.OPENAI_API_KEY || process.env.KOBOILLM_API_KEY)?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY belum dikonfigurasi di server.");

  const model = config.model || process.env.OPENAI_MODEL || process.env.KOBOILLM_MODEL || "gpt-4o-mini";
  const baseUrl = config.baseUrl || getOpenAIBaseUrl();
  const endpoint = baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl}/chat/completions`;

  const res = await fetch(endpoint, {
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
  const rawText = extractChatCompletionText(payload);
  if (!rawText) throw new Error("OpenAI/KoboiLLM tidak mengembalikan respon valid.");

  // Clean <think>...</think> tags if reasoning model is used
  const cleaned = rawText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  return cleaned || rawText;
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
