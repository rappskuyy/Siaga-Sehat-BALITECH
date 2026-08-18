import { createServerFn } from "@tanstack/react-start";

export const chatWithAI = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Invalid input");
    const d = data as { prompt?: unknown };
    if (!d.prompt || typeof d.prompt !== "string") throw new Error("prompt is required");
    return d;
  })
  .handler(async ({ data }) => {
    const { prompt } = data as { prompt: string };

    const openaiKey = process.env.OPENAI_API_KEY?.trim();
    const geminiKey = process.env.GEMINI_API_KEY?.trim();

    const SYSTEM_PROMPT =
      'Kamu adalah asisten kesehatan virtual bernama "SiagaSehat AI". Kamu melakukan konsultasi kesehatan interaktif dalam Bahasa Indonesia yang jelas, singkat, dan mudah dipahami.\n\n' +
      "ATURAN PERCAKAPAN:\n" +
      "- Jika pengguna baru menyebutkan gejala atau bagian tubuh yang sakit, gali informasi penting SATU per SATU (jangan tanya semua sekaligus): usia, sudah berapa lama gejala dirasakan, seberapa parah, gejala penyerta, riwayat penyakit/alergi/obat yang sedang dikonsumsi.\n" +
      '- Setelah informasi cukup (idealnya setelah 2-4 pertanyaan), berikan ringkasan terstruktur dengan judul: "Preliminary Analysis", "Risk Assessment", dan "Health Recommendation".\n' +
      "- Pada Health Recommendation, sertakan saran obat umum/OTC dan alternatif herbal yang aman bila relevan, serta kapan harus segera ke dokter/IGD.\n" +
      '- Jangan pernah membuat diagnosis pasti 100% — gunakan bahasa "kemungkinan", "bisa jadi", "perlu dipastikan oleh dokter".\n' +
      "- Jika ada tanda bahaya (nyeri dada hebat, sesak napas berat, pendarahan hebat, penurunan kesadaran, dll), segera sarankan ke IGD tanpa menunggu info lain.\n" +
      "- Jawaban singkat, ramah, dan empatik.";

    if (openaiKey) {
      const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
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
        throw new Error(`OpenAI error ${res.status}: ${txt.slice(0, 300)}`);
      }
      const payload = await res.json();
      const content = payload.choices?.[0]?.message?.content;
      return { reply: content ?? "" };
    }

    if (geminiKey) {
      const models = ["gemini-2.5-flash", "gemini-1.5"];
      for (const model of models) {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": geminiKey,
            },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 800 },
            }),
          },
        );

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          // try next model
          continue;
        }

        const payload = await res.json();
        const text =
          payload.candidates?.[0]?.content?.parts
            ?.map((p: { text?: string }) => p.text ?? "")
            .join("") || "";
        return { reply: text };
      }
      throw new Error("Gemini API tidak dapat dihubungi");
    }

    throw new Error(
      "Tidak ada API key AI yang dikonfigurasi. Tambahkan OPENAI_API_KEY atau GEMINI_API_KEY di .env",
    );
  });
