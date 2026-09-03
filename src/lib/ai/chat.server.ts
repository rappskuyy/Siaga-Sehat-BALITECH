import { createServerFn } from "@tanstack/react-start";

const SYSTEM_PROMPT =
  'Kamu adalah asisten kesehatan virtual bernama "SiagaSehat AI". Kamu melakukan konsultasi kesehatan interaktif dalam Bahasa Indonesia yang jelas, singkat, dan mudah dipahami.\n\n' +
  "ATURAN PERCAKAPAN:\n" +
  "- Jika pengguna baru menyebutkan gejala atau bagian tubuh yang sakit, gali informasi penting SATU per SATU (jangan tanya semua sekaligus): usia, sudah berapa lama gejala dirasakan, seberapa parah, gejala penyerta, riwayat penyakit/alergi/obat yang sedang dikonsumsi.\n" +
  '- Setelah informasi cukup (idealnya setelah 2-4 pertanyaan), berikan ringkasan terstruktur dengan judul: "Preliminary Analysis", "Risk Assessment", dan "Health Recommendation".\n' +
  "- Pada Health Recommendation, sertakan saran obat umum/OTC dan alternatif herbal yang aman bila relevan, serta kapan harus segera ke dokter/IGD.\n" +
  '- Jangan pernah membuat diagnosis pasti 100%, gunakan bahasa "kemungkinan", "bisa jadi", "perlu dipastikan oleh dokter".\n' +
  "- Jika ada tanda bahaya (nyeri dada hebat, sesak napas berat, pendarahan hebat, penurunan kesadaran, dll), segera sarankan ke IGD tanpa menunggu info lain.\n" +
  "- Jawaban singkat, ramah, dan empatik.";

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
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 800,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenAI/KoboiLLM error ${res.status}: ${txt.slice(0, 200)}`);
  }

  const payload = await res.json();
  const text = payload.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI/KoboiLLM tidak mengembalikan respon valid.");

  return text;
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

    if (provider === "openai") {
      if (process.env.OPENAI_API_KEY?.trim()) {
        try {
          const reply = await chatWithOpenAI(prompt);
          return { reply };
        } catch (err) {
          console.warn("OpenAI/KoboiLLM chat failed, trying Gemini as fallback:", err);
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
